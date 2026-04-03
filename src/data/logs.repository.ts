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

/**
 * Busca logs com filtros opcionais.
 *
 * IMPORTANTE: Busca no máximo 200 registros do banco (ordenados por created_at DESC).
 * O filtro `faixaStatus` é aplicado no cliente após a busca. Se a tabela tiver muitos
 * registros além do limite de 200, os resultados filtrados podem estar incompletos.
 */
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
