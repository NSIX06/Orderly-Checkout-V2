import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import * as BacklogModel from "@/model/backlog.model";

export type { BacklogRow, StatusBacklog, PrioridadeBacklog, TipoBacklog } from "@/model/backlog.model";

export function useBacklog() {
  return useQuery({
    queryKey: ["backlog"],
    queryFn: () => BacklogModel.listarTarefas(),
  });
}

export function useCriarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      titulo: string;
      descricao?: string;
      prioridade: BacklogModel.PrioridadeBacklog;
      tipo: BacklogModel.TipoBacklog;
    }) => BacklogModel.criarTarefa(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["backlog"] });
      toast({ title: "Tarefa criada!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

export function useAtualizarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      campos,
    }: {
      id: string;
      campos: Partial<Pick<BacklogModel.BacklogRow, "titulo" | "descricao" | "status" | "prioridade" | "tipo">>;
    }) => BacklogModel.atualizarTarefa(id, campos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["backlog"] });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

export function useDeletarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BacklogModel.deletarTarefa(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["backlog"] });
      toast({ title: "Tarefa removida" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}
