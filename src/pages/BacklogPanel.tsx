import { useState } from "react";
import { Plus, Trash2, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useBacklog, useCriarTarefa, useAtualizarTarefa, useDeletarTarefa,
  type BacklogRow, type StatusBacklog, type PrioridadeBacklog, type TipoBacklog,
} from "@/hooks/useBacklog";

const COLUNAS: { status: StatusBacklog; label: string; cor: string }[] = [
  { status: "PENDENTE",    label: "Pendente",    cor: "text-amber-600" },
  { status: "EM_PROGRESSO", label: "Em Progresso", cor: "text-blue-600" },
  { status: "CONCLUIDO",   label: "Concluído",   cor: "text-green-600" },
];

const prioridadeCor: Record<PrioridadeBacklog, string> = {
  BAIXA:   "bg-slate-100 text-slate-700 border-slate-200",
  MEDIA:   "bg-blue-100 text-blue-700 border-blue-200",
  ALTA:    "bg-amber-100 text-amber-700 border-amber-200",
  CRITICA: "bg-red-100 text-red-700 border-red-200",
};

const tipoCor: Record<TipoBacklog, string> = {
  TAREFA:   "bg-slate-100 text-slate-600",
  BUG:      "bg-red-50 text-red-600",
  FEATURE:  "bg-purple-50 text-purple-600",
  MELHORIA: "bg-teal-50 text-teal-600",
};

interface FormState {
  titulo: string;
  descricao: string;
  prioridade: PrioridadeBacklog;
  tipo: TipoBacklog;
  status: StatusBacklog;
}

const formInicial: FormState = {
  titulo: "",
  descricao: "",
  prioridade: "MEDIA",
  tipo: "TAREFA",
  status: "PENDENTE",
};

export function BacklogPanel() {
  const { data: tarefas, isLoading } = useBacklog();
  const criarTarefa = useCriarTarefa();
  const atualizarTarefa = useAtualizarTarefa();
  const deletarTarefa = useDeletarTarefa();

  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<BacklogRow | null>(null);
  const [form, setForm] = useState<FormState>(formInicial);

  function abrirNova() {
    setTarefaEditando(null);
    setForm(formInicial);
    setModalAberto(true);
  }

  function abrirEdicao(tarefa: BacklogRow) {
    setTarefaEditando(tarefa);
    setForm({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao ?? "",
      prioridade: tarefa.prioridade as PrioridadeBacklog,
      tipo: tarefa.tipo as TipoBacklog,
      status: tarefa.status as StatusBacklog,
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setTarefaEditando(null);
  }

  function handleSalvar() {
    if (!form.titulo.trim()) return;
    if (tarefaEditando) {
      atualizarTarefa.mutate(
        { id: tarefaEditando.id, campos: { ...form, descricao: form.descricao || undefined } },
        { onSuccess: fecharModal }
      );
    } else {
      criarTarefa.mutate(
        { titulo: form.titulo, descricao: form.descricao || undefined, prioridade: form.prioridade, tipo: form.tipo },
        { onSuccess: fecharModal }
      );
    }
  }

  function handleDeletar(id: string) {
    if (confirm("Remover esta tarefa?")) deletarTarefa.mutate(id);
  }

  const tarefasPorStatus = (status: StatusBacklog) =>
    (tarefas ?? []).filter((t) => t.status === status);

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-display">
              <CheckSquare className="h-5 w-5 text-primary" />
              Backlog de Tarefas
            </CardTitle>
            <Button size="sm" onClick={abrirNova}>
              <Plus className="mr-1 h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {COLUNAS.map(({ status, label, cor }) => (
                <div key={status} className="flex flex-col gap-2">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${cor}`}>
                    {label}
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      ({tarefasPorStatus(status).length})
                    </span>
                  </p>
                  {tarefasPorStatus(status).map((tarefa) => (
                    <div
                      key={tarefa.id}
                      onClick={() => abrirEdicao(tarefa)}
                      className="cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{tarefa.titulo}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletar(tarefa.id); }}
                          className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {tarefa.descricao && (
                        <p className="mb-2 text-xs text-muted-foreground line-clamp-2">{tarefa.descricao}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className={`text-[10px] ${prioridadeCor[tarefa.prioridade as PrioridadeBacklog]}`}>
                          {tarefa.prioridade}
                        </Badge>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${tipoCor[tarefa.tipo as TipoBacklog]}`}>
                          {tarefa.tipo}
                        </span>
                      </div>
                    </div>
                  ))}
                  {tarefasPorStatus(status).length === 0 && (
                    <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                      Sem tarefas
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal criar/editar */}
      <Dialog open={modalAberto} onOpenChange={(open) => { if (!open) fecharModal(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tarefaEditando ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Título *</Label>
              <Input
                className="mt-1"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Descreva a tarefa..."
              />
            </div>

            <div>
              <Label className="text-xs">Descrição</Label>
              <Input
                className="mt-1"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Detalhes opcionais..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Prioridade</Label>
                <Select value={form.prioridade} onValueChange={(v) => setForm((f) => ({ ...f, prioridade: v as PrioridadeBacklog }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAIXA">Baixa</SelectItem>
                    <SelectItem value="MEDIA">Média</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="CRITICA">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as TipoBacklog }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TAREFA">Tarefa</SelectItem>
                    <SelectItem value="BUG">Bug</SelectItem>
                    <SelectItem value="FEATURE">Feature</SelectItem>
                    <SelectItem value="MELHORIA">Melhoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {tarefaEditando && (
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as StatusBacklog }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="EM_PROGRESSO">Em Progresso</SelectItem>
                    <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={fecharModal}>Cancelar</Button>
            <Button
              onClick={handleSalvar}
              disabled={!form.titulo.trim() || criarTarefa.isPending || atualizarTarefa.isPending}
            >
              {tarefaEditando ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
