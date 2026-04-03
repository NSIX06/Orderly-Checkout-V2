import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLogs, type FiltroLogs, type LogRow } from "@/hooks/useLogs";

const METODOS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const metodoCor: Record<string, string> = {
  GET:    "bg-blue-100 text-blue-800 border-blue-200",
  POST:   "bg-amber-100 text-amber-800 border-amber-200",
  PUT:    "bg-purple-100 text-purple-800 border-purple-200",
  PATCH:  "bg-indigo-100 text-indigo-800 border-indigo-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
};

function statusCor(code: number): string {
  if (code >= 500) return "bg-red-100 text-red-800 border-red-200";
  if (code >= 400) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-green-100 text-green-800 border-green-200";
}

function LogDetalhe({ log }: { log: LogRow }) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-secondary/10 p-3 text-xs font-mono">
      {log.mensagem_erro && (
        <div>
          <p className="mb-1 font-semibold text-red-600">Erro</p>
          <pre className="whitespace-pre-wrap break-all text-red-700">{log.mensagem_erro}</pre>
        </div>
      )}
      {log.params && (
        <div>
          <p className="mb-1 font-semibold text-muted-foreground">Params</p>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.params, null, 2)}</pre>
        </div>
      )}
      {log.body && (
        <div>
          <p className="mb-1 font-semibold text-muted-foreground">Body</p>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.body, null, 2)}</pre>
        </div>
      )}
      {log.response && (
        <div>
          <p className="mb-1 font-semibold text-muted-foreground">Response</p>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export function LogsPanel() {
  const [metodo, setMetodo] = useState<string>("TODOS");
  const [faixa, setFaixa] = useState<string>("TODOS");
  const [rotaBusca, setRotaBusca] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);

  const filtros: FiltroLogs = {
    metodo: metodo !== "TODOS" ? metodo : undefined,
    faixaStatus: faixa !== "TODOS" ? (faixa as FiltroLogs["faixaStatus"]) : undefined,
    rota: rotaBusca || undefined,
  };

  const { data: logs, isLoading } = useLogs(filtros);

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <FileText className="h-5 w-5 text-primary" />
            Logs de API
            {logs && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                {logs.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <Select value={metodo} onValueChange={setMetodo}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os métodos</SelectItem>
                {METODOS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={faixa} onValueChange={setFaixa}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os status</SelectItem>
                <SelectItem value="2xx">2xx — Sucesso</SelectItem>
                <SelectItem value="4xx">4xx — Cliente</SelectItem>
                <SelectItem value="5xx">5xx — Servidor</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-xs w-48"
                placeholder="Buscar por rota..."
                value={rotaBusca}
                onChange={(e) => setRotaBusca(e.target.value)}
              />
            </div>
          </div>

          {/* Tabela */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !logs || logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum log encontrado.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-[70px_60px_1fr_100px_120px_24px] gap-2 border-b border-border bg-secondary/30 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                <span>Método</span>
                <span>Status</span>
                <span>Rota</span>
                <span>IP</span>
                <span>Data/Hora</span>
                <span></span>
              </div>
              {logs.map((log) => {
                const isOpen = expandido === log.id;
                return (
                  <div key={log.id} className="border-b border-border last:border-0">
                    <button
                      onClick={() => setExpandido(isOpen ? null : log.id)}
                      aria-expanded={isOpen}
                      className="grid w-full grid-cols-[70px_60px_1fr_100px_120px_24px] gap-2 px-3 py-2.5 text-left text-xs hover:bg-secondary/20 transition-colors"
                    >
                      <Badge variant="outline" className={`justify-center text-[10px] ${metodoCor[log.metodo] ?? ""}`}>
                        {log.metodo}
                      </Badge>
                      <Badge variant="outline" className={`justify-center text-[10px] ${statusCor(log.status_code)}`}>
                        {log.status_code}
                      </Badge>
                      <span className="truncate font-mono text-[11px]">{log.rota}</span>
                      <span className="truncate text-muted-foreground">{log.ip ?? "—"}</span>
                      <span className="text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3">
                        <LogDetalhe log={log} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
