import { useQuery } from "@tanstack/react-query";
import { findLogs, findLogsErros24h, type FiltroLogs } from "@/data/logs.repository";

export type { FiltroLogs };
export { type LogRow } from "@/data/logs.repository";

export function useLogs(filtros: FiltroLogs = {}) {
  return useQuery({
    queryKey: ["logs", filtros],
    queryFn: () => findLogs(filtros),
    refetchInterval: 30_000,
  });
}

export function useLogsErros24h() {
  return useQuery({
    queryKey: ["logs_erros_24h"],
    queryFn: () => findLogsErros24h(),
    refetchInterval: 60_000,
  });
}
