-- ============================================================
-- MIGRAÇÃO V2 - Evolução do Mini Checkout
-- ============================================================

-- Atualizar constraint de status do pedido para incluir CANCELADO
ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check;
ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_status_check
  CHECK (status IN ('ABERTO', 'FINALIZADO', 'CANCELADO'));

-- ============================================================
-- TABELA: clientes
-- ============================================================
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- TABELA: cupons
-- ============================================================
CREATE TABLE public.cupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('PERCENTUAL', 'FIXO')),
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- TABELA: historico_status_pedido
-- ============================================================
CREATE TABLE public.historico_status_pedido (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('ABERTO', 'FINALIZADO', 'CANCELADO')),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- ADICIONAR COLUNAS A pedidos
-- ============================================================
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id),
  ADD COLUMN IF NOT EXISTS cupom_codigo TEXT,
  ADD COLUMN IF NOT EXISTS desconto NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Endereço de entrega
  ADD COLUMN IF NOT EXISTS endereco_rua TEXT,
  ADD COLUMN IF NOT EXISTS endereco_numero TEXT,
  ADD COLUMN IF NOT EXISTS endereco_complemento TEXT,
  ADD COLUMN IF NOT EXISTS endereco_bairro TEXT,
  ADD COLUMN IF NOT EXISTS endereco_cidade TEXT,
  ADD COLUMN IF NOT EXISTS endereco_cep TEXT;

-- ============================================================
-- CUPONS PADRÃO PARA TESTE
-- ============================================================
INSERT INTO public.cupons (codigo, tipo, valor) VALUES
  ('CUPOM10', 'PERCENTUAL', 10),
  ('DESCONTO20', 'FIXO', 20),
  ('PROMO15', 'PERCENTUAL', 15),
  ('FRETE10', 'FIXO', 10);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_status_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público cupons" ON public.cupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público historico" ON public.historico_status_pedido FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- FUNÇÃO: recalcular_total_com_desconto
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalcular_total_pedido()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(10,2);
  v_desconto NUMERIC(10,2);
  v_cupom_tipo TEXT;
  v_cupom_valor NUMERIC(10,2);
  v_cupom_codigo TEXT;
BEGIN
  -- Calcular subtotal
  SELECT COALESCE(SUM(p.preco * i.quantidade), 0)
  INTO v_subtotal
  FROM public.itens_pedido i
  JOIN public.produtos p ON p.id = i.produto_id
  WHERE i.pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id);

  -- Buscar cupom do pedido
  SELECT cupom_codigo INTO v_cupom_codigo
  FROM public.pedidos
  WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);

  v_desconto := 0;

  IF v_cupom_codigo IS NOT NULL THEN
    SELECT tipo, valor INTO v_cupom_tipo, v_cupom_valor
    FROM public.cupons
    WHERE codigo = v_cupom_codigo AND ativo = true;

    IF v_cupom_tipo = 'PERCENTUAL' THEN
      v_desconto := ROUND(v_subtotal * v_cupom_valor / 100, 2);
    ELSIF v_cupom_tipo = 'FIXO' THEN
      v_desconto := LEAST(v_cupom_valor, v_subtotal);
    END IF;
  END IF;

  UPDATE public.pedidos
  SET
    subtotal = v_subtotal,
    desconto = v_desconto,
    total = GREATEST(v_subtotal - v_desconto, 0)
  WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- FUNÇÃO: registrar_historico_status
-- ============================================================
CREATE OR REPLACE FUNCTION public.registrar_historico_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas registra quando o status muda
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.historico_status_pedido (pedido_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- FUNÇÃO: recalcular_total_ao_aplicar_cupom
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalcular_total_ao_mudar_pedido()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(10,2);
  v_desconto NUMERIC(10,2);
  v_cupom_tipo TEXT;
  v_cupom_valor NUMERIC(10,2);
BEGIN
  IF OLD.cupom_codigo IS DISTINCT FROM NEW.cupom_codigo THEN
    SELECT COALESCE(SUM(p.preco * i.quantidade), 0)
    INTO v_subtotal
    FROM public.itens_pedido i
    JOIN public.produtos p ON p.id = i.produto_id
    WHERE i.pedido_id = NEW.id;

    v_desconto := 0;

    IF NEW.cupom_codigo IS NOT NULL THEN
      SELECT tipo, valor INTO v_cupom_tipo, v_cupom_valor
      FROM public.cupons
      WHERE codigo = NEW.cupom_codigo AND ativo = true;

      IF v_cupom_tipo = 'PERCENTUAL' THEN
        v_desconto := ROUND(v_subtotal * v_cupom_valor / 100, 2);
      ELSIF v_cupom_tipo = 'FIXO' THEN
        v_desconto := LEAST(v_cupom_valor, v_subtotal);
      END IF;
    END IF;

    NEW.subtotal := v_subtotal;
    NEW.desconto := v_desconto;
    NEW.total := GREATEST(v_subtotal - v_desconto, 0);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Registrar histórico ao mudar status
CREATE TRIGGER registrar_historico_status_trigger
AFTER UPDATE OF status ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.registrar_historico_status();

-- Registrar status inicial ao criar pedido
CREATE OR REPLACE FUNCTION public.registrar_historico_inicial()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.historico_status_pedido (pedido_id, status)
  VALUES (NEW.id, NEW.status);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER registrar_historico_inicial_trigger
AFTER INSERT ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.registrar_historico_inicial();

-- Recalcular total ao mudar cupom
CREATE TRIGGER recalcular_total_cupom_trigger
BEFORE UPDATE OF cupom_codigo ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.recalcular_total_ao_mudar_pedido();
