import { describe, it, expect } from "vitest";

// ── Regras de negócio: Endereço ───────────────────────────────

interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep?: string;
}

function validarEndereco(e: Partial<Endereco>): Endereco {
  if (!e.rua?.trim()) throw new Error("Rua é obrigatória");
  if (!e.numero?.trim()) throw new Error("Número é obrigatório");
  if (!e.bairro?.trim()) throw new Error("Bairro é obrigatório");
  if (!e.cidade?.trim()) throw new Error("Cidade é obrigatória");
  return {
    rua: e.rua.trim(),
    numero: e.numero.trim(),
    bairro: e.bairro.trim(),
    cidade: e.cidade.trim(),
    complemento: e.complemento?.trim(),
    cep: e.cep?.trim(),
  };
}

const enderecoValido: Endereco = {
  rua: "Av. Paulista",
  numero: "1000",
  bairro: "Bela Vista",
  cidade: "São Paulo",
};

describe("Endereço — campos obrigatórios", () => {
  it("deve aceitar endereço com todos os campos obrigatórios", () => {
    const e = validarEndereco(enderecoValido);
    expect(e.rua).toBe("Av. Paulista");
    expect(e.numero).toBe("1000");
    expect(e.bairro).toBe("Bela Vista");
    expect(e.cidade).toBe("São Paulo");
  });

  it("deve rejeitar endereço sem rua", () => {
    expect(() => validarEndereco({ ...enderecoValido, rua: "" })).toThrow("Rua é obrigatória");
  });

  it("deve rejeitar endereço sem número", () => {
    expect(() => validarEndereco({ ...enderecoValido, numero: "" })).toThrow("Número é obrigatório");
  });

  it("deve rejeitar endereço sem bairro", () => {
    expect(() => validarEndereco({ ...enderecoValido, bairro: "" })).toThrow("Bairro é obrigatório");
  });

  it("deve rejeitar endereço sem cidade", () => {
    expect(() => validarEndereco({ ...enderecoValido, cidade: "" })).toThrow("Cidade é obrigatória");
  });

  it("deve aceitar endereço sem complemento e sem CEP", () => {
    const e = validarEndereco(enderecoValido);
    expect(e.complemento).toBeUndefined();
    expect(e.cep).toBeUndefined();
  });

  it("deve aceitar endereço com complemento", () => {
    const e = validarEndereco({ ...enderecoValido, complemento: "Apto 42" });
    expect(e.complemento).toBe("Apto 42");
  });

  it("deve remover espaços extras dos campos", () => {
    const e = validarEndereco({ ...enderecoValido, rua: "  Rua das Flores  " });
    expect(e.rua).toBe("Rua das Flores");
  });
});
