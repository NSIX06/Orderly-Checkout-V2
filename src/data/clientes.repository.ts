/**
 * CAMADA DE DADOS — Clientes
 *
 * Responsabilidade: consultas ao banco de dados (Supabase/SQLite).
 * Não contém regras de negócio — apenas leitura e escrita de dados.
 */
import { supabase } from "@/integrations/supabase/client";

export async function findClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nome");
  if (error) throw error;
  return data;
}

export async function insertCliente(nome: string, email: string, telefone?: string) {
  const { data, error } = await supabase
    .from("clientes")
    .insert({ nome, email, telefone: telefone || null })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("E-mail já cadastrado");
    throw error;
  }
  return data;
}
