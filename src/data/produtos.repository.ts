import { supabase } from "@/integrations/supabase/client";
import { logDb } from "@/api/v2/shared/logs/log-db";

export async function findProdutos(busca?: string) {
  return logDb(
    { rota: "/db/produtos", metodo: "GET", params: busca ? { busca } : null },
    async () => {
      let query = supabase.from("produtos").select("*").order("nome");
      if (busca?.trim()) {
        query = query.ilike("nome", `%${busca.trim()}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  );
}

export async function findProdutoById(id: string) {
  return logDb(
    { rota: "/db/produtos/:id", metodo: "GET", params: { id } },
    async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  );
}

export async function insertProduto(nome: string, preco: number) {
  return logDb(
    { rota: "/db/produtos", metodo: "POST", body: { nome, preco } },
    async () => {
      const { data, error } = await supabase
        .from("produtos")
        .insert({ nome, preco })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  );
}
