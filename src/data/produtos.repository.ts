/**
 * CAMADA DE DADOS — Produtos
 *
 * Responsabilidade: consultas ao banco de dados (Supabase/SQLite).
 * Não contém regras de negócio — apenas leitura e escrita de dados.
 */
import { supabase } from "@/integrations/supabase/client";

export async function findProdutos(busca?: string) {
  let query = supabase.from("produtos").select("*").order("nome");
  if (busca?.trim()) {
    query = query.ilike("nome", `%${busca.trim()}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findProdutoById(id: string) {
  const { data, error } = await supabase
    .from("produtos")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertProduto(nome: string, preco: number) {
  const { data, error } = await supabase
    .from("produtos")
    .insert({ nome, preco })
    .select()
    .single();
  if (error) throw error;
  return data;
}
