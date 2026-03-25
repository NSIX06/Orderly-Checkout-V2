import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { GET_pedidos, type QueryPedidos } from "../api/v2/shared/pedidos/pedidos.routes";
import type { PedidoV2 } from "../api/v2/shared/pedidos/pedidos.controller";
export type { PedidoV2 };

export function usePedidosV2(
  query: QueryPedidos = {}
): UseQueryResult<PedidoV2[], Error> {
  return useQuery<PedidoV2[], Error>({
    queryKey: ["api", "v2", "pedidos", query],

    queryFn: async () => {
      const resposta = await GET_pedidos(query);

      if (!resposta.success) {
        throw new Error(resposta.message);
      }

      return resposta.data;
    },

    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    retry: 1, // tenta novamente se falhar
  });
}