import { Clock, CheckCircle2, XCircle, Circle } from "lucide-react";
import { useHistoricoStatus } from "@/hooks/useCheckout";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  pedidoId: string;
}

const statusConfig = {
  ABERTO: { icon: Circle, color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
  FINALIZADO: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  CANCELADO: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 border-red-200" },
};

export function HistoricoStatusBadge({ pedidoId }: Props) {
  const { data: historico, isLoading } = useHistoricoStatus(pedidoId);

  if (isLoading || !historico || historico.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
        <Clock className="h-3 w-3" /> Histórico de Status
      </p>
      <div className="space-y-1">
        {historico.map((h, i) => {
          const cfg = statusConfig[h.status as keyof typeof statusConfig] || statusConfig.ABERTO;
          const Icon = cfg.icon;
          const isLast = i === historico.length - 1;
          return (
            <div
              key={h.id}
              className={`flex items-center gap-2 rounded border px-2 py-1.5 text-xs ${cfg.bg} ${isLast ? "font-medium" : "opacity-70"}`}
            >
              <Icon className={`h-3 w-3 shrink-0 ${cfg.color}`} />
              <span className={cfg.color}>{h.status}</span>
              <span className="text-muted-foreground ml-auto">
                {format(new Date(h.created_at), "dd/MM HH:mm", { locale: ptBR })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
