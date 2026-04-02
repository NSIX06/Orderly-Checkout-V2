export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface LogEntry {
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
