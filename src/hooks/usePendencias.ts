import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { findLogsErros24h } from "@/data/logs.repository";

async function fetchPendencias() {
  const [pedidosRes, erros24h] = await Promise.all([
    supabase
      .from("pedidos")
      .select("id, status, cliente_id, endereco_rua, itens_pedido(id)")
      .eq("status", "ABERTO"),
    findLogsErros24h(),
  ]);

  if (pedidosRes.error) throw pedidosRes.error;

  const pedidosAbertos = pedidosRes.data ?? [];

  const semEndereco = pedidosAbertos.filter((p) => !p.endereco_rua).length;
  const semCliente = pedidosAbertos.filter((p) => !p.cliente_id).length;
  const semItens = pedidosAbertos.filter(
    (p) => !(p as any).itens_pedido || (p as any).itens_pedido.length === 0
  ).length;

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
