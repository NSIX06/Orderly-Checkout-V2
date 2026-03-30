/**
 * CAMADA DE DADOS — Pedidos
 *
 * Responsabilidade: consultas ao banco de dados (Supabase/SQLite).
 * Não contém regras de negócio — apenas leitura e escrita de dados.
 */
import { supabase } from "@/integrations/supabase/client";

export type StatusPedido = "ABERTO" | "FINALIZADO" | "CANCELADO";

export interface FiltrosPedidos {
  status?: StatusPedido;
  clienteId?: string;
}

export async function findPedidos(filtros: FiltrosPedidos = {}) {
  let query = supabase
    .from("pedidos")
    .select("*, itens_pedido(*, produtos(*)), clientes(*)")
    .order("created_at", { ascending: false });

  if (filtros.status) query = query.eq("status", filtros.status);
  if (filtros.clienteId) query = query.eq("cliente_id", filtros.clienteId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findPedidoStatus(pedidoId: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .select("status")
    .eq("id", pedidoId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function findPedidosParaMetricas() {
  const { data, error } = await supabase
    .from("pedidos")
    .select("status, total");
  if (error) throw error;
  return data;
}

export async function findHistoricoStatus(pedidoId: string) {
  const { data, error } = await supabase
    .from("historico_status_pedido")
    .select("*")
    .eq("pedido_id", pedidoId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertPedido(clienteId?: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .insert({ status: "ABERTO", cliente_id: clienteId || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertItemPedido(pedidoId: string, produtoId: string, quantidade: number) {
  const { data, error } = await supabase
    .from("itens_pedido")
    .insert({ pedido_id: pedidoId, produto_id: produtoId, quantidade })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePedidoStatus(pedidoId: string, status: StatusPedido) {
  const { data, error } = await supabase
    .from("pedidos")
    .update({ status })
    .eq("id", pedidoId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePedidoCupom(pedidoId: string, cupomCodigo: string | null) {
  const { data, error } = await supabase
    .from("pedidos")
    .update({ cupom_codigo: cupomCodigo })
    .eq("id", pedidoId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePedidoEndereco(
  pedidoId: string,
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    cep?: string;
  }
) {
  const { data, error } = await supabase
    .from("pedidos")
    .update({
      endereco_rua: endereco.rua,
      endereco_numero: endereco.numero,
      endereco_complemento: endereco.complemento || null,
      endereco_bairro: endereco.bairro,
      endereco_cidade: endereco.cidade,
      endereco_cep: endereco.cep || null,
    })
    .eq("id", pedidoId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePedidoCliente(pedidoId: string, clienteId: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .update({ cliente_id: clienteId })
    .eq("id", pedidoId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
