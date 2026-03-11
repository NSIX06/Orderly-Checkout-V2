import { useState } from "react";
import { Package, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProdutos, useCriarProduto } from "@/hooks/useCheckout";

export function ProdutosPanel() {
  const [busca, setBusca] = useState("");
  const { data: produtos, isLoading } = useProdutos(busca);
  const criarProduto = useCriarProduto();
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum < 0) return;
    criarProduto.mutate(
      { nome, preco: precoNum },
      { onSuccess: () => { setNome(""); setPreco(""); } }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Package className="h-5 w-5 text-primary" />
          Produtos
          {produtos && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
              {produtos.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nome-produto">Nome</Label>
              <Input
                id="nome-produto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Camiseta"
                required
              />
            </div>
            <div>
              <Label htmlFor="preco-produto">Preço (R$)</Label>
              <Input
                id="preco-produto"
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="29.90"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={criarProduto.isPending} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Produto
          </Button>
        </form>

        {/* Busca por nome */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar produto por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : produtos && produtos.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {produtos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/50"
              >
                <span className="font-medium text-sm">{p.nome}</span>
                <span className="font-display font-semibold text-primary">
                  R$ {Number(p.preco).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {busca ? `Nenhum produto encontrado para "${busca}".` : "Nenhum produto cadastrado."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
