-- ============================================================
-- MIGRAÇÃO: tblLogs - Registro automático de logs de API
-- ============================================================

CREATE TABLE public."tblLogs" (
  id            UUID                     NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rota          TEXT                     NOT NULL,
  metodo        TEXT                     NOT NULL CHECK (metodo IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  status_code   INTEGER                  NOT NULL,
  params        JSONB,
  body          JSONB,
  response      JSONB,
  ip            TEXT,
  usuario_id    TEXT,
  mensagem_erro TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public."tblLogs" ENABLE ROW LEVEL SECURITY;

-- Apenas inserção pública (o middleware grava sem autenticação do usuário final)
CREATE POLICY "Permitir insert de logs" ON public."tblLogs"
  FOR INSERT WITH CHECK (true);

-- Leitura restrita (somente via service_role / painel admin)
CREATE POLICY "Leitura restrita de logs" ON public."tblLogs"
  FOR SELECT USING (false);
