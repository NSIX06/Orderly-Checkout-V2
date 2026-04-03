/**
 * CAMADA DE DADOS — Backlog de Tarefas
 *
 * Responsabilidade: consultas à tabela tblBacklog no Supabase.
 */
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type BacklogRow = Tables<"tblBacklog">;
export type StatusBacklog = "PENDENTE" | "EM_PROGRESSO" | "CONCLUIDO";
export type PrioridadeBacklog = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
export type TipoBacklog = "TAREFA" | "BUG" | "FEATURE" | "MELHORIA";

export async function findBacklogTarefas(): Promise<BacklogRow[]> {
  const { data, error } = await supabase
    .from("tblBacklog")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertBacklogTarefa(tarefa: {
  titulo: string;
  descricao?: string;
  prioridade: PrioridadeBacklog;
  tipo: TipoBacklog;
}): Promise<BacklogRow> {
  const { data, error } = await supabase
    .from("tblBacklog")
    .insert({ ...tarefa, status: "PENDENTE" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBacklogTarefa(
  id: string,
  campos: Partial<Pick<BacklogRow, "titulo" | "descricao" | "status" | "prioridade" | "tipo">>
): Promise<BacklogRow> {
  const { data, error } = await supabase
    .from("tblBacklog")
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBacklogTarefa(id: string): Promise<void> {
  const { error } = await supabase.from("tblBacklog").delete().eq("id", id);
  if (error) throw error;
}
