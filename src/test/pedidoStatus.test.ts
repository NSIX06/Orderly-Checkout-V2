import { describe, it, expect } from "vitest";

type Status = "ABERTO" | "FINALIZADO" | "CANCELADO";

function podeFinalizar(status: Status): boolean {
  return status === "ABERTO";
}

function podeCancelar(status: Status): boolean {
  return status === "ABERTO";
}

function podeReceberItens(status: Status): boolean {
  return status === "ABERTO";
}

describe("Transições de status", () => {
  it("ABERTO pode ser finalizado", () => {
    expect(podeFinalizar("ABERTO")).toBe(true);
  });

  it("FINALIZADO não pode ser finalizado novamente", () => {
    expect(podeFinalizar("FINALIZADO")).toBe(false);
  });

  it("CANCELADO não pode ser finalizado", () => {
    expect(podeFinalizar("CANCELADO")).toBe(false);
  });

  it("ABERTO pode ser cancelado", () => {
    expect(podeCancelar("ABERTO")).toBe(true);
  });

  it("FINALIZADO não pode ser cancelado", () => {
    expect(podeCancelar("FINALIZADO")).toBe(false);
  });

  it("CANCELADO não pode ser cancelado novamente", () => {
    expect(podeCancelar("CANCELADO")).toBe(false);
  });

  it("ABERTO pode receber itens", () => {
    expect(podeReceberItens("ABERTO")).toBe(true);
  });

  it("FINALIZADO não pode receber itens", () => {
    expect(podeReceberItens("FINALIZADO")).toBe(false);
  });

  it("CANCELADO não pode receber itens", () => {
    expect(podeReceberItens("CANCELADO")).toBe(false);
  });
});
