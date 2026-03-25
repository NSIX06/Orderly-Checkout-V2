import { describe, it, expect, vi } from "vitest";

type StatusPedido = "ABERTO" | "FINALIZADO" | "CANCELADO";

const STATUS_VALIDOS: StatusPedido[] = ["ABERTO", "FINALIZADO", "CANCELADO"];

function isStatusValido(s: string): s is StatusPedido {
  return STATUS_VALIDOS.includes(s as StatusPedido);
}

type FiltrosPedido = {
  status?: string;
  clienteId?: string;
};

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

  clientes: { id: string; nome: string; email: string } | null;

  itens_pedido: Array<{
    id: string;
    quantidade: number;
    produtos: { id: string; nome: string; preco: number } | null;
  }>;
}

interface PedidoMapeado {
  id: string;
  status: string;
  cliente: { id: string; nome: string; email: string } | null;
  itens: {
    id: string;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotalItem: number;
  }[];
  subtotal: number;
  desconto: number;
  totalFinal: number;
  cupom: string | null;
  enderecoEntrega: {
    rua: string;
    numero: string;
    bairro: string | null;
    cidade: string | null;
  } | null;
  criadoEm: string;
}

function mapearPedido(raw: PedidoRaw): PedidoMapeado {
  const itens = (raw.itens_pedido ?? []).map((i) => {
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

  const enderecoEntrega = temEndereco
    ? {
        rua: raw.endereco_rua!,
        numero: raw.endereco_numero!,
        bairro: raw.endereco_bairro ?? null,
        cidade: raw.endereco_cidade ?? null,
      }
    : null;

  return {
    id: raw.id,
    status: raw.status,
    cliente: raw.clientes ?? null,
    itens,
    subtotal: Number(raw.subtotal),
    desconto: Number(raw.desconto),
    totalFinal: Number(raw.total),
    cupom: raw.cupom_codigo ?? null,
    enderecoEntrega,
    criadoEm: raw.created_at,
  };
}

type RespostaApi<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; error: { code: string; details?: string } };

async function listarPedidos(
  filtros: FiltrosPedido,
  buscarFn: (f: FiltrosPedido) => Promise<PedidoRaw[]>
): Promise<RespostaApi<PedidoMapeado[]>> {

  if (filtros.status && !isStatusValido(filtros.status)) {
    return {
      success: false,
      message: "Status inválido. Use: ABERTO, FINALIZADO ou CANCELADO",
      error: {
        code: "VALIDATION_ERROR",
        details: `Valor recebido: "${filtros.status}"`,
      },
    };
  }

  try {
    const dados = await buscarFn(filtros);

    return {
      success: true,
      message: "Pedidos listados com sucesso",
      data: dados.map(mapearPedido),
    };

  } catch (e: any) {
    return {
      success: false,
      message: "Erro ao buscar pedidos",
      error: {
        code: "INTERNAL_ERROR",
        details: e?.message,
      },
    };
  }
}

const fixture: PedidoRaw = {
  id: "abc-123",
  status: "FINALIZADO",
  subtotal: 100,
  desconto: 10,
  total: 90,
  cupom_codigo: "CUPOM10",
  created_at: "2026-03-01T12:00:00Z",

  endereco_rua: "Rua A",
  endereco_numero: "42",
  endereco_bairro: "Centro",
  endereco_cidade: "Rondonópolis",

  clientes: {
    id: "cli-1",
    nome: "João",
    email: "joao@email.com",
  },

  itens_pedido: [
    {
      id: "item-1",
      quantidade: 2,
      produtos: {
        id: "p1",
        nome: "Camiseta",
        preco: 50,
      },
    },
  ],
};

describe("GET /api/v2/pedidos", () => {

  it("deve retornar sucesso ao listar pedidos", async () => {

    const buscarMock = vi.fn().mockResolvedValue([fixture]);

    const r = await listarPedidos({}, buscarMock);

    expect(r.success).toBe(true);

    if (r.success) {
      expect(r.data).toHaveLength(1);
      expect(r.data[0].totalFinal).toBe(90);
      expect(r.data[0].itens[0].subtotalItem).toBe(100);
    }

  });

  it("deve retornar erro para status inválido", async () => {

    const buscarMock = vi.fn();

    const r = await listarPedidos(
      { status: "INVALIDO" },
      buscarMock
    );

    expect(r.success).toBe(false);

    // Correção aplicada aqui!
    if (r.success === false) {
      expect(r.error.code).toBe("VALIDATION_ERROR");
      expect(r.error.details).toContain("INVALIDO");
    }

    expect(buscarMock).not.toHaveBeenCalled();

  });

});