CREATE TABLE public."tblBacklog" (
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
  USING (true) WITH CHECK (true);
