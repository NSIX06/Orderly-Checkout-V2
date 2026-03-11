import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type Produto = Tables<"produtos">;
export type Pedido = Tables<"pedidos">;
export type ItemPedido = Tables<"itens_pedido">;
export type Cliente = Tables<"clientes">;
export type Cupom = Tables<"cupons">;
export type HistoricoStatus = Tables<"historico_status_pedido">;

export type StatusPedido = "ABERTO" | "FINALIZADO" | "CANCELADO";

export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep?: string;
}

// ============================================================
// PRODUTOS
// ============================================================

export function useProdutos(busca?: string) {
  return useQuery({
    queryKey: ["produtos", busca],
    queryFn: async () => {
      let query = supabase.from("produtos").select("*").order("nome");
      if (busca && busca.trim()) {
        query = query.ilike("nome", `%${busca.trim()}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCriarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ nome, preco }: { nome: string; preco: number }) => {
      if (!nome.trim()) throw new Error("Nome do produto é obrigatório");
      if (preco < 0) throw new Error("Preço não pode ser negativo");
      const { data, error } = await supabase
        .from("produtos")
        .insert({ nome: nome.trim(), preco })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produtos"] });
      toast({ title: "Produto criado com sucesso!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

// ============================================================
// CLIENTES
// ============================================================

export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useCriarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      nome,
      email,
      telefone,
    }: {
      nome: string;
      email: string;
      telefone?: string;
    }) => {
      if (!nome.trim()) throw new Error("Nome do cliente é obrigatório");
      if (!email.trim()) throw new Error("E-mail do cliente é obrigatório");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error("E-mail inválido");

      const { data, error } = await supabase
        .from("clientes")
        .insert({ nome: nome.trim(), email: email.trim(), telefone: telefone?.trim() || null })
        .select()
        .single();
      if (error) {
        if (error.code === "23505") throw new Error("E-mail já cadastrado");
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast({ title: "Cliente cadastrado com sucesso!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

// ============================================================
// CUPONS
// ============================================================

export function useCupons() {
  return useQuery({
    queryKey: ["cupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cupons")
        .select("*")
        .eq("ativo", true)
        .order("codigo");
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// PEDIDOS
// ============================================================

export function usePedidos(filtros?: { status?: string; clienteId?: string }) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: async () => {
      let query = supabase
        .from("pedidos")
        .select("*, itens_pedido(*, produtos(*)), clientes(*)")
        .order("created_at", { ascending: false });

      if (filtros?.status) {
        query = query.eq("status", filtros.status);
      }
      if (filtros?.clienteId) {
        query = query.eq("cliente_id", filtros.clienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useHistoricoStatus(pedidoId: string | null) {
  return useQuery({
    queryKey: ["historico_status", pedidoId],
    enabled: !!pedidoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historico_status_pedido")
        .select("*")
        .eq("pedido_id", pedidoId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCriarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params?: { clienteId?: string }) => {
      const { data, error } = await supabase
        .from("pedidos")
        .insert({
          status: "ABERTO",
          cliente_id: params?.clienteId || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Pedido criado!", description: "Status: ABERTO" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

export function useAdicionarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pedidoId,
      produtoId,
      quantidade,
    }: {
      pedidoId: string;
      produtoId: string;
      quantidade: number;
    }) => {
      if (quantidade <= 0) throw new Error("Quantidade deve ser maior que zero");

      const { data: pedido, error: pedidoErr } = await supabase
        .from("pedidos")
        .select("status")
        .eq("id", pedidoId)
        .maybeSingle();
      if (pedidoErr) throw pedidoErr;
      if (!pedido) throw new Error("Pedido não encontrado");
      if (pedido.status === "FINALIZADO")
        throw new Error("Pedido finalizado não pode receber novos itens");
      if (pedido.status === "CANCELADO")
        throw new Error("Pedido cancelado não pode receber novos itens");

      const { data: produto, error: prodErr } = await supabase
        .from("produtos")
        .select("id")
        .eq("id", produtoId)
        .maybeSingle();
      if (prodErr) throw prodErr;
      if (!produto) throw new Error("Produto não encontrado");

      const { data, error } = await supabase
        .from("itens_pedido")
        .insert({ pedido_id: pedidoId, produto_id: produtoId, quantidade })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Item adicionado!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

export function useFinalizarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pedidoId: string) => {
      const { data: pedido } = await supabase
        .from("pedidos")
        .select("status")
        .eq("id", pedidoId)
        .single();
      if (pedido?.status === "CANCELADO")
        throw new Error("Pedido cancelado não pode ser finalizado");

      const { data, error } = await supabase
        .from("pedidos")
        .update({ status: "FINALIZADO" })
        .eq("id", pedidoId)
        .eq("status", "ABERTO")
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Pedido finalizado!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro ao finalizar", description: e.message, variant: "destructive" });
    },
  });
}

export function useCancelarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pedidoId: string) => {
      const { data: pedido } = await supabase
        .from("pedidos")
        .select("status")
        .eq("id", pedidoId)
        .single();
      if (pedido?.status === "FINALIZADO")
        throw new Error("Pedido finalizado não pode ser cancelado");
      if (pedido?.status === "CANCELADO")
        throw new Error("Pedido já está cancelado");

      const { data, error } = await supabase
        .from("pedidos")
        .update({ status: "CANCELADO" })
        .eq("id", pedidoId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Pedido cancelado", description: "O pedido foi cancelado." });
    },
    onError: (e: Error) => {
      toast({ title: "Erro ao cancelar", description: e.message, variant: "destructive" });
    },
  });
}

export function useAplicarCupom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pedidoId,
      cupomCodigo,
    }: {
      pedidoId: string;
      cupomCodigo: string;
    }) => {
      const { data: pedido } = await supabase
        .from("pedidos")
        .select("status")
        .eq("id", pedidoId)
        .single();
      if (pedido?.status !== "ABERTO")
        throw new Error("Cupom só pode ser aplicado em pedidos abertos");

      const { data: cupom, error: cupomErr } = await supabase
        .from("cupons")
        .select("*")
        .eq("codigo", cupomCodigo.toUpperCase())
        .eq("ativo", true)
        .maybeSingle();
      if (cupomErr) throw cupomErr;
      if (!cupom) throw new Error(`Cupom "${cupomCodigo}" não encontrado ou inativo`);

      const { data, error } = await supabase
        .from("pedidos")
        .update({ cupom_codigo: cupom.codigo })
        .eq("id", pedidoId)
        .select()
        .single();
      if (error) throw error;
      return { pedido: data, cupom };
    },
    onSuccess: ({ cupom }) => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      const descricao = cupom.tipo === "PERCENTUAL"
        ? `${cupom.valor}% de desconto aplicado!`
        : `R$ ${Number(cupom.valor).toFixed(2)} de desconto aplicado!`;
      toast({ title: `Cupom ${cupom.codigo} aplicado!`, description: descricao });
    },
    onError: (e: Error) => {
      toast({ title: "Erro ao aplicar cupom", description: e.message, variant: "destructive" });
    },
  });
}

export function useRemoverCupom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pedidoId: string) => {
      const { data, error } = await supabase
        .from("pedidos")
        .update({ cupom_codigo: null })
        .eq("id", pedidoId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Cupom removido" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

export function useSalvarEndereco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pedidoId,
      endereco,
    }: {
      pedidoId: string;
      endereco: Endereco;
    }) => {
      if (!endereco.rua.trim()) throw new Error("Rua é obrigatória");
      if (!endereco.numero.trim()) throw new Error("Número é obrigatório");
      if (!endereco.bairro.trim()) throw new Error("Bairro é obrigatório");
      if (!endereco.cidade.trim()) throw new Error("Cidade é obrigatória");

      const { data, error } = await supabase
        .from("pedidos")
        .update({
          endereco_rua: endereco.rua.trim(),
          endereco_numero: endereco.numero.trim(),
          endereco_complemento: endereco.complemento?.trim() || null,
          endereco_bairro: endereco.bairro.trim(),
          endereco_cidade: endereco.cidade.trim(),
          endereco_cep: endereco.cep?.trim() || null,
        })
        .eq("id", pedidoId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Endereço salvo com sucesso!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro ao salvar endereço", description: e.message, variant: "destructive" });
    },
  });
}

export function useAssociarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pedidoId,
      clienteId,
    }: {
      pedidoId: string;
      clienteId: string;
    }) => {
      const { data, error } = await supabase
        .from("pedidos")
        .update({ cliente_id: clienteId })
        .eq("id", pedidoId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast({ title: "Cliente associado ao pedido!" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });
}

// ============================================================
// MÉTRICAS
// ============================================================

export function useMetricas() {
  return useQuery({
    queryKey: ["metricas"],
    queryFn: async () => {
      const { data: pedidos, error } = await supabase
        .from("pedidos")
        .select("status, total");
      if (error) throw error;

      const total = pedidos.length;
      const abertos = pedidos.filter((p) => p.status === "ABERTO").length;
      const finalizados = pedidos.filter((p) => p.status === "FINALIZADO").length;
      const cancelados = pedidos.filter((p) => p.status === "CANCELADO").length;
      const faturamento = pedidos
        .filter((p) => p.status === "FINALIZADO")
        .reduce((acc, p) => acc + Number(p.total), 0);

      return { total, abertos, finalizados, cancelados, faturamento };
    },
  });
}
