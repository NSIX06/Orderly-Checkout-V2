import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type LogRow = Tables<"tblLogs">;

export type FiltroLogs = {
  metodo?: string;
  faixaStatus?: "2xx" | "4xx" | "5xx";
  rota?: string;
};

export async function findLogs(filtros: FiltroLogs = {}): Promise<LogRow[]> {
  let query = supabase
    .from("tblLogs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (filtros.metodo) query = query.eq("metodo", filtros.metodo);
  if (filtros.rota) query = query.ilike("rota", `%${filtros.rota}%`);

  if (filtros.faixaStatus === "2xx") query = query.gte("status_code", 200).lt("status_code", 300);
  else if (filtros.faixaStatus === "4xx") query = query.gte("status_code", 400).lt("status_code", 500);
  else if (filtros.faixaStatus === "5xx") query = query.gte("status_code", 500);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export type LogErro24h = Pick<LogRow, "id" | "status_code" | "rota" | "created_at">;

export async function findLogsErros24h(): Promise<LogErro24h[]> {
  const limite = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("tblLogs")
    .select("id, status_code, rota, created_at")
    .gte("status_code", 500)
    .gte("created_at", limite);
  if (error) throw error;
  return data ?? [];
}

export async function aplicarFiltroFaixa(
  logs: LogRow[],
  faixa?: "2xx" | "4xx" | "5xx"
): Promise<LogRow[]> {
  if (!faixa) return logs;
  return logs.filter((l) => {
    if (faixa === "2xx") return l.status_code >= 200 && l.status_code < 300;
    if (faixa === "4xx") return l.status_code >= 400 && l.status_code < 500;
    if (faixa === "5xx") return l.status_code >= 500;
    return true;
  });
}
