import { listarPedidos } from "./pedidos.controller";
import { ok, fail, type ApiResponse } from "../response";
import type { PedidoV2 } from "./pedidos.controller";
import { withLog } from "../../middleware/logger.middleware";

export interface QueryPedidos {
  status?: string;
  clienteId?: string;
}

/** GET /api/v2/pedidos */
export async function GET_pedidos(
  query: QueryPedidos = {}
): Promise<ApiResponse<PedidoV2[]>> {
  return withLog(
    {
      rota: "/api/v2/pedidos",
      metodo: "GET",
      params: query as Record<string, unknown>,
    },
    listarPedidos
  )(query);
}