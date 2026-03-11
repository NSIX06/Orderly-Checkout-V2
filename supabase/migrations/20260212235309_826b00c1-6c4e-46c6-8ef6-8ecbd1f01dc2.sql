
--*Tabela de produtos
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

--*Tabela de pedidos
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'FINALIZADO')),
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

--*Tabela de itens do pedido
CREATE TABLE public.itens_pedido (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  quantidade INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS habilitado mas com acesso público (sistema sem auth)
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (sem autenticação neste mini sistema)
CREATE POLICY "Acesso público produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público itens" ON public.itens_pedido FOR ALL USING (true) WITH CHECK (true);

-- Função para recalcular total do pedido
CREATE OR REPLACE FUNCTION public.recalcular_total_pedido()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.pedidos
  SET total = COALESCE((
    SELECT SUM(p.preco * i.quantidade)
    FROM public.itens_pedido i
    JOIN public.produtos p ON p.id = i.produto_id
    WHERE i.pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id)
  ), 0)
  WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para recalcular total
CREATE TRIGGER recalcular_total_insert
AFTER INSERT ON public.itens_pedido
FOR EACH ROW EXECUTE FUNCTION public.recalcular_total_pedido();

CREATE TRIGGER recalcular_total_delete
AFTER DELETE ON public.itens_pedido
FOR EACH ROW EXECUTE FUNCTION public.recalcular_total_pedido();
