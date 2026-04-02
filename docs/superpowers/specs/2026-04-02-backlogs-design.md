# Design: Tela de Backlogs — Orderly Checkout V2

**Data:** 2026-04-02  
**Status:** Aprovado

---

## Visão Geral

Adicionar um sistema de controle completo ao Orderly Checkout V2 composto por três novas páginas e uma sidebar de navegação. O objetivo é dar visibilidade total sobre logs de API, tarefas em desenvolvimento e pendências operacionais do sistema.

---

## Arquitetura

### AppShell

Novo componente `src/components/AppShell.tsx` que envolve todas as rotas e fornece:

- **Sidebar fixa** de 200px com logo, links de navegação e indicador de rota ativa
- **Área de conteúdo** (`flex-1`) com scroll independente

O `App.tsx` passa a usar o `AppShell` como layout compartilhado:

```
AppShell
  ├── Sidebar (logo + nav links)
  └── <Outlet /> (conteúdo da rota ativa)
```

O `<header>` atualmente em `src/pages/Index.tsx` é removido; logo e título migram para a sidebar.

### Rotas

| Rota | Página | Componente |
|---|---|---|
| `/` | Dashboard | `src/pages/Index.tsx` (existente, ajustado) |
| `/logs` | Logs de API | `src/pages/LogsPanel.tsx` (novo) |
| `/backlog` | Backlog de Tarefas | `src/pages/BacklogPanel.tsx` (novo) |
| `/pendencias` | Pendências Operacionais | `src/pages/PendenciasPanel.tsx` (novo) |

---

## Páginas

### 1. `/` — Dashboard

Sem alterações no conteúdo. Remove apenas o `<header>` (logo/título) que migra para a sidebar. Os painéis de Métricas, Produtos, Clientes e Pedidos permanecem iguais.

### 2. `/logs` — Logs de API

**Objetivo:** visualizar todas as requisições registradas na tabela `tblLogs`.

**Componente:** `src/pages/LogsPanel.tsx`  
**Hook:** `src/hooks/useLogs.ts` (novo)

**Interface:**
- Filtros no topo: dropdown de Método HTTP (GET/POST/PUT/PATCH/DELETE), dropdown de faixa de Status (2xx / 4xx / 5xx / todos), campo de busca por rota
- Tabela paginada (50 registros por página) com colunas: Método · Status Code · Rota · IP · Data/Hora
- Clique em uma linha expande um painel inline com o JSON completo de `params`, `body`, `response` e `mensagem_erro`
- Badges coloridos por método (azul=GET, amarelo=POST, vermelho=DELETE, cinza=outros) e por status (verde=2xx, amarelo=4xx, vermelho=5xx)

**Supabase:**
- Lê da tabela existente `tblLogs`
- A política RLS atual bloqueia SELECT — deve ser atualizada para permitir leitura (nova migration)
- Query ordenada por `created_at DESC`

### 3. `/backlog` — Backlog de Tarefas

**Objetivo:** gerenciar tarefas, bugs e features do projeto em formato Kanban.

**Componente:** `src/pages/BacklogPanel.tsx`  
**Hook:** `src/hooks/useBacklog.ts` (novo)

**Interface:**
- Três colunas Kanban: **Pendente** · **Em Progresso** · **Concluído**
- Botão "+ Nova Tarefa" abre modal com campos: título (obrigatório), descrição (opcional), prioridade, tipo
- Cada card exibe: título, badge de prioridade, badge de tipo
- Clique no card abre modal de edição
- Botão de deletar no card (com confirmação)
- Drag-and-drop entre colunas é **fora do escopo** desta versão; mover de coluna é feito via select no modal de edição

**Nova tabela Supabase — `tblBacklog`:**

```sql
CREATE TABLE public."tblBacklog" (
  id          UUID                     NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      TEXT                     NOT NULL,
  descricao   TEXT,
  status      TEXT                     NOT NULL DEFAULT 'PENDENTE'
                CHECK (status IN ('PENDENTE', 'EM_PROGRESSO', 'CONCLUIDO')),
  prioridade  TEXT                     NOT NULL DEFAULT 'MEDIA'
                CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')),
  tipo        TEXT                     NOT NULL DEFAULT 'TAREFA'
                CHECK (tipo IN ('TAREFA', 'BUG', 'FEATURE', 'MELHORIA')),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**RLS:** INSERT, SELECT, UPDATE e DELETE públicos (sem autenticação nesta versão).

### 4. `/pendencias` — Pendências Operacionais

**Objetivo:** visão consolidada de itens que precisam de atenção operacional.

**Componente:** `src/pages/PendenciasPanel.tsx`  
**Hook:** `src/hooks/usePendencias.ts` (novo)

**Cards de alerta (leitura das tabelas existentes):**

| Card | Fonte | Condição |
|---|---|---|
| Pedidos abertos sem endereço | `tblPedidos` | status=ABERTO AND endereco_rua IS NULL |
| Pedidos abertos sem itens | `tblPedidos` + `tblItensPedido` | status=ABERTO AND COUNT(itens) = 0 |
| Pedidos sem cliente | `tblPedidos` | cliente_id IS NULL |
| Erros de API (últimas 24h) | `tblLogs` | status_code >= 500 AND created_at > now()-24h |

Cada card mostra contagem e, ao ser clicado, navega para a página relevante (Dashboard para os três primeiros, `/logs` para erros de API).

---

## Banco de Dados — Migrations Necessárias

1. **`tbl_backlog.sql`** — cria tabela `tblBacklog` com RLS
2. **`tbl_logs_read_policy.sql`** — adiciona política SELECT na `tblLogs` para leitura no painel

---

## Novos Arquivos

```
src/
  components/
    AppShell.tsx           ← layout compartilhado (sidebar + outlet)
  pages/
    LogsPanel.tsx
    BacklogPanel.tsx
    PendenciasPanel.tsx
  hooks/
    useLogs.ts
    useBacklog.ts
    usePendencias.ts
supabase/migrations/
    20260402000000_tbl_backlog.sql
    20260402000001_tbl_logs_read_policy.sql
```

## Arquivos Modificados

```
src/App.tsx                ← adiciona rotas e AppShell
src/pages/Index.tsx        ← remove <header>
```

---

## Fora do Escopo

- Drag-and-drop no Kanban
- Autenticação/autorização de usuários
- Notificações em tempo real
- Paginação na página de Pendências
