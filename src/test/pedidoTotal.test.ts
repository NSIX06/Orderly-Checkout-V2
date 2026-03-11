import { describe, it, expect } from "vitest";

function calcularTotal(preco: number, qtd: number) {
  return preco * qtd;
}

describe("Total do pedido", () => {
  it("calcula total corretamente", () => {
    expect(calcularTotal(10, 3)).toBe(30);
  });
});
