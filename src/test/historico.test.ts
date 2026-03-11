import { describe, it, expect } from "vitest";

// ── Regras de negócio: Histórico de Status ───────────────────

type Status = "ABERTO" | "FINALIZADO" | "CANCELADO";

interface EntradaHistorico {
  status: Status;
  data: Date;
}

function registrarHistorico(
  historico: EntradaHistorico[],
  novoStatus: Status
): EntradaHistorico[] {
  const statusAtual = historico[historico.length - 1]?.status;
  if (statusAtual === novoStatus) return historico; // sem mudança, não registra
  return [...historico, { status: novoStatus, data: new Date() }];
}

describe("Histórico de status", () => {
  it("deve registrar status inicial ABERTO na criação", () => {
    const historico: EntradaHistorico[] = [];
    const h = registrarHistorico(historico, "ABERTO");
    expect(h).toHaveLength(1);
    expect(h[0].status).toBe("ABERTO");
  });

  it("deve registrar mudança para FINALIZADO", () => {
    const historico: EntradaHistorico[] = [{ status: "ABERTO", data: new Date() }];
    const h = registrarHistorico(historico, "FINALIZADO");
    expect(h).toHaveLength(2);
    expect(h[1].status).toBe("FINALIZADO");
  });

  it("deve registrar mudança para CANCELADO", () => {
    const historico: EntradaHistorico[] = [{ status: "ABERTO", data: new Date() }];
    const h = registrarHistorico(historico, "CANCELADO");
    expect(h).toHaveLength(2);
    expect(h[1].status).toBe("CANCELADO");
  });

  it("não deve registrar se status não mudou", () => {
    const historico: EntradaHistorico[] = [{ status: "ABERTO", data: new Date() }];
    const h = registrarHistorico(historico, "ABERTO");
    expect(h).toHaveLength(1); // sem nova entrada
  });

  it("deve preservar a ordem cronológica do histórico", () => {
    let h: EntradaHistorico[] = [];
    h = registrarHistorico(h, "ABERTO");
    h = registrarHistorico(h, "CANCELADO");
    expect(h[0].status).toBe("ABERTO");
    expect(h[1].status).toBe("CANCELADO");
  });

  it("cada entrada deve ter data/hora", () => {
    const h = registrarHistorico([], "ABERTO");
    expect(h[0].data).toBeInstanceOf(Date);
  });
});
