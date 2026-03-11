import { ShoppingBag } from "lucide-react";
import { ProdutosPanel } from "@/components/ProdutosPanel";
import { PedidosPanel } from "@/components/PedidosPanel";
import { ClientesPanel } from "@/components/ClientesPanel";
import { MetricasPanel } from "@/components/MetricasPanel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center gap-3 px-4 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">
              Orderly Checkout <span className="text-primary">v2</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Clientes · Pedidos · Cupons · Endereços · Histórico
            </p>
          </div>
        </div>
      </header>

      {/* Fluxo */}
      <div className="container mx-auto px-4 pt-6">
        <div className="rounded-lg border border-info/30 bg-info/5 px-4 py-3 text-sm text-info">
          <strong>Fluxo:</strong> 1) Cadastre clientes e produtos → 2) Crie um pedido → 3) Adicione itens, endereço e cupom → 4) Finalize ou cancele.
        </div>
      </div>

      {/* Métricas */}
      <div className="container mx-auto px-4 pt-6">
        <MetricasPanel />
      </div>

      {/* Produtos + Clientes */}
      <main className="container mx-auto grid gap-6 px-4 py-6 md:grid-cols-2">
        <ProdutosPanel />
        <ClientesPanel />

        {/* Pedidos em largura total */}
        <PedidosPanel />
      </main>
    </div>
  );
};

export default Index;
