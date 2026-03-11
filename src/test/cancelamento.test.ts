import { describe, it, expect } from "vitest";

// ── Regras de negócio: Cancelamento ──────────────────────────

type Status = "ABERTO" | "FINALIZADO" | "CANCELADO";

function cancelarPedido(status: Status): Status {
  if (status === "FINALIZADO") throw new Error("Pedido finalizado não pode ser cancelado");
  if (status === "CANCELADO") throw new Error("Pedido já está cancelado");
  return "CANCELADO";
}

function finalizarPedido(status: Status): Status {
  if (status === "CANCELADO") throw new Error("Pedido cancelado não pode ser finalizado");
  if (status === "FINALIZADO") throw new Error("Pedido já está finalizado");
  return "FINALIZADO";
}

function adicionarItemAoPedido(status: Status): void {
  if (status === "FINALIZADO") throw new Error("Pedido finalizado não pode receber novos itens");
  if (status === "CANCELADO") throw new Error("Pedido cancelado não pode receber novos itens");
}

describe("Cancelamento de pedido", () => {
  it("pedido ABERTO pode ser cancelado", () => {
    expect(cancelarPedido("ABERTO")).toBe("CANCELADO");
  });

  it("pedido FINALIZADO não pode ser cancelado", () => {
    expect(() => cancelarPedido("FINALIZADO")).toThrow("Pedido finalizado não pode ser cancelado");
  });

  it("pedido CANCELADO não pode ser cancelado novamente", () => {
    expect(() => cancelarPedido("CANCELADO")).toThrow("Pedido já está cancelado");
  });
});

describe("Finalização de pedido cancelado", () => {
  it("pedido CANCELADO não pode ser finalizado", () => {
    expect(() => finalizarPedido("CANCELADO")).toThrow("Pedido cancelado não pode ser finalizado");
  });

  it("pedido ABERTO pode ser finalizado", () => {
    expect(finalizarPedido("ABERTO")).toBe("FINALIZADO");
  });

  it("pedido FINALIZADO não pode ser finalizado novamente", () => {
    expect(() => finalizarPedido("FINALIZADO")).toThrow("Pedido já está finalizado");
  });
});

describe("Itens em pedido cancelado", () => {
  it("pedido CANCELADO não pode receber itens", () => {
    expect(() => adicionarItemAoPedido("CANCELADO")).toThrow(
      "Pedido cancelado não pode receber novos itens"
    );
  });

  it("pedido ABERTO pode receber itens", () => {
    expect(() => adicionarItemAoPedido("ABERTO")).not.toThrow();
  });

  it("pedido FINALIZADO não pode receber itens", () => {
    expect(() => adicionarItemAoPedido("FINALIZADO")).toThrow(
      "Pedido finalizado não pode receber novos itens"
    );
  });
});
