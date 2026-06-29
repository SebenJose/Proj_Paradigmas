# Frontend - Integração de Privacidade de Listas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar o controle e exibição de privacidade (pública/privada) nas listas de livros do frontend.

**Architecture:** Atualizar definições de tipos e esquemas no frontend, adicionar serviço PATCH, incluir um checkbox de privacidade no formulário de criação de lista e um botão de alternância (Lock/Eye) no cabeçalho dos cartões de lista.

**Tech Stack:** Next.js (App Router), TypeScript, Zod, React Hook Form, TailwindCSS, Lucide Icons.

---

### Task 1: Atualização dos tipos e validação
**Files:**
- Modify: `frontend/src/features/lists/types.ts:8-16`
- Modify: `frontend/src/features/lists/schemas.ts:3-7`

- [ ] **Step 1: Modificar `frontend/src/features/lists/types.ts`**
  Adicionar a propriedade `isPrivate` a `BookList` e `CreateListRequest`.
  
- [ ] **Step 2: Modificar `frontend/src/features/lists/schemas.ts`**
  Atualizar o esquema `createListSchema` para incluir `isPrivate` como booleano com padrão `false`.

---

### Task 2: Atualização dos serviços de API
**Files:**
- Modify: `frontend/src/features/lists/services/list.service.ts:25-27`

- [ ] **Step 1: Modificar `frontend/src/features/lists/services/list.service.ts`**
  Adicionar a função `updatePrivacy(listId: number, isPrivate: boolean)` para fazer a chamada PATCH.

---

### Task 3: Modificar formulário de criação CreateListForm.tsx
**Files:**
- Modify: `frontend/src/features/lists/components/CreateListForm.tsx:21-57`

- [ ] **Step 1: Atualizar os valores padrão do formulário**
  No hook `useForm<CreateListValues>`, passar `defaultValues: { name: "", isPrivate: false }`.
  
- [ ] **Step 2: Adicionar o Checkbox/Label de privacidade**
  Inserir o HTML do checkbox de privacidade no formulário, abaixo do campo de input.

- [ ] **Step 3: Resetar valores do formulário após envio com sucesso**
  Após chamada bem sucedida, resetar com `reset({ name: "", isPrivate: false })`.

---

### Task 4: Atualizar ListCard.tsx para visualização e alteração de privacidade
**Files:**
- Modify: `frontend/src/features/lists/components/ListCard.tsx:1-87`

- [ ] **Step 1: Importar dependências**
  Importar `updatePrivacy`, `Lock`, e `Eye`.

- [ ] **Step 2: Implementar a função handleTogglePrivacy**
  Chamar `updatePrivacy` com o estado oposto e propagar a alteração chamando `onChange`.

- [ ] **Step 3: Substituir cabeçalho da lista**
  Substituir o elemento na `CardHeader` para exibir o botão com o ícone `Lock` ou `Eye` e suportar a ação `onClick={handleTogglePrivacy}`.

---

### Task 5: Validar a compilação do TypeScript e Lint
**Files:**
- Command: `npm run lint` na pasta `frontend`

- [ ] **Step 1: Rodar o linter**
  Verificar se tudo compila e não há erros de tipagem/linter.
  
- [ ] **Step 2: Commit das alterações**
  Commit com a mensagem apropriada: `git commit -am "feat(frontend): integrate public/private visibility switches in lists management"`
