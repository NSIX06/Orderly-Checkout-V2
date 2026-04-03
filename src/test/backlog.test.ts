import { describe, it, expect } from "vitest";

type StatusBacklog = "PENDENTE" | "EM_PROGRESSO" | "CONCLUIDO";

function validarTitulo(titulo: string): void {
  if (!titulo.trim()) throw new Error("Título é obrigatório");
  if (titulo.trim().length > 200) throw new Error("Título deve ter no máximo 200 caracteres");
}

function validarStatus(status: string): asserts status is StatusBacklog {
  const validos: StatusBacklog[] = ["PENDENTE", "EM_PROGRESSO", "CONCLUIDO"];
  if (!validos.includes(status as StatusBacklog))
    throw new Error(`Status inválido: ${status}`);
}

describe("backlog.model — validações", () => {
  describe("validarTitulo", () => {
    it("aceita título válido", () => {
      expect(() => validarTitulo("Implementar relatório")).not.toThrow();
    });

    it("rejeita título vazio", () => {
      expect(() => validarTitulo("")).toThrow("Título é obrigatório");
    });

    it("rejeita título só com espaços", () => {
      expect(() => validarTitulo("   ")).toThrow("Título é obrigatório");
    });

    it("rejeita título com mais de 200 caracteres", () => {
      expect(() => validarTitulo("a".repeat(201))).toThrow("máximo 200 caracteres");
    });
  });

  describe("validarStatus", () => {
    it("aceita status válidos", () => {
      expect(() => validarStatus("PENDENTE")).not.toThrow();
      expect(() => validarStatus("EM_PROGRESSO")).not.toThrow();
      expect(() => validarStatus("CONCLUIDO")).not.toThrow();
    });

    it("rejeita status inválido", () => {
      expect(() => validarStatus("CANCELADO")).toThrow("Status inválido");
    });
  });
});
