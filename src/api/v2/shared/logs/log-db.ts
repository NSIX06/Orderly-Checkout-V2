import { insertLog } from "./logs.service";
import type { HttpMethod } from "./logs.types";

export interface LogDbOptions {
  rota: string;
  metodo: HttpMethod;
  params?: Record<string, unknown> | null;
  body?: Record<string, unknown> | null;
}

/**
 * Executa uma operação de banco e registra o resultado em tblLogs.
 * O log é fire-and-forget — falhas de log nunca bloqueiam a operação.
 */
export async function logDb<T>(
  opts: LogDbOptions,
  fn: () => Promise<T>
): Promise<T> {
  let result: T;
  try {
    result = await fn();
  } catch (err) {
    const mensagem_erro =
      err instanceof Error ? err.message : "Erro desconhecido";
    insertLog({
      rota: opts.rota,
      metodo: opts.metodo,
      status_code: 500,
      params: opts.params ?? null,
      body: opts.body ?? null,
      response: null,
      ip: null,
      usuario_id: null,
      mensagem_erro,
    }).catch(() => {});
    throw err;
  }

  insertLog({
    rota: opts.rota,
    metodo: opts.metodo,
    status_code: 200,
    params: opts.params ?? null,
    body: opts.body ?? null,
    response: null,
    ip: null,
    usuario_id: null,
    mensagem_erro: null,
  }).catch(() => {});

  return result;
}
