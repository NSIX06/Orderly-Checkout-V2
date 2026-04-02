-- Remove a política restritiva existente e cria uma permissiva para leitura
DROP POLICY IF EXISTS "Leitura restrita de logs" ON public."tblLogs";

CREATE POLICY "Permitir leitura de logs" ON public."tblLogs"
  FOR SELECT USING (true);
