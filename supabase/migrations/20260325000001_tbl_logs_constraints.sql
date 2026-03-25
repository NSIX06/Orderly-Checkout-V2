-- ============================================================
-- MIGRAÇÃO: Integridade e performance da tblLogs
-- ============================================================

-- Garante que status_code seja sempre um valor HTTP válido (100–599)
ALTER TABLE public."tblLogs"
  ADD CONSTRAINT tbl_logs_status_code_check
  CHECK (status_code >= 100 AND status_code <= 599);

-- Garante que metodo seja sempre um verbo HTTP conhecido
-- (a constraint já existe via CHECK na criação; esta é redundante mas explícita)
ALTER TABLE public."tblLogs"
  DROP CONSTRAINT IF EXISTS "tblLogs_metodo_check";

ALTER TABLE public."tblLogs"
  ADD CONSTRAINT "tblLogs_metodo_check"
  CHECK (metodo IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE'));

-- Índice para consultas por rota e data (auditoria / dashboards)
CREATE INDEX IF NOT EXISTS idx_tbl_logs_rota_created_at
  ON public."tblLogs" (rota, created_at DESC);

-- Índice para filtrar por status_code (ex.: buscar todos os 5xx)
CREATE INDEX IF NOT EXISTS idx_tbl_logs_status_code
  ON public."tblLogs" (status_code);

-- Índice para rastrear ações de um usuário específico
CREATE INDEX IF NOT EXISTS idx_tbl_logs_usuario_id
  ON public."tblLogs" (usuario_id)
  WHERE usuario_id IS NOT NULL;
