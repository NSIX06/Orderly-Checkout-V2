/**
 * CAMADA DE DADOS — Cupons
 *
 * Responsabilidade: consultas ao banco de dados (Supabase/SQLite).
 * Não contém regras de negócio — apenas leitura e escrita de dados.
 */
import { supabase } from "@/integrations/supabase/client";

export async function findCuponsAtivos() {
  const { data, error } = await supabase
    .from("cupons")
    .select("*")
    .eq("ativo", true)
    .order("codigo");
  if (error) throw error;
  return data;
}

export async function findCupomPorCodigo(codigo: string) {
  const { data, error } = await supabase
    .from("cupons")
    .select("*")
    .eq("codigo", codigo.toUpperCase())
    .eq("ativo", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
