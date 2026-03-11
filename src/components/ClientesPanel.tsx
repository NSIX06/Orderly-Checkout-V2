import { useState } from "react";
import { Users, Plus, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientes, useCriarCliente } from "@/hooks/useCheckout";

export function ClientesPanel() {
  const { data: clientes, isLoading } = useClientes();
  const criarCliente = useCriarCliente();
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    criarCliente.mutate(
      { nome, email, telefone },
      {
        onSuccess: () => {
          setNome(""); setEmail(""); setTelefone("");
          setShowForm(false);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <Users className="h-5 w-5 text-primary" />
            Clientes
            {clientes && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                {clientes.length}
              </span>
            )}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowForm(!showForm)}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Novo Cliente
            {showForm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3"
          >
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Cadastrar Cliente
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="cliente-nome">Nome *</Label>
                <Input
                  id="cliente-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cliente-email">E-mail *</Label>
                <Input
                  id="cliente-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="joao@email.com"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="cliente-telefone">Telefone</Label>
                <Input
                  id="cliente-telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <Button type="submit" disabled={criarCliente.isPending} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Cliente
            </Button>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : clientes && clientes.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {clientes.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/50"
              >
                <div>
                  <p className="font-medium text-sm">{c.nome}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {c.email}
                    </span>
                    {c.telefone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {c.telefone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
        )}
      </CardContent>
    </Card>
  );
}
