import { useState } from "react";
import { Tag, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAplicarCupom, useRemoverCupom } from "@/hooks/useCheckout";

interface Props {
  pedidoId: string;
  cupomAtual?: string | null;
}

export function CupomInput({ pedidoId, cupomAtual }: Props) {
  const aplicarCupom = useAplicarCupom();
  const removerCupom = useRemoverCupom();
  const [codigo, setCodigo] = useState("");

  const handleAplicar = () => {
    if (!codigo.trim()) return;
    aplicarCupom.mutate(
      { pedidoId, cupomCodigo: codigo.trim() },
      { onSuccess: () => setCodigo("") }
    );
  };

  if (cupomAtual) {
    return (
      <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            Cupom <strong>{cupomAtual}</strong> aplicado
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removerCupom.mutate(pedidoId)}
          disabled={removerCupom.isPending}
          className="h-6 w-6 p-0 text-green-600 hover:text-red-600"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Código do cupom"
          className="pl-8 uppercase text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAplicar()}
        />
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleAplicar}
        disabled={aplicarCupom.isPending || !codigo.trim()}
      >
        Aplicar
      </Button>
    </div>
  );
}
