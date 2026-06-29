# Spec: Perfis de Usuário e Privacidade de Listas

Este documento especifica a nova funcionalidade que permite aos usuários definir a privacidade de suas listas de livros (pública ou privada) e visualizar o perfil público de outros usuários (suas listas públicas e resenhas).

---

## 1. Modificações no Banco de Dados e Modelagem (Backend)

### Tabela `book_lists`
Adicionaremos a coluna `is_private` do tipo `BOOLEAN` com valor padrão `FALSE` (pública).

#### `BookList.java` (Entidade JPA)
```java
@Column(nullable = false)
private boolean isPrivate = false;
```

---

## 2. API Endpoints (Backend)

### A. Listas de Livros

#### Criar Lista (`POST /api/lists`)
O DTO de criação deve aceitar a visibilidade opcional:
```json
{
  "name": "Minha Lista",
  "isPrivate": false
}
```

#### Alternar Privacidade (`PATCH /api/lists/{id}/privacy`) [Novo]
Altera a privacidade de uma lista de forma simples.
- **Request Body**:
  ```json
  {
    "isPrivate": true
  }
  ```
- **Validação**: Apenas o dono da lista pode alterar sua privacidade.

#### Listas de Outro Usuário
No endpoint `/api/lists/me` nada muda (retorna todas as listas do usuário logado, públicas e privadas).
As listas públicas de outros usuários serão servidas via endpoint de perfil.

### B. Perfis de Usuário

#### Detalhes do Perfil (`GET /api/users/{username}/profile`) [Novo]
Retorna informações públicas do usuário.
- **Resposta**:
  ```json
  {
    "username": "bruno_livros",
    "lists": [
      {
        "id": 4,
        "name": "Ficção Científica e Fantasia",
        "books": [
          {
            "id": 1,
            "googleBooksId": "wrOQLV6xB-wC",
            "title": "Harry Potter e a Pedra Filosofal",
            "coverUrl": "..."
          }
        ]
      }
    ],
    "reviews": [
      {
        "id": 2,
        "bookTitle": "Harry Potter e a Pedra Filosofal",
        "googleBooksId": "wrOQLV6xB-wC",
        "rating": 4.0,
        "comment": "Ótimo início de saga...",
        "createdAt": "2026-06-15T09:00:00Z"
      }
    ]
  }
  ```
- **Regra de Negócio**:
  - Filtra apenas listas onde `isPrivate = false`.
  - Retorna todas as resenhas criadas pelo usuário (resenhas são sempre públicas neste projeto).

---

## 3. Interface e Navegação (Frontend)

### A. Criação de Listas
- Modificar o modal de criação de listas para conter um checkbox/switch: **"Tornar esta lista privada"**.
- Enviar o valor no `POST /api/lists`.

### B. Visualização e Edição de Listas (`ListsView` / `ListCard`)
- Adicionar um ícone visual ao lado do nome da lista:
  - 🔒 para listas privadas.
  - 👁️ (ou nada) para listas públicas.
- Adicionar um botão de ação rápida (ex: ícone de alternância ou botão) para mudar a privacidade da lista entre pública e privada.

### C. Navegação para Perfis
- Onde houver exibição de resenha com o nome do autor (ex: "ana_leitora"):
  - Transformar o texto em um link clicável apontando para `/profile/ana_leitora`.
  - Adicionar hover effect com sublinhado e mudança suave de cor.

### D. Tela de Perfil Público (`frontend/src/app/profile/[username]/page.tsx`) [Novo]
- Buscar dados de `/api/users/{username}/profile` usando `apiFetch`.
- Layout com avatar elegante contendo a inicial do usuário.
- Abas ou seções para:
  - **Listas Públicas**: Cards das listas públicas do usuário com seus respectivos livros.
  - **Resenhas**: Lista de resenhas detalhadas contendo nota, livro avaliado e link rápido para a página do livro.

---

## 4. Plano de Validação e Testes

### Testes de Integração Backend
1. **Criar lista**: Verificar se cria com `isPrivate` correto (padrão `false`).
2. **Alternar privacidade**: Chamar endpoint `PATCH /api/lists/{id}/privacy` e verificar alteração no banco.
3. **Restrição de acesso**: Impedir que Usuário B altere a privacidade da lista do Usuário A.
4. **Endpoint de Perfil**:
   - Chamar perfil do Usuário A e confirmar que listas privadas **NÃO** aparecem na resposta.
   - Confirmar que listas públicas e todas as resenhas dele aparecem.

### Testes Manuais Frontend
1. Criar lista privada e confirmar o ícone de cadeado.
2. Clicar no nome de um usuário em uma resenha no Dashboard e ser redirecionado para `/profile/{username}`.
3. Visualizar o perfil de outro usuário e atestar que apenas suas listas públicas são listadas.
