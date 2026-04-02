import { supabase } from "@/integrations/supabase/client";
import type { LogEntry } from "./logs.types";

export async function insertLog(entry: LogEntry): Promise<void> {
  const { error } = await supabase.from("tblLogs").insert({
    rota: entry.rota,
    metodo: entry.metodo,
    status_code: entry.status_code,
    params: (entry.params ?? null) as never,
    body: (entry.body ?? null) as never,
    response: (entry.response ?? null) as never,
    ip: entry.ip ?? null,
    usuario_id: entry.usuario_id ?? null,
    mensagem_erro: entry.mensagem_erro ?? null,
  });
  if (error) throw error;
}
