import { describe, it, expect } from "vitest";

// ── Regras de negócio: Resumo do Pedido ──────────────────────

interface ItemResumo {
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

interface ResumoPedido {
  cliente?: string;
  itens: ItemResumo[];
  subtotal: number;
  desconto: number;
  total: number;
  status: string;
  endereco?: string;
  cupom?: string;
}

function gerarResumoPedido(pedido: {
  cliente?: string;
  itens: ItemResumo[];
  cupomDesconto?: number;
  status: string;
  endereco?: string;
  cupom?: string;
}): ResumoPedido {
  const subtotal = pedido.itens.reduce(
    (acc, item) => acc + item.precoUnitario * item.quantidade,
    0
  );
  const desconto = pedido.cupomDesconto ?? 0;
  const total = Math.max(subtotal - desconto, 0);

  return {
    cliente: pedido.cliente,
    itens: pedido.itens,
    subtotal: Math.round(subtotal * 100) / 100,
    desconto: Math.round(desconto * 100) / 100,
    total: Math.round(total * 100) / 100,
    status: pedido.status,
    endereco: pedido.endereco,
    cupom: pedido.cupom,
  };
}

describe("Resumo do pedido", () => {
  const itensBase: ItemResumo[] = [
    { nomeProduto: "Camiseta", quantidade: 2, precoUnitario: 50 },
    { nomeProduto: "Calça", quantidade: 1, precoUnitario: 120 },
  ];

  it("deve calcular subtotal corretamente", () => {
    const r = gerarResumoPedido({ itens: itensBase, status: "ABERTO" });
    expect(r.subtotal).toBe(220); // 2*50 + 1*120
  });

  it("deve calcular total sem desconto", () => {
    const r = gerarResumoPedido({ itens: itensBase, status: "ABERTO" });
    expect(r.desconto).toBe(0);
    expect(r.total).toBe(220);
  });

  it("deve calcular total com desconto", () => {
    const r = gerarResumoPedido({ itens: itensBase, cupomDesconto: 20, status: "ABERTO" });
    expect(r.desconto).toBe(20);
    expect(r.total).toBe(200);
  });

  it("deve incluir o cliente no resumo", () => {
    const r = gerarResumoPedido({ itens: itensBase, cliente: "Maria", status: "ABERTO" });
    expect(r.cliente).toBe("Maria");
  });

  it("deve incluir o status no resumo", () => {
    const r = gerarResumoPedido({ itens: itensBase, status: "FINALIZADO" });
    expect(r.status).toBe("FINALIZADO");
  });

  it("deve incluir o endereço no resumo", () => {
    const r = gerarResumoPedido({ itens: itensBase, status: "ABERTO", endereco: "Rua A, 1" });
    expect(r.endereco).toBe("Rua A, 1");
  });

  it("total não pode ser negativo mesmo com desconto maior que subtotal", () => {
    const r = gerarResumoPedido({ itens: itensBase, cupomDesconto: 999, status: "ABERTO" });
    expect(r.total).toBe(0);
  });

  it("deve listar todos os itens no resumo", () => {
    const r = gerarResumoPedido({ itens: itensBase, status: "ABERTO" });
    expect(r.itens).toHaveLength(2);
    expect(r.itens[0].nomeProduto).toBe("Camiseta");
  });
});
