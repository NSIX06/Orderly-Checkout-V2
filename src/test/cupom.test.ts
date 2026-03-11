import { describe, it, expect } from "vitest";

// ── Regras de negócio: Cupons ─────────────────────────────────

type TipoCupom = "PERCENTUAL" | "FIXO";

interface Cupom {
  codigo: string;
  tipo: TipoCupom;
  valor: number;
  ativo: boolean;
}

function calcularDesconto(subtotal: number, cupom: Cupom): number {
  if (!cupom.ativo) return 0;
  if (cupom.tipo === "PERCENTUAL") {
    return Math.round((subtotal * cupom.valor / 100) * 100) / 100;
  }
  if (cupom.tipo === "FIXO") {
    return Math.min(cupom.valor, subtotal);
  }
  return 0;
}

function calcularTotalComDesconto(subtotal: number, desconto: number): number {
  return Math.max(subtotal - desconto, 0);
}

const CUPOM10: Cupom = { codigo: "CUPOM10", tipo: "PERCENTUAL", valor: 10, ativo: true };
const DESCONTO20: Cupom = { codigo: "DESCONTO20", tipo: "FIXO", valor: 20, ativo: true };
const INATIVO: Cupom = { codigo: "INATIVO", tipo: "FIXO", valor: 50, ativo: false };

describe("Cupons — desconto percentual", () => {
  it("deve aplicar 10% de desconto sobre R$100", () => {
    expect(calcularDesconto(100, CUPOM10)).toBe(10);
  });

  it("deve aplicar 10% de desconto sobre R$50", () => {
    expect(calcularDesconto(50, CUPOM10)).toBe(5);
  });

  it("total final deve descontar corretamente", () => {
    const subtotal = 100;
    const desconto = calcularDesconto(subtotal, CUPOM10);
    expect(calcularTotalComDesconto(subtotal, desconto)).toBe(90);
  });
});

describe("Cupons — desconto fixo", () => {
  it("deve aplicar R$20 de desconto fixo sobre R$100", () => {
    expect(calcularDesconto(100, DESCONTO20)).toBe(20);
  });

  it("desconto fixo não pode ser maior que o subtotal", () => {
    expect(calcularDesconto(15, DESCONTO20)).toBe(15); // limita ao subtotal
  });

  it("total final não pode ser negativo", () => {
    const desconto = calcularDesconto(10, DESCONTO20);
    expect(calcularTotalComDesconto(10, desconto)).toBe(0);
  });
});

describe("Cupons — cupom inativo", () => {
  it("cupom inativo não gera desconto", () => {
    expect(calcularDesconto(100, INATIVO)).toBe(0);
  });
});

describe("Cupons — total final", () => {
  it("total sem cupom é igual ao subtotal", () => {
    expect(calcularTotalComDesconto(80, 0)).toBe(80);
  });

  it("total com desconto percentual está correto", () => {
    const subtotal = 200;
    const desconto = calcularDesconto(subtotal, CUPOM10);
    expect(calcularTotalComDesconto(subtotal, desconto)).toBe(180);
  });
});
