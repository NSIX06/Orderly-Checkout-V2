-- ============================================================
-- MIGRAÇÃO: tblBacklog - Backlog de tarefas e funcionalidades
-- ============================================================

CREATE TABLE IF NOT EXISTS public."tblBacklog" (
  id          UUID                     NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      TEXT                     NOT NULL,
  descricao   TEXT,
  status      TEXT                     NOT NULL DEFAULT 'PENDENTE'
                CHECK (status IN ('PENDENTE', 'EM_PROGRESSO', 'CONCLUIDO')),
  prioridade  TEXT                     NOT NULL DEFAULT 'MEDIA'
                CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')),
  tipo        TEXT                     NOT NULL DEFAULT 'TAREFA'
                CHECK (tipo IN ('TAREFA', 'BUG', 'FEATURE', 'MELHORIA')),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public."tblBacklog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas operacoes em tblBacklog" ON public."tblBacklog"
  FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tbl_backlog_set_updated_at
BEFORE UPDATE ON public."tblBacklog"
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
