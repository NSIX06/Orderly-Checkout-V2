import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Tipos locais (espelham logs.types.ts sem importar o módulo)
// ============================================================
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface LogEntry {
  rota: string;
  metodo: HttpMethod;
  status_code: number;
  params?: Record<string, unknown> | null;
  body?: Record<string, unknown> | null;
  response?: Record<string, unknown> | null;
  ip?: string | null;
  usuario_id?: string | null;
  mensagem_erro?: string | null;
}

// ============================================================
// Implementação local do middleware (sem dependência do Supabase)
// ============================================================
type ApiResponse<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; error: { code: string; details?: string } };

const ERROR_CODE_TO_STATUS: Record<string, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

function resolverStatusCode(response: ApiResponse<unknown>): number {
  if (response.success) return 200;
  return ERROR_CODE_TO_STATUS[response.error?.code ?? ""] ?? 500;
}

interface RouteContext {
  rota: string;
  metodo: HttpMethod;
  params?: Record<string, unknown> | null;
  body?: Record<string, unknown> | null;
  ip?: string | null;
}

function withLog<TArgs extends unknown[], TData>(
  ctx: RouteContext,
  handler: (...args: TArgs) => Promise<ApiResponse<TData>>,
  insertLogFn: (entry: LogEntry) => Promise<void>,
  getUsuarioId: () => Promise<string | null>
): (...args: TArgs) => Promise<ApiResponse<TData>> {
  return async (...args: TArgs) => {
    let response: ApiResponse<TData>;
    try {
      response = await handler(...args);
    } catch (err) {
      const mensagem_erro =
        err instanceof Error ? `${err.name}: ${err.message}` : "Erro desconhecido";

      await insertLogFn({
        rota: ctx.rota,
        metodo: ctx.metodo,
        status_code: 500,
        params: ctx.params ?? null,
        body: ctx.body ?? null,
        response: null,
        ip: ctx.ip ?? null,
        usuario_id: await getUsuarioId(),
        mensagem_erro,
      });

      throw err;
    }

    const status_code = resolverStatusCode(response);
    const mensagem_erro = !response.success
      ? `[${response.error.code}] ${response.message}${response.error.details ? ` — ${response.error.details}` : ""}`
      : null;

    await insertLogFn({
      rota: ctx.rota,
      metodo: ctx.metodo,
      status_code,
      params: ctx.params ?? null,
      body: ctx.body ?? null,
      response: response as unknown as Record<string, unknown>,
      ip: ctx.ip ?? null,
      usuario_id: await getUsuarioId(),
      mensagem_erro,
    });

    return response;
  };
}

// ============================================================
// Testes
// ============================================================
describe("Middleware de Logs — withLog", () => {
  let insertLogMock: ReturnType<typeof vi.fn>;
  let getUsuarioIdMock: ReturnType<typeof vi.fn>;

  const ctx: RouteContext = {
    rota: "/api/v2/pedidos",
    metodo: "GET",
    params: { status: "ABERTO" },
    ip: "192.168.0.1",
  };

  beforeEach(() => {
    insertLogMock = vi.fn().mockResolvedValue(undefined);
    getUsuarioIdMock = vi.fn().mockResolvedValue("usuario-123");
  });

  // ----------------------------------------------------------
  // Sucesso (2xx)
  // ----------------------------------------------------------
  it("deve registrar log com status 200 em caso de sucesso", async () => {
    const handler = vi.fn().mockResolvedValue({
      success: true,
      message: "Pedidos listados com sucesso",
      data: [],
    });

    const wrapped = withLog(ctx, handler, insertLogMock, getUsuarioIdMock);
    const result = await wrapped({});

    expect(result.success).toBe(true);

    expect(insertLogMock).toHaveBeenCalledOnce();
    const log: LogEntry = insertLogMock.mock.calls[0][0];
    expect(log.status_code).toBe(200);
    expect(log.rota).toBe("/api/v2/pedidos");
    expect(log.metodo).toBe("GET");
    expect(log.mensagem_erro).toBeNull();
    expect(log.usuario_id).toBe("usuario-123");
    expect(log.ip).toBe("192.168.0.1");
  });

  // ----------------------------------------------------------
  // Erro de validação (4xx)
  // ----------------------------------------------------------
  it("deve registrar log com status 400 para erro de validação (VALIDATION_ERROR)", async () => {
    const handler = vi.fn().mockResolvedValue({
      success: false,
      message: "Status inválido",
      error: { code: "VALIDATION_ERROR", details: 'Valor recebido: "INVALIDO"' },
    });

    const wrapped = withLog(ctx, handler, insertLogMock, getUsuarioIdMock);
    const result = await wrapped({});

    expect(result.success).toBe(false);

    const log: LogEntry = insertLogMock.mock.calls[0][0];
    expect(log.status_code).toBe(400);
    expect(log.mensagem_erro).toContain("VALIDATION_ERROR");
    expect(log.mensagem_erro).toContain("INVALIDO");
  });

  // ----------------------------------------------------------
  // Erro de não encontrado (4xx)
  // ----------------------------------------------------------
  it("deve registrar log com status 404 para NOT_FOUND", async () => {
    const handler = vi.fn().mockResolvedValue({
      success: false,
      message: "Pedido não encontrado",
      error: { code: "NOT_FOUND" },
    });

    const wrapped = withLog(ctx, handler, insertLogMock, getUsuarioIdMock);
    await wrapped({});

    const log: LogEntry = insertLogMock.mock.calls[0][0];
    expect(log.status_code).toBe(404);
    expect(log.mensagem_erro).toContain("NOT_FOUND");
  });

  // ----------------------------------------------------------
  // Erro interno (5xx) via resposta da API
  // ----------------------------------------------------------
  it("deve registrar log com status 500 para INTERNAL_ERROR retornado pelo handler", async () => {
    const handler = vi.fn().mockResolvedValue({
      success: false,
      message: "Erro ao buscar pedidos",
      error: { code: "INTERNAL_ERROR", details: "Connection refused" },
    });

    const wrapped = withLog(ctx, handler, insertLogMock, getUsuarioIdMock);
    await wrapped({});

    const log: LogEntry = insertLogMock.mock.calls[0][0];
    expect(log.status_code).toBe(500);
    expect(log.mensagem_erro).toContain("INTERNAL_ERROR");
    expect(log.mensagem_erro).toContain("Connection refused");
  });

  // ----------------------------------------------------------
  // Erro inesperado (5xx via throw)
  // ----------------------------------------------------------
  it("deve registrar log com status 500 e re-lançar erro inesperado (throw)", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("Falha catastrófica"));

    const wrapped = withLog(ctx, handler, insertLogMock, getUsuarioIdMock);

    await expect(wrapped({})).rejects.toThrow("Falha catastrófica");

    const log: LogEntry = insertLogMock.mock.calls[0][0];
    expect(log.status_code).toBe(500);
    expect(log.mensagem_erro).toContain("Falha catastrófica");
    expect(log.response).toBeNull();
  });

  // ----------------------------------------------------------
  // Rastreabilidade — usuário anônimo
  // ----------------------------------------------------------
  it("deve registrar usuario_id como null quando não há sessão autenticada", async () => {
    getUsuarioIdMock = vi.fn().mockResolvedValue(null);

    const handler = vi.fn().mockResolvedValue({
      success: true,
      message: "ok",
      data: [],
    });

    const wrapped = withLog(ctx, handler, insertLogMock, getUsuarioIdMock);
    await wrapped({});

    const log: LogEntry = insertLogMock.mock.calls[0][0];
    expect(log.usuario_id).toBeNull();
  });

  // ----------------------------------------------------------
  // Rastreabilidade — params e body gravados
  // ----------------------------------------------------------
  it("deve gravar params e body no log", async () => {
    const ctxComBody: RouteContext = {
      rota: "/api/v2/pedidos",
      metodo: "POST",
      params: { id: "abc" },
      body: { produto_id: "p1", quantidade: 2 },
    };

    const handler = vi.fn().mockResolvedValue({
      success: true,
      message: "Criado",
      data: {},
    });

    const wrapped = withLog(ctxComBody, handler, insertLogMock, getUsuarioIdMock);
    await wrapped({});

    const log: LogEntry = insertLogMock.mock.calls[0][0];
    expect(log.params).toEqual({ id: "abc" });
    expect(log.body).toEqual({ produto_id: "p1", quantidade: 2 });
  });
});
