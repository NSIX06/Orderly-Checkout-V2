import { useState } from "react";
import {
  ShoppingCart, Plus, CheckCircle2, ChevronDown, ChevronUp,
  XCircle, MapPin, Tag, User, Filter, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  usePedidos, useCriarPedido, useAdicionarItem, useFinalizarPedido,
  useCancelarPedido, useProdutos, useClientes, useAssociarCliente,
} from "@/hooks/useCheckout";
import { CupomInput } from "./CupomInput";
import { EnderecoForm } from "./EnderecoForm";
import { HistoricoStatusBadge } from "./HistoricoStatusBadge";

type StatusFiltro = "TODOS" | "ABERTO" | "FINALIZADO" | "CANCELADO";

const statusBadge: Record<string, { label: string; className: string }> = {
  ABERTO:     { label: "ABERTO",      className: "bg-amber-100 text-amber-800 border-amber-200" },
  FINALIZADO: { label: "FINALIZADO",  className: "bg-green-100 text-green-800 border-green-200" },
  CANCELADO:  { label: "CANCELADO",   className: "bg-red-100 text-red-800 border-red-200" },
};

export function PedidosPanel() {
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("TODOS");
  const [clienteFiltro, setClienteFiltro] = useState<string>("TODOS");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"itens" | "endereco" | "cupom" | "historico">("itens");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [clienteNovoPedido, setClienteNovoPedido] = useState<string>("NENHUM");
  const [buscaProduto, setBuscaProduto] = useState("");

  const filtros = {
    status: statusFiltro !== "TODOS" ? statusFiltro : undefined,
    clienteId: clienteFiltro !== "TODOS" ? clienteFiltro : undefined,
  };

  const { data: pedidos, isLoading } = usePedidos(filtros);
  const { data: produtos } = useProdutos(buscaProduto);
  const { data: clientes } = useClientes();
  const criarPedido = useCriarPedido();
  const adicionarItem = useAdicionarItem();
  const finalizarPedido = useFinalizarPedido();
  const cancelarPedido = useCancelarPedido();
  const associarCliente = useAssociarCliente();

  const handleAddItem = (pedidoId: string) => {
    const qtd = parseInt(quantidade);
    if (!produtoId || isNaN(qtd) || qtd <= 0) return;
    adicionarItem.mutate(
      { pedidoId, produtoId, quantidade: qtd },
      { onSuccess: () => { setProdutoId(""); setQuantidade("1"); } }
    );
  };

  const handleCriarPedido = () => {
    criarPedido.mutate({
      clienteId: clienteNovoPedido !== "NENHUM" ? clienteNovoPedido : undefined,
    });
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Pedidos
            {pedidos && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                {pedidos.length}
              </span>
            )}
          </CardTitle>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="h-3 w-3" /> Filtrar:
            </div>
            <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro(v as StatusFiltro)}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os status</SelectItem>
                <SelectItem value="ABERTO">Abertos</SelectItem>
                <SelectItem value="FINALIZADO">Finalizados</SelectItem>
                <SelectItem value="CANCELADO">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            {clientes && clientes.length > 0 && (
              <Select value={clienteFiltro} onValueChange={setClienteFiltro}>
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os clientes</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Criar novo pedido */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/20 p-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label className="text-xs">Cliente do pedido (opcional)</Label>
            <Select value={clienteNovoPedido} onValueChange={setClienteNovoPedido}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NENHUM">Sem cliente</SelectItem>
                {clientes?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleCriarPedido}
            disabled={criarPedido.isPending}
            className="shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : pedidos && pedidos.length > 0 ? (
          <div className="space-y-3">
            {pedidos.map((pedido) => {
              const isAberto = pedido.status === "ABERTO";
              const isCancelado = pedido.status === "CANCELADO";
              const isExpanded = expanded === pedido.id;
              const itens = (pedido as any).itens_pedido || [];
              const cliente = (pedido as any).clientes;
              const cfg = statusBadge[pedido.status] || statusBadge.ABERTO;
              const subtotal = Number(pedido.subtotal ?? pedido.total);
              const desconto = Number(pedido.desconto ?? 0);
              const total = Number(pedido.total);
              const temEndereco = pedido.endereco_rua;

              return (
                <div
                  key={pedido.id}
                  className={`rounded-lg border overflow-hidden transition-all ${isCancelado ? "opacity-70 border-red-200" : "border-border hover:shadow-md"}`}
                >
                  {/* Header do pedido */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : pedido.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                        {cfg.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{pedido.id.slice(0, 8)}
                      </span>
                      {cliente && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />{cliente.nome}
                        </span>
                      )}
                      {temEndereco && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <MapPin className="h-3 w-3" />
                        </span>
                      )}
                      {pedido.cupom_codigo && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <Tag className="h-3 w-3" />{pedido.cupom_codigo}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {desconto > 0 && (
                          <p className="text-xs text-muted-foreground line-through">
                            R$ {subtotal.toFixed(2)}
                          </p>
                        )}
                        <span className="font-display font-bold text-lg">
                          R$ {total.toFixed(2)}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Conteúdo expandido */}
                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/10">
                      {/* Tabs de navegação */}
                      <div className="flex border-b border-border">
                        {(["itens", "endereco", "cupom", "historico"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
                              activeTab === tab
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {tab === "itens" && "Itens"}
                            {tab === "endereco" && "Endereço"}
                            {tab === "cupom" && "Cupom"}
                            {tab === "historico" && "Histórico"}
                          </button>
                        ))}
                      </div>

                      <div className="px-4 py-3 space-y-3">
                        {/* ABA: ITENS */}
                        {activeTab === "itens" && (
                          <div className="space-y-3">
                            {/* Resumo do pedido */}
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                Resumo
                              </p>
                              {/* Cliente */}
                              {cliente && (
                                <div className="flex justify-between text-sm py-0.5">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" /> Cliente
                                  </span>
                                  <span className="font-medium">{cliente.nome}</span>
                                </div>
                              )}
                              {/* Itens */}
                              {itens.length > 0 ? (
                                <div className="space-y-1 rounded-md border border-border bg-card p-2 my-1">
                                  {itens.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm py-0.5">
                                      <span>
                                        {item.produtos?.nome || "Produto"} × {item.quantidade}
                                      </span>
                                      <span className="text-muted-foreground">
                                        R$ {(Number(item.produtos?.preco || 0) * item.quantidade).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground py-1">Nenhum item adicionado.</p>
                              )}
                              {/* Totais */}
                              <div className="space-y-0.5 border-t border-border pt-2 mt-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Subtotal</span>
                                  <span>R$ {subtotal.toFixed(2)}</span>
                                </div>
                                {desconto > 0 && (
                                  <div className="flex justify-between text-sm text-green-600">
                                    <span className="flex items-center gap-1">
                                      <Tag className="h-3 w-3" /> Desconto ({pedido.cupom_codigo})
                                    </span>
                                    <span>- R$ {desconto.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
                                  <span>Total</span>
                                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                                </div>
                              </div>
                              {/* Endereço resumo */}
                              {temEndereco && (
                                <div className="rounded border border-border bg-card p-2 mt-2">
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                    <MapPin className="h-3 w-3" /> Entrega
                                  </p>
                                  <p className="text-xs">
                                    {pedido.endereco_rua}, {pedido.endereco_numero}
                                    {pedido.endereco_complemento && ` – ${pedido.endereco_complemento}`}
                                    {" · "}{pedido.endereco_bairro}, {pedido.endereco_cidade}
                                    {pedido.endereco_cep && ` · ${pedido.endereco_cep}`}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Adicionar item (somente ABERTO) */}
                            {isAberto && (
                              <div className="space-y-2 rounded-md border border-border bg-card p-3">
                                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                  Adicionar Item
                                </p>
                                {/* Busca de produto */}
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                  <Input
                                    className="pl-8 text-sm"
                                    placeholder="Buscar produto..."
                                    value={buscaProduto}
                                    onChange={(e) => setBuscaProduto(e.target.value)}
                                  />
                                </div>
                                <div className="grid grid-cols-[1fr_80px] gap-2">
                                  <Select value={produtoId} onValueChange={setProdutoId}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o produto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {produtos?.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                          {p.nome} — R$ {Number(p.preco).toFixed(2)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(e.target.value)}
                                    placeholder="Qtd"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddItem(pedido.id)}
                                  disabled={adicionarItem.isPending || !produtoId}
                                  className="w-full"
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Adicionar
                                </Button>
                              </div>
                            )}

                            {/* Associar cliente (se não tiver) */}
                            {isAberto && !cliente && clientes && clientes.length > 0 && (
                              <AssociarClienteInline pedidoId={pedido.id} clientes={clientes} />
                            )}

                            {/* Botões de ação */}
                            <div className="flex gap-2">
                              {isAberto && (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => finalizarPedido.mutate(pedido.id)}
                                    disabled={finalizarPedido.isPending || itens.length === 0}
                                    className="flex-1 border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Finalizar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => cancelarPedido.mutate(pedido.id)}
                                    disabled={cancelarPedido.isPending}
                                    className="flex-1 border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ABA: ENDEREÇO */}
                        {activeTab === "endereco" && (
                          isAberto ? (
                            <EnderecoForm
                              pedidoId={pedido.id}
                              enderecoAtual={{
                                rua: pedido.endereco_rua,
                                numero: pedido.endereco_numero,
                                complemento: pedido.endereco_complemento,
                                bairro: pedido.endereco_bairro,
                                cidade: pedido.endereco_cidade,
                                cep: pedido.endereco_cep,
                              }}
                            />
                          ) : (
                            temEndereco ? (
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> Endereço de Entrega
                                </p>
                                <div className="rounded border border-border bg-card p-3 text-sm space-y-0.5">
                                  <p>{pedido.endereco_rua}, {pedido.endereco_numero}</p>
                                  {pedido.endereco_complemento && <p>{pedido.endereco_complemento}</p>}
                                  <p>{pedido.endereco_bairro} — {pedido.endereco_cidade}</p>
                                  {pedido.endereco_cep && <p className="text-muted-foreground">{pedido.endereco_cep}</p>}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Nenhum endereço informado.</p>
                            )
                          )
                        )}

                        {/* ABA: CUPOM */}
                        {activeTab === "cupom" && (
                          isAberto ? (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                                <Tag className="h-3 w-3" /> Cupom de Desconto
                              </p>
                              <CupomInput pedidoId={pedido.id} cupomAtual={pedido.cupom_codigo} />
                              <p className="text-xs text-muted-foreground">
                                Cupons disponíveis: CUPOM10, DESCONTO20, PROMO15, FRETE10
                              </p>
                            </div>
                          ) : (
                            pedido.cupom_codigo ? (
                              <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                                <Tag className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">
                                  Cupom <strong>{pedido.cupom_codigo}</strong> aplicado
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Nenhum cupom aplicado.</p>
                            )
                          )
                        )}

                        {/* ABA: HISTÓRICO */}
                        {activeTab === "historico" && (
                          <HistoricoStatusBadge pedidoId={pedido.id} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {statusFiltro !== "TODOS" || clienteFiltro !== "TODOS"
              ? "Nenhum pedido encontrado com os filtros selecionados."
              : "Nenhum pedido criado."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Sub-componente inline para associar cliente
function AssociarClienteInline({ pedidoId, clientes }: { pedidoId: string; clientes: any[] }) {
  const associarCliente = useAssociarCliente();
  const [clienteId, setClienteId] = useState("");

  return (
    <div className="flex gap-2 items-end rounded-md border border-dashed border-border p-2">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">Associar cliente</Label>
        <Select value={clienteId} onValueChange={setClienteId}>
          <SelectTrigger className="mt-1 h-8 text-xs">
            <SelectValue placeholder="Selecionar cliente..." />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={!clienteId || associarCliente.isPending}
        onClick={() => associarCliente.mutate({ pedidoId, clienteId })}
        className="h-8 text-xs"
      >
        Associar
      </Button>
    </div>
  );
}
