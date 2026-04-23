import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { findLogsErros24h } from "@/data/logs.repository";

async function fetchPendencias() {
  const [pedidosRes, itensRes, erros24h] = await Promise.all([
    supabase
      .from("pedidos")
      .select("id, cliente_id, endereco_rua")
      .eq("status", "ABERTO"),
    supabase
      .from("itens_pedido")
      .select("pedido_id"),
    findLogsErros24h(),
  ]);

  if (pedidosRes.error) throw pedidosRes.error;

  const pedidos = pedidosRes.data ?? [];
  const pedidoIdsComItens = new Set(
    (itensRes.data ?? []).map((i) => i.pedido_id)
  );

  const semEndereco = pedidos.filter((p) => !p.endereco_rua).length;
  const semCliente  = pedidos.filter((p) => !p.cliente_id).length;
  const semItens    = pedidos.filter((p) => !pedidoIdsComItens.has(p.id)).length;

  return {
    semEndereco,
    semCliente,
    semItens,
    erros24h: erros24h.length,
  };
}

export function usePendencias() {
  return useQuery({
    queryKey: ["pendencias"],
    queryFn: fetchPendencias,
    refetchInterval: 60_000,
  });
}
