import { useState } from "react";
import { MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSalvarEndereco, type Endereco } from "@/hooks/useCheckout";

interface Props {
  pedidoId: string;
  enderecoAtual?: {
    rua?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    cep?: string | null;
  };
  onClose?: () => void;
}

export function EnderecoForm({ pedidoId, enderecoAtual, onClose }: Props) {
  const salvarEndereco = useSalvarEndereco();
  const [endereco, setEndereco] = useState<Endereco>({
    rua: enderecoAtual?.rua || "",
    numero: enderecoAtual?.numero || "",
    complemento: enderecoAtual?.complemento || "",
    bairro: enderecoAtual?.bairro || "",
    cidade: enderecoAtual?.cidade || "",
    cep: enderecoAtual?.cep || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    salvarEndereco.mutate(
      { pedidoId, endereco },
      { onSuccess: () => onClose?.() }
    );
  };

  const set = (field: keyof Endereco) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEndereco((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Endereço de Entrega
        </p>
      </div>

      <div className="grid grid-cols-[1fr_100px] gap-2">
        <div>
          <Label htmlFor="rua">Rua *</Label>
          <Input id="rua" value={endereco.rua} onChange={set("rua")} placeholder="Av. Paulista" required />
        </div>
        <div>
          <Label htmlFor="numero">Número *</Label>
          <Input id="numero" value={endereco.numero} onChange={set("numero")} placeholder="1000" required />
        </div>
      </div>

      <div>
        <Label htmlFor="complemento">Complemento</Label>
        <Input id="complemento" value={endereco.complemento} onChange={set("complemento")} placeholder="Apto 42, Bloco B" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="bairro">Bairro *</Label>
          <Input id="bairro" value={endereco.bairro} onChange={set("bairro")} placeholder="Bela Vista" required />
        </div>
        <div>
          <Label htmlFor="cidade">Cidade *</Label>
          <Input id="cidade" value={endereco.cidade} onChange={set("cidade")} placeholder="São Paulo" required />
        </div>
      </div>

      <div>
        <Label htmlFor="cep">CEP</Label>
        <Input id="cep" value={endereco.cep} onChange={set("cep")} placeholder="01310-100" />
      </div>

      <Button type="submit" size="sm" disabled={salvarEndereco.isPending} className="w-full">
        <Save className="mr-2 h-3 w-3" />
        Salvar Endereço
      </Button>
    </form>
  );
}
