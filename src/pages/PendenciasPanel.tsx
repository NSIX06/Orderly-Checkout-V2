import { useNavigate } from "react-router-dom";
import { AlertTriangle, MapPin, ShoppingCart, User, ServerCrash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePendencias } from "@/hooks/usePendencias";

interface CardPendenciaProps {
  icone: React.ReactNode;
  titulo: string;
  contagem: number;
  descricao: string;
  cor: "vermelho" | "amarelo" | "cinza";
  onClick: () => void;
}

const corBorda: Record<CardPendenciaProps["cor"], string> = {
  vermelho: "border-l-red-500 border-red-200 bg-red-50/50",
  amarelo:  "border-l-amber-500 border-amber-200 bg-amber-50/50",
  cinza:    "border-l-slate-400 border-slate-200 bg-slate-50/50",
};

const corTexto: Record<CardPendenciaProps["cor"], string> = {
  vermelho: "text-red-700",
  amarelo:  "text-amber-700",
  cinza:    "text-slate-600",
};

function CardPendencia({ icone, titulo, contagem, descricao, cor, onClick }: CardPendenciaProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-lg border border-l-4 p-4 text-left shadow-sm transition-shadow hover:shadow-md ${corBorda[cor]}`}
    >
      <div className={`shrink-0 ${corTexto[cor]}`}>{icone}</div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${corTexto[cor]}`}>{titulo}</p>
        <p className="text-xs text-muted-foreground">{descricao}</p>
      </div>
      <div className={`text-2xl font-bold ${corTexto[cor]}`}>{contagem}</div>
    </button>
  );
}

export function PendenciasPanel() {
  const navigate = useNavigate();
  const { data, isLoading } = usePendencias();

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Pendências Operacionais
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !data ? (
            <p className="text-sm text-muted-foreground">Erro ao carregar pendências.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <CardPendencia
                icone={<MapPin className="h-6 w-6" />}
                titulo="Pedidos abertos sem endereço"
                contagem={data.semEndereco}
                descricao="Pedidos em aberto que ainda não têm endereço de entrega"
                cor={data.semEndereco > 0 ? "amarelo" : "cinza"}
                onClick={() => navigate("/")}
              />
              <CardPendencia
                icone={<ShoppingCart className="h-6 w-6" />}
                titulo="Pedidos abertos sem itens"
                contagem={data.semItens}
                descricao="Pedidos em aberto criados sem nenhum produto adicionado"
                cor={data.semItens > 0 ? "vermelho" : "cinza"}
                onClick={() => navigate("/")}
              />
              <CardPendencia
                icone={<User className="h-6 w-6" />}
                titulo="Pedidos sem cliente associado"
                contagem={data.semCliente}
                descricao="Pedidos em aberto sem um cliente vinculado"
                cor={data.semCliente > 0 ? "amarelo" : "cinza"}
                onClick={() => navigate("/")}
              />
              <CardPendencia
                icone={<ServerCrash className="h-6 w-6" />}
                titulo="Erros de API (últimas 24h)"
                contagem={data.erros24h}
                descricao="Requisições com status 5xx registradas nas últimas 24 horas"
                cor={data.erros24h > 0 ? "vermelho" : "cinza"}
                onClick={() => navigate("/logs")}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
