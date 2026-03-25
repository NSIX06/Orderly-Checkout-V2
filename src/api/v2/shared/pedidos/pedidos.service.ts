import { supabase } from "@/integrations/supabase/client";

export type StatusPedido = "ABERTO" | "FINALIZADO" | "CANCELADO";

const STATUS_VALIDOS: StatusPedido[] = ["ABERTO", "FINALIZADO", "CANCELADO"];

export function isStatusValido(status: string): status is StatusPedido {
  return STATUS_VALIDOS.includes(status as StatusPedido);
}

export interface FiltrosPedidos {
  status?: StatusPedido;
  clienteId?: string;
}

export async function buscarPedidos(filtros: FiltrosPedidos = {}) {
  let query = supabase
    .from("pedidos")
    .select(`
      id, status, subtotal, desconto, total, cupom_codigo, created_at,
      endereco_rua, endereco_numero, endereco_complemento,
      endereco_bairro, endereco_cidade, endereco_cep,
      clientes ( id, nome, email ),
      itens_pedido ( id, quantidade, produtos ( id, nome, preco ) )
    `)
    .order("created_at", { ascending: false });

  if (filtros.status) query = query.eq("status", filtros.status);
  if (filtros.clienteId) query = query.eq("cliente_id", filtros.clienteId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}