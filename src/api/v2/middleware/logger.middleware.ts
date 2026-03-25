import { supabase } from "@/integrations/supabase/client";
import { insertLog } from "../shared/logs/logs.service";
import type { HttpMethod } from "../shared/logs/logs.types";
import type { ApiResponse } from "../shared/response";

// ============================================================
// Mapeamento de código de erro → HTTP Status Code
// ============================================================
const ERROR_CODE_TO_STATUS: Record<string, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

function resolverStatusCode(response: ApiResponse<unknown>): number {
  if (response.success) return 200;
  const code = response.error?.code ?? "";
  return ERROR_CODE_TO_STATUS[code] ?? 500;
}

// ============================================================
// Contexto de uma chamada de rota
// ============================================================
export interface RouteContext {
  rota: string;
  metodo: HttpMethod;
  params?: Record<string, unknown> | null;
  body?: Record<string, unknown> | null;
  ip?: string | null;
}

// ============================================================
// withLog — wrapper que registra qualquer handler de rota
// ============================================================
export function withLog<TArgs extends unknown[], TData>(
  ctx: RouteContext,
  handler: (...args: TArgs) => Promise<ApiResponse<TData>>
): (...args: TArgs) => Promise<ApiResponse<TData>> {
  return async (...args: TArgs): Promise<ApiResponse<TData>> => {
    let response: ApiResponse<TData>;

    try {
      response = await handler(...args);
    } catch (err) {
      // Erro inesperado não tratado pelo handler
      const mensagem_erro = formatarErro(err);

      await insertLog({
        rota: ctx.rota,
        metodo: ctx.metodo,
        status_code: 500,
        params: ctx.params ?? null,
        body: ctx.body ?? null,
        response: null,
        ip: ctx.ip ?? null,
        usuario_id: await resolverUsuarioId(),
        mensagem_erro,
      });

      throw err;
    }

    const status_code = resolverStatusCode(response);
    const mensagem_erro =
      !response.success
        ? `[${response.error.code}] ${response.message}${response.error.details ? ` — ${response.error.details}` : ""}`
        : null;

    await insertLog({
      rota: ctx.rota,
      metodo: ctx.metodo,
      status_code,
      params: ctx.params ?? null,
      body: ctx.body ?? null,
      response: response as unknown as Record<string, unknown>,
      ip: ctx.ip ?? null,
      usuario_id: await resolverUsuarioId(),
      mensagem_erro,
    });

    return response;
  };
}

// ============================================================
// Helpers
// ============================================================

/** Retorna o ID do usuário autenticado na sessão Supabase, ou null. */
async function resolverUsuarioId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Formata um erro capturado incluindo mensagem e as primeiras linhas do stack trace.
 * Limita o stack a 3 linhas para manter o log enxuto.
 */
function formatarErro(err: unknown): string {
  if (!(err instanceof Error)) return "Erro desconhecido";

  const stackLines = (err.stack ?? "").split("\n").slice(0, 4).join(" | ");
  return `${err.name}: ${err.message} — stack: ${stackLines}`;
}
