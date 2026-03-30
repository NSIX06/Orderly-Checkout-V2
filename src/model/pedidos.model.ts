/**
 * CAMADA DE NEGÓCIO — Pedidos
 *
 * Responsabilidade: regras de negócio, validações e cálculos do sistema de pedidos.
 * Usa a Camada de Dados (repository) para persistência.
 * Não acessa o banco diretamente.
 */
import {
  findPedidos,
  findPedidoStatus,
  findHistoricoStatus,
  findPedidosParaMetricas,
  insertPedido,
  insertItemPedido,
  updatePedidoStatus,
  updatePedidoCupom,
  updatePedidoEndereco,
  updatePedidoCliente,
} from "@/data/pedidos.repository";
import { findCupomPorCodigo } from "@/data/cupons.repository";
import { verificarProdutoExiste } from "@/model/produtos.model";

export type StatusPedido = "ABERTO" | "FINALIZADO" | "CANCELADO";

export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep?: string;
}

// ============================================================
// REGRAS DE CÁLCULO DE DESCONTO E TOTAL
// ============================================================

/** Calcula o valor do desconto com base no tipo de cupom (PERCENTUAL ou FIXO). */
export function calcularDesconto(
  subtotal: number,
  tipoCupom: string,
  valorCupom: number
): number {
  if (tipoCupom === "PERCENTUAL") {
    return (subtotal * valorCupom) / 100;
  }
  if (tipoCupom === "FIXO") {
    // Desconto fixo não pode ultrapassar o subtotal
    return Math.min(valorCupom, subtotal);
  }
  return 0;
}

/** Calcula o total final do pedido após o desconto. Nunca retorna valor negativo. */
export function calcularTotal(subtotal: number, desconto: number): number {
  return Math.max(0, subtotal - desconto);
}

// ============================================================
// REGRAS DE TRANSIÇÃO DE STATUS
// ============================================================

export function validarTransicaoStatus(
  statusAtual: string,
  novoStatus: StatusPedido
): void {
  if (statusAtual === "FINALIZADO" && novoStatus === "CANCELADO")
    throw new Error("Pedido finalizado não pode ser cancelado");
  if (statusAtual === "CANCELADO" && novoStatus === "FINALIZADO")
    throw new Error("Pedido cancelado não pode ser finalizado");
  if (statusAtual === "CANCELADO" && novoStatus === "CANCELADO")
    throw new Error("Pedido já está cancelado");
}

export function validarPedidoAberto(status: string, acao: string): void {
  if (status === "FINALIZADO")
    throw new Error(`Pedido finalizado não pode ${acao}`);
  if (status === "CANCELADO")
    throw new Error(`Pedido cancelado não pode ${acao}`);
}

// ============================================================
// REGRAS DE VALIDAÇÃO DE ITENS E ENDEREÇO
// ============================================================

export function validarQuantidade(quantidade: number): void {
  if (quantidade <= 0) throw new Error("Quantidade deve ser maior que zero");
}

export function validarEndereco(endereco: Endereco): void {
  if (!endereco.rua.trim()) throw new Error("Rua é obrigatória");
  if (!endereco.numero.trim()) throw new Error("Número é obrigatório");
  if (!endereco.bairro.trim()) throw new Error("Bairro é obrigatório");
  if (!endereco.cidade.trim()) throw new Error("Cidade é obrigatória");
}

// ============================================================
// OPERAÇÕES DE NEGÓCIO (usam a Camada de Dados)
// ============================================================

export async function listarPedidos(filtros?: {
  status?: StatusPedido;
  clienteId?: string;
}) {
  return findPedidos(filtros);
}

export async function listarHistoricoStatus(pedidoId: string) {
  return findHistoricoStatus(pedidoId);
}

export async function criarPedido(clienteId?: string) {
  return insertPedido(clienteId);
}

export async function adicionarItemAoPedido(
  pedidoId: string,
  produtoId: string,
  quantidade: number
) {
  validarQuantidade(quantidade);

  const pedido = await findPedidoStatus(pedidoId);
  if (!pedido) throw new Error("Pedido não encontrado");
  validarPedidoAberto(pedido.status, "receber novos itens");

  await verificarProdutoExiste(produtoId);

  return insertItemPedido(pedidoId, produtoId, quantidade);
}

export async function finalizarPedido(pedidoId: string) {
  const pedido = await findPedidoStatus(pedidoId);
  if (!pedido) throw new Error("Pedido não encontrado");
  validarTransicaoStatus(pedido.status, "FINALIZADO");
  return updatePedidoStatus(pedidoId, "FINALIZADO");
}

export async function cancelarPedido(pedidoId: string) {
  const pedido = await findPedidoStatus(pedidoId);
  if (!pedido) throw new Error("Pedido não encontrado");
  validarTransicaoStatus(pedido.status, "CANCELADO");
  return updatePedidoStatus(pedidoId, "CANCELADO");
}

export async function aplicarCupomAoPedido(
  pedidoId: string,
  cupomCodigo: string
) {
  const pedido = await findPedidoStatus(pedidoId);
  if (pedido?.status !== "ABERTO")
    throw new Error("Cupom só pode ser aplicado em pedidos abertos");

  const cupom = await findCupomPorCodigo(cupomCodigo);
  if (!cupom)
    throw new Error(`Cupom "${cupomCodigo}" não encontrado ou inativo`);

  const pedidoAtualizado = await updatePedidoCupom(pedidoId, cupom.codigo);
  return { pedido: pedidoAtualizado, cupom };
}

export async function removerCupomDoPedido(pedidoId: string) {
  return updatePedidoCupom(pedidoId, null);
}

export async function salvarEndereco(pedidoId: string, endereco: Endereco) {
  validarEndereco(endereco);
  return updatePedidoEndereco(pedidoId, {
    rua: endereco.rua.trim(),
    numero: endereco.numero.trim(),
    complemento: endereco.complemento?.trim(),
    bairro: endereco.bairro.trim(),
    cidade: endereco.cidade.trim(),
    cep: endereco.cep?.trim(),
  });
}

export async function associarCliente(pedidoId: string, clienteId: string) {
  return updatePedidoCliente(pedidoId, clienteId);
}

// ============================================================
// CÁLCULO DE MÉTRICAS
// ============================================================

export async function calcularMetricas() {
  const pedidos = await findPedidosParaMetricas();

  const total = pedidos.length;
  const abertos = pedidos.filter((p) => p.status === "ABERTO").length;
  const finalizados = pedidos.filter((p) => p.status === "FINALIZADO").length;
  const cancelados = pedidos.filter((p) => p.status === "CANCELADO").length;
  const faturamento = pedidos
    .filter((p) => p.status === "FINALIZADO")
    .reduce((acc, p) => acc + Number(p.total), 0);

  return { total, abertos, finalizados, cancelados, faturamento };
}
