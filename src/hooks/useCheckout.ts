/**
 * CAMADA DE APRESENTAÇÃO — Hooks React (ponte entre View e Model)
 *
 * Responsabilidade: conectar os componentes React (View) à Camada de Negócio (Model).
 * Gerencia cache, estado assíncrono e notificações de UI.
 * Não contém regras de negócio nem queries diretas ao banco.
 *
 * Fluxo: View → useCheckout (hook) → Model → Data → Supabase
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

// Camada de Negócio (Model)
import * as ProdutosModel from "@/model/produtos.model";
import * as ClientesModel from "@/model/clientes.model";
import * as PedidosModel from "@/model/pedidos.model";

// Camada de Dados (Data) — apenas para cupons (somente leitura)
import { findCuponsAtivos } from "@/data/cupons.repository";

export type Produto = Tables<"produtos">;
export type Pedido = Tables<"pedidos">;
export type ItemPedido = Tables<"itens_pedido">;
export type Cliente = Tables<"clientes">;
export type Cupom = Tables<"cupons">;
export type HistoricoStatus = Tables<"historico_status_pedido">;

export type StatusPedido = PedidosModel.StatusPedido;
export type Endereco = PedidosModel.Endereco;

// ============================================================
// PRODUTOS
// ============================================================

export function useProdutos(busca?: string) {
  return useQuery({
    queryKey: ["produtos", busca],
    queryFn: () => ProdutosModel.listarProdutos(busca),
  });
}

export function useCriarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ nome, preco }: { nome: string; preco: number }) =>
      ProdutosModel.criarProduto(nome, preco),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produtos"] });
      toast({ title: "Produto criado com sucesso!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

// ============================================================
// CLIENTES
// ============================================================

export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: () => ClientesModel.listarClientes(),
  });
}

export function useCriarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      nome,
      email,
      telefone,
    }: {
      nome: string;
      email: string;
      telefone?: string;
    }) => ClientesModel.criarCliente(nome, email, telefone),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast({ title: "Cliente cadastrado com sucesso!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

// ============================================================
// CUPONS
// ============================================================

export function useCupons() {
  return useQuery({
    queryKey: ["cupons"],
    queryFn: () => findCuponsAtivos(),
  });
}

// ============================================================
// PEDIDOS
// ============================================================

export function usePedidos(filtros?: { status?: string; clienteId?: string }) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () =>
      PedidosModel.listarPedidos(
        filtros as { status?: StatusPedido; clienteId?: string }
      ),
  });
}

export function useHistoricoStatus(pedidoId: string | null) {
  return useQuery({
    queryKey: ["historico_status", pedidoId],
    enabled: !!pedidoId,
    queryFn: () => PedidosModel.listarHistoricoStatus(pedidoId!),
  });
}

export function useCriarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: { clienteId?: string }) =>
      PedidosModel.criarPedido(params?.clienteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Pedido criado!", description: "Status: ABERTO" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

export function useAdicionarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      pedidoId,
      produtoId,
      quantidade,
    }: {
      pedidoId: string;
      produtoId: string;
      quantidade: number;
    }) => PedidosModel.adicionarItemAoPedido(pedidoId, produtoId, quantidade),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Item adicionado!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

export function useFinalizarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pedidoId: string) => PedidosModel.finalizarPedido(pedidoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Pedido finalizado!" });
    },
    onError: (e: Error) => {
      toast({
        title: "Erro ao finalizar",
        description: e.message,
        variant: "destructive",
      });
    },
  });
}

export function useCancelarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pedidoId: string) => PedidosModel.cancelarPedido(pedidoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Pedido cancelado", description: "O pedido foi cancelado." });
    },
    onError: (e: Error) => {
      toast({
        title: "Erro ao cancelar",
        description: e.message,
        variant: "destructive",
      });
    },
  });
}

export function useAplicarCupom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      pedidoId,
      cupomCodigo,
    }: {
      pedidoId: string;
      cupomCodigo: string;
    }) => PedidosModel.aplicarCupomAoPedido(pedidoId, cupomCodigo),
    onSuccess: ({ cupom }) => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      const descricao =
        cupom.tipo === "PERCENTUAL"
          ? `${cupom.valor}% de desconto aplicado!`
          : `R$ ${Number(cupom.valor).toFixed(2)} de desconto aplicado!`;
      toast({ title: `Cupom ${cupom.codigo} aplicado!`, description: descricao });
    },
    onError: (e: Error) => {
      toast({
        title: "Erro ao aplicar cupom",
        description: e.message,
        variant: "destructive",
      });
    },
  });
}

export function useRemoverCupom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pedidoId: string) => PedidosModel.removerCupomDoPedido(pedidoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Cupom removido" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

export function useSalvarEndereco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      pedidoId,
      endereco,
    }: {
      pedidoId: string;
      endereco: Endereco;
    }) => PedidosModel.salvarEndereco(pedidoId, endereco),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Endereço salvo com sucesso!" });
    },
    onError: (e: Error) => {
      toast({
        title: "Erro ao salvar endereço",
        description: e.message,
        variant: "destructive",
      });
    },
  });
}

export function useAssociarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      pedidoId,
      clienteId,
    }: {
      pedidoId: string;
      clienteId: string;
    }) => PedidosModel.associarCliente(pedidoId, clienteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Cliente associado ao pedido!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

// ============================================================
// MÉTRICAS
// ============================================================

export function useMetricas() {
  return useQuery({
    queryKey: ["metricas"],
    queryFn: () => PedidosModel.calcularMetricas(),
  });
}
