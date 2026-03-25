import { ok, fail, type ApiResponse } from "../response";
import { buscarPedidos, isStatusValido } from "./pedidos.service";

export interface ItemPedidoV2 {
  id: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotalItem: number;
}

export interface EnderecoEntregaV2 {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep?: string;
}

export interface PedidoV2 {
  id: string;
  status: string;
  cliente: { id: string; nome: string; email: string } | null;
  itens: ItemPedidoV2[];
  subtotal: number;
  desconto: number;
  totalFinal: number;
  cupom: string | null;
  enderecoEntrega: EnderecoEntregaV2 | null;
  criadoEm: string;
}

export interface FiltrosListarPedidos {
  status?: string;
  clienteId?: string;
}

/* Tipo do pedido vindo do banco */
interface PedidoRaw {
  id: string;
  status: string;
  subtotal: number;
  desconto: number;
  total: number;
  cupom_codigo: string | null;
  created_at: string;

  endereco_rua: string | null;
  endereco_numero: string | null;
  endereco_bairro: string | null;
  endereco_cidade: string | null;
  endereco_complemento?: string | null;
  endereco_cep?: string | null;

  clientes: {
    id: string;
    nome: string;
    email: string;
  } | null;

  itens_pedido: Array<{
    id: string;
    quantidade: number;
    produtos: {
      id: string;
      nome: string;
      preco: number;
    } | null;
  }>;
}

function mapearPedido(raw: PedidoRaw): PedidoV2 {
  const itens: ItemPedidoV2[] = (raw.itens_pedido ?? []).map((i) => {
    const preco = Number(i.produtos?.preco ?? 0);

    return {
      id: i.id,
      nomeProduto: i.produtos?.nome ?? "Produto removido",
      quantidade: i.quantidade,
      precoUnitario: preco,
      subtotalItem: preco * i.quantidade,
    };
  });

  const temEndereco = raw.endereco_rua && raw.endereco_numero;

  const enderecoEntrega: EnderecoEntregaV2 | null = temEndereco
    ? {
        rua: raw.endereco_rua!,
        numero: raw.endereco_numero!,
        bairro: raw.endereco_bairro ?? "",
        cidade: raw.endereco_cidade ?? "",
        ...(raw.endereco_complemento
          ? { complemento: raw.endereco_complemento }
          : {}),
        ...(raw.endereco_cep ? { cep: raw.endereco_cep } : {}),
      }
    : null;

  return {
    id: raw.id,
    status: raw.status,

    cliente: raw.clientes
      ? {
          id: raw.clientes.id,
          nome: raw.clientes.nome,
          email: raw.clientes.email,
        }
      : null,

    itens,

    subtotal: Number(raw.subtotal ?? 0),
    desconto: Number(raw.desconto ?? 0),
    totalFinal: Number(raw.total ?? 0),

    cupom: raw.cupom_codigo ?? null,

    enderecoEntrega,

    criadoEm: raw.created_at,
  };
}

export async function listarPedidos(
  filtros: FiltrosListarPedidos
): Promise<ApiResponse<PedidoV2[]>> {

  if (filtros.status && !isStatusValido(filtros.status)) {
    return fail(
      "Status inválido. Use: ABERTO, FINALIZADO ou CANCELADO",
      "VALIDATION_ERROR",
      `Valor recebido: "${filtros.status}"`
    );
  }

  try {

  const statusValido = filtros.status && isStatusValido(filtros.status)
    ? filtros.status
    : undefined;

  const dados = await buscarPedidos({
    status: statusValido,
    clienteId: filtros.clienteId,
  });

  return ok(dados.map(mapearPedido), "Pedidos listados com sucesso");

} catch (error) {

  const message =
    error instanceof Error ? error.message : "Erro desconhecido";

  return fail("Erro ao buscar pedidos", "INTERNAL_ERROR", message);
}}