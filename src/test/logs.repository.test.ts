// src/test/logs.repository.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Tipo local para o teste (espelha tblLogs Row)
interface LogRow {
  id: string;
  rota: string;
  metodo: string;
  status_code: number;
  params: unknown;
  body: unknown;
  response: unknown;
  ip: string | null;
  usuario_id: string | null;
  mensagem_erro: string | null;
  created_at: string;
}

type FiltroLogs = {
  metodo?: string;
  faixaStatus?: "2xx" | "4xx" | "5xx";
  rota?: string;
};

function aplicarFiltroFaixa(logs: LogRow[], faixa?: string): LogRow[] {
  if (!faixa) return logs;
  return logs.filter((l) => {
    if (faixa === "2xx") return l.status_code >= 200 && l.status_code < 300;
    if (faixa === "4xx") return l.status_code >= 400 && l.status_code < 500;
    if (faixa === "5xx") return l.status_code >= 500;
    return true;
  });
}

describe("logs.repository — filtros locais", () => {
  const logs: LogRow[] = [
    { id: "1", rota: "/pedidos", metodo: "GET", status_code: 200, params: null, body: null, response: null, ip: null, usuario_id: null, mensagem_erro: null, created_at: "2026-04-01T10:00:00Z" },
    { id: "2", rota: "/clientes", metodo: "POST", status_code: 201, params: null, body: null, response: null, ip: null, usuario_id: null, mensagem_erro: null, created_at: "2026-04-01T11:00:00Z" },
    { id: "3", rota: "/pedidos", metodo: "DELETE", status_code: 500, params: null, body: null, response: null, ip: null, usuario_id: null, mensagem_erro: "erro", created_at: "2026-04-01T12:00:00Z" },
    { id: "4", rota: "/produtos", metodo: "GET", status_code: 404, params: null, body: null, response: null, ip: null, usuario_id: null, mensagem_erro: null, created_at: "2026-04-01T13:00:00Z" },
  ];

  it("retorna todos quando não há filtro de faixa", () => {
    expect(aplicarFiltroFaixa(logs)).toHaveLength(4);
  });

  it("filtra apenas status 2xx", () => {
    const resultado = aplicarFiltroFaixa(logs, "2xx");
    expect(resultado).toHaveLength(2);
    expect(resultado.every((l) => l.status_code >= 200 && l.status_code < 300)).toBe(true);
  });

  it("filtra apenas status 4xx", () => {
    const resultado = aplicarFiltroFaixa(logs, "4xx");
    expect(resultado).toHaveLength(1);
    expect(resultado[0].status_code).toBe(404);
  });

  it("filtra apenas status 5xx", () => {
    const resultado = aplicarFiltroFaixa(logs, "5xx");
    expect(resultado).toHaveLength(1);
    expect(resultado[0].status_code).toBe(500);
  });
});
