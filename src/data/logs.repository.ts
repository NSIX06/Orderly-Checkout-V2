/**
 * CAMADA DE DADOS — Logs de API
 *
 * Responsabilidade: consultas à tabela tblLogs no Supabase.
 */
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
    .limit(200);

  if (filtros.metodo) query = query.eq("metodo", filtros.metodo);
  if (filtros.rota) query = query.ilike("rota", `%${filtros.rota}%`);

  const { data, error } = await query;
  if (error) throw error;

  if (!filtros.faixaStatus) return data ?? [];

  return (data ?? []).filter((l) => {
    if (filtros.faixaStatus === "2xx") return l.status_code >= 200 && l.status_code < 300;
    if (filtros.faixaStatus === "4xx") return l.status_code >= 400 && l.status_code < 500;
    if (filtros.faixaStatus === "5xx") return l.status_code >= 500;
    return true;
  });
}

export async function findLogsErros24h(): Promise<LogRow[]> {
  const limite = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("tblLogs")
    .select("id, status_code, rota, created_at")
    .gte("status_code", 500)
    .gte("created_at", limite);
  if (error) throw error;
  return (data ?? []) as unknown as LogRow[];
}
