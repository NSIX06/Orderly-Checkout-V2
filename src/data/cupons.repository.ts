import { supabase } from "@/integrations/supabase/client";
import { logDb } from "@/api/v2/shared/logs/log-db";

export async function findCuponsAtivos() {
  return logDb({ rota: "/db/cupons", metodo: "GET" }, async () => {
    const { data, error } = await supabase
      .from("cupons")
      .select("*")
      .eq("ativo", true)
      .order("codigo");
    if (error) throw error;
    return data;
  });
}

export async function findCupomPorCodigo(codigo: string) {
  return logDb(
    { rota: "/db/cupons/:codigo", metodo: "GET", params: { codigo } },
    async () => {
      const { data, error } = await supabase
        .from("cupons")
        .select("*")
        .eq("codigo", codigo.toUpperCase())
        .eq("ativo", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  );
}
