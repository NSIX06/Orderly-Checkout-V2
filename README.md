🛒 Orderly Checkout
Mini Sistema de Gestão de Pedidos e Produtos

O Orderly Checkout é um mini sistema de e-commerce desenvolvido com foco em qualidade de software, organização de pedidos e gestão de produtos.

O projeto simula um fluxo real de vendas, permitindo cadastro de produtos, criação de pedidos, adição de itens e finalização automática com cálculo de totais.

👉 Ideal como projeto acadêmico, portfólio ou base para sistemas maiores.

-----------------------------------------------------------------------------------------------
✨ Funcionalidades

✔ Cadastro de produtos

✔ Criação e gerenciamento de pedidos

✔ Adição de itens ao pedido

✔ Cálculo automático de total

✔ Finalização de pedidos

✔ Integração com backend serverless

------------------------------------------------------------------------------------------------

🚀 Tecnologias Utilizadas

Frontend

. React

. TypeScript

. Vite

Interface e Estilo

. Tailwind CSS

. shadcn/ui

Backend / Banco de Dados

. Supabase (Backend-as-a-Service)

. PostgreSQL

Gerenciamento de Dados

. TanStack Query

Testes

. Vitest

-------------------------------------------------------------------------------------------------------

⚙️ Como Executar o Projeto
✅ Pré-requisitos

. Node.js instalado (versão recente recomendada)

. npm ou pnpm

-------------------------------------------------------------------------------------------------------

📥 Clonar repositório

git clone https://github.com/NSIX06/orderly-checkout-main.git

cd orderly-checkout-main

-------------------------------------------------------------------------------------------------------

📦 Instalar dependências
npm install

-------------------------------------------------------------------------------------------------------

▶️ Rodar ambiente de desenvolvimento
npm run dev

O sistema ficará disponível normalmente em:

http://localhost:8080


(ou outra porta informada no terminal)

-------------------------------------------------------------------------------------------------------

🧪 Executar testes

npm test

-------------------------------------------------------------------------------------------------------
🛣 Estrutura de Integração (Supabase)

O projeto utiliza o Supabase como backend, consumindo endpoints REST automaticamente gerados pelo banco.

-------------------------------------------------------------------------------------------------------

📦 Produtos

Listar produtos

GET /rest/v1/produtos


Hook utilizado:

useProdutos


Criar produto

POST /rest/v1/produtos


Payload:

{
  "nome": "string",
  "preco": number
}


Hook:

useCriarProduto


-------------------------------------------------------------------------------------------------------

🧾 Pedidos

Listar pedidos

GET /rest/v1/pedidos?select=*,itens_pedido(*,produtos(*))


Hook:

usePedidos


Criar pedido

POST /rest/v1/pedidos


Status inicial:

ABERTO


Hook:

useCriarPedido


Adicionar item ao pedido

POST /rest/v1/itens_pedido


Payload:

{
  "pedido_id": "UUID",
  "produto_id": "UUID",
  "quantidade": number
}


Hook:

useAdicionarItem


Finalizar pedido

PATCH /rest/v1/pedidos?id=eq.{id}


Status atualizado para:

FINALIZADO


Hook:

useFinalizarPedido


-------------------------------------------------------------------------------------------------------

📚 Objetivo do Projeto

Este sistema foi desenvolvido para:

Aplicar conceitos de qualidade de software

Praticar integração frontend + backend moderno

Simular fluxo real de pedidos

Consolidar boas práticas de desenvolvimento

-----------------------------------------------------------------------------------
👨‍💻 Autor

Projeto acadêmico desenvolvido para fins educacionais e portfólio.
