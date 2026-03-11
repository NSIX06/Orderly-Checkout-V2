import { describe, it, expect } from "vitest";

// ── Regras de negócio: Clientes ──────────────────────────────

function validarCliente(nome: string, email: string) {
  if (!nome.trim()) throw new Error("Nome do cliente é obrigatório");
  if (!email.trim()) throw new Error("E-mail do cliente é obrigatório");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error("E-mail inválido");
  return { nome: nome.trim(), email: email.trim() };
}

describe("Clientes — validação", () => {
  it("deve aceitar cliente com nome e e-mail válidos", () => {
    const c = validarCliente("João Silva", "joao@email.com");
    expect(c.nome).toBe("João Silva");
    expect(c.email).toBe("joao@email.com");
  });

  it("deve rejeitar nome vazio", () => {
    expect(() => validarCliente("", "joao@email.com")).toThrow("Nome do cliente é obrigatório");
  });

  it("deve rejeitar e-mail vazio", () => {
    expect(() => validarCliente("João", "")).toThrow("E-mail do cliente é obrigatório");
  });

  it("deve rejeitar e-mail inválido sem @", () => {
    expect(() => validarCliente("João", "joaoemail.com")).toThrow("E-mail inválido");
  });

  it("deve rejeitar e-mail inválido sem domínio", () => {
    expect(() => validarCliente("João", "joao@")).toThrow("E-mail inválido");
  });

  it("deve remover espaços extras do nome", () => {
    const c = validarCliente("  Ana  ", "ana@test.com");
    expect(c.nome).toBe("Ana");
  });
});
