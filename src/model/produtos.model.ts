/**
 * CAMADA DE NEGÓCIO — Produtos
 *
 * Responsabilidade: regras de negócio para criação e validação de produtos.
 * Usa a Camada de Dados (repository) para persistência.
 * Não acessa o banco diretamente.
 */
import {
  findProdutos,
  findProdutoById,
  insertProduto,
} from "@/data/produtos.repository";

export function validarProduto(nome: string, preco: number): void {
  if (!nome.trim()) throw new Error("Nome do produto é obrigatório");
  if (preco < 0) throw new Error("Preço não pode ser negativo");
}

export async function listarProdutos(busca?: string) {
  return findProdutos(busca);
}

export async function criarProduto(nome: string, preco: number) {
  validarProduto(nome, preco);
  return insertProduto(nome.trim(), preco);
}

export async function verificarProdutoExiste(id: string) {
  const produto = await findProdutoById(id);
  if (!produto) throw new Error("Produto não encontrado");
  return produto;
}
