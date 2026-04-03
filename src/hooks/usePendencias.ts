import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { findLogsErros24h } from "@/data/logs.repository";

interface PedidoAberto {
  id: string;
  cliente_id: string | null;
  endereco_rua: string | null;
  itens_pedido: { id: string }[];
}

async function fetchPendencias() {
  const [pedidosRes, erros24h] = await Promise.all([
    supabase
      .from("pedidos")
      .select("id, cliente_id, endereco_rua, itens_pedido(id)")
      .eq("status", "ABERTO"),
    findLogsErros24h(),
  ]);

  if (pedidosRes.error) throw pedidosRes.error;

  const pedidosAbertos = (pedidosRes.data ?? []) as unknown as PedidoAberto[];

  const semEndereco = pedidosAbertos.filter((p) => !p.endereco_rua).length;
  const semCliente = pedidosAbertos.filter((p) => !p.cliente_id).length;
  const semItens = pedidosAbertos.filter((p) => p.itens_pedido.length === 0).length;

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
