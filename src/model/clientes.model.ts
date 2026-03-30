/**
 * CAMADA DE NEGÓCIO — Clientes
 *
 * Responsabilidade: regras de negócio para cadastro e validação de clientes.
 * Usa a Camada de Dados (repository) para persistência.
 * Não acessa o banco diretamente.
 */
import { findClientes, insertCliente } from "@/data/clientes.repository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCliente(nome: string, email: string): void {
  if (!nome.trim()) throw new Error("Nome do cliente é obrigatório");
  if (!email.trim()) throw new Error("E-mail do cliente é obrigatório");
  if (!EMAIL_REGEX.test(email)) throw new Error("E-mail inválido");
}

export async function listarClientes() {
  return findClientes();
}

export async function criarCliente(nome: string, email: string, telefone?: string) {
  validarCliente(nome, email);
  return insertCliente(nome.trim(), email.trim(), telefone?.trim());
}
