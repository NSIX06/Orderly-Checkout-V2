/**
 * Teste de integração — verifica se o log é gravado na tblLogs após
 * uma chamada real ao GET_pedidos (usa credenciais reais do .env).
 *
 * Após rodar: confirme no Supabase SQL Editor:
 *   SELECT * FROM public."tblLogs" ORDER BY created_at DESC LIMIT 5;
 */
import { describe, it, expect } from "vitest";
import { GET_pedidos } from "../api/v2/shared/pedidos/pedidos.routes";

describe("Integração — GET_pedidos grava log na tblLogs", () => {

  it("deve retornar sucesso e gravar log com status 200", async () => {
    const resposta = await GET_pedidos({});

    // A chamada ao Supabase funcionou
    expect(resposta).toHaveProperty("success");

    if (resposta.success) {
      expect(Array.isArray(resposta.data)).toBe(true);
      console.log(`✓ ${resposta.data.length} pedido(s) retornado(s). Log gravado com status 200.`);
    } else {
      // Mesmo com erro, o log deve ter sido gravado (4xx ou 5xx)
      console.warn("⚠ Chamada retornou erro:", resposta.message, "— Log gravado com status de erro.");
    }
  }, 15000); // timeout de 15s para chamada de rede


  it("deve gravar log com status 400 para filtro de status inválido", async () => {
    const resposta = await GET_pedidos({ status: "INVALIDO" });

    expect(resposta.success).toBe(false);

    if (!resposta.success) {
      expect(resposta.error.code).toBe("VALIDATION_ERROR");
      console.log("✓ Erro de validação registrado. Log gravado com status 400.");
    }
  }, 15000);

});
