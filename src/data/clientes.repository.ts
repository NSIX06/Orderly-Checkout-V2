import { supabase } from "@/integrations/supabase/client";
import { logDb } from "@/api/v2/shared/logs/log-db";

export async function findClientes() {
  return logDb({ rota: "/db/clientes", metodo: "GET" }, async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data;
  });
}

export async function insertCliente(nome: string, email: string, telefone?: string) {
  return logDb(
    { rota: "/db/clientes", metodo: "POST", body: { nome, email, telefone: telefone ?? null } },
    async () => {
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
  );
}
