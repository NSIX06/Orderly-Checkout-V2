/**
 * CAMADA DE NEGÓCIO — Backlog de Tarefas
 *
 * Responsabilidade: validações e operações de negócio do backlog.
 */
import {
  findBacklogTarefas,
  insertBacklogTarefa,
  updateBacklogTarefa,
  deleteBacklogTarefa,
  type BacklogRow,
  type StatusBacklog,
  type PrioridadeBacklog,
  type TipoBacklog,
} from "@/data/backlog.repository";

export type { BacklogRow, StatusBacklog, PrioridadeBacklog, TipoBacklog };

export function validarTitulo(titulo: string): void {
  if (!titulo.trim()) throw new Error("Título é obrigatório");
  if (titulo.trim().length > 200)
    throw new Error("Título deve ter no máximo 200 caracteres");
}

export function validarStatus(status: string): asserts status is StatusBacklog {
  const validos: StatusBacklog[] = ["PENDENTE", "EM_PROGRESSO", "CONCLUIDO"];
  if (!validos.includes(status as StatusBacklog))
    throw new Error(`Status inválido: ${status}`);
}

export async function listarTarefas(): Promise<BacklogRow[]> {
  return findBacklogTarefas();
}

export async function criarTarefa(params: {
  titulo: string;
  descricao?: string;
  prioridade: PrioridadeBacklog;
  tipo: TipoBacklog;
}): Promise<BacklogRow> {
  validarTitulo(params.titulo);
  return insertBacklogTarefa(params);
}

export async function atualizarTarefa(
  id: string,
  campos: Partial<Pick<BacklogRow, "titulo" | "descricao" | "status" | "prioridade" | "tipo">>
): Promise<BacklogRow> {
  if (campos.titulo !== undefined) validarTitulo(campos.titulo);
  if (campos.status !== undefined) validarStatus(campos.status);
  return updateBacklogTarefa(id, campos);
}

export async function deletarTarefa(id: string): Promise<void> {
  return deleteBacklogTarefa(id);
}
