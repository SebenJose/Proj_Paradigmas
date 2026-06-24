# Proj Paradigmas

Trabalho final da disciplina **Paradigmas de Linguagens de Programação (CC25B)** — UTFPR Câmpus Santa Helena.

Stack: API REST em **Spring Boot** (Java 26) com **PostgreSQL**, autenticação **Basic Auth → JWT**, e front-end em **Next.js 16 + React + TypeScript + TailwindCSS**, tudo orquestrado via **Docker Compose**.

---

## 1. Como rodar o projeto

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose (vem junto no Docker Desktop / Docker Engine atual)

### 1.1. Clonando o repositório e baixando as dependências

```bash
git clone <url-do-repositorio>
cd Proj_Paradigmas
```

O projeto tem duas pastas com dependências próprias: `backend/` (Maven) e `frontend/` (npm). Você não precisa instalar nada manualmente para rodar via Docker (o `docker compose up --build` baixa tudo dentro da imagem), mas se for abrir o projeto no editor/IDE ou rodar fora do Docker (seção 1.4), baixe as dependências de cada lado assim:

**Back-end** — usa o Maven Wrapper (`mvnw`), então não precisa ter o Maven instalado, só o JDK 26:

```bash
cd backend
./mvnw dependency:go-offline
cd ..
```

**Front-end** — precisa do Node.js 24+ instalado:

```bash
cd frontend
npm install
cd ..
```

### 1.2. Subindo tudo com Docker (forma recomendada)

Esse caminho sobe os 3 serviços juntos: banco, API e front-end. É o jeito mais simples de rodar o projeto completo.

```bash
# na raiz do repositório
cp .env.example .env
docker compose up --build
```

Isso vai:
- subir o **PostgreSQL** na porta `5432`
- buildar e subir a **API Spring Boot** na porta `8080`
- buildar e subir o **front-end Next.js** na porta `3000`

Acesse:
- Front-end: http://localhost:3000
- API: http://localhost:8080

Para derrubar tudo:

```bash
docker compose down
```

Para derrubar e apagar também os dados do banco (volume):

```bash
docker compose down -v
```

> O arquivo `.env` (copiado do `.env.example`) define `DB_NAME`, `DB_USER`, `DB_PASSWORD` e `NEXT_PUBLIC_API_URL`. Ajuste se precisar, mas os valores padrão já funcionam para rodar local.

### 1.3. Rodando só um serviço

Depois do primeiro `docker compose up --build`, para rebuildar e reiniciar só um serviço (ex: depois de mudar o código do back-end):

```bash
docker compose up -d --build backend
```

Trocar `backend` por `frontend` ou `postgres` conforme o caso.

### 1.4. Desenvolvendo sem Docker (hot reload)

Para o dia a dia de desenvolvimento, pode ser mais rápido rodar o back-end e o front-end direto na máquina, com hot reload, e usar Docker só para o banco. Requer JDK 26 e Node.js 24+ instalados (veja 1.1 para baixar as dependências antes).

**Back-end** (em `backend/`):

```bash
cd backend
./mvnw spring-boot:run
```

O back-end usa o [Spring Boot Docker Compose Support](https://docs.spring.io/spring-boot/reference/features/dev-services.html): ao rodar `./mvnw spring-boot:run`, ele detecta o `backend/compose.yaml` e sobe um container do PostgreSQL sozinho, automaticamente. Não precisa rodar o `docker-compose.yml` da raiz para isso.

**Front-end** (em `frontend/`):

```bash
cd frontend
cp .env.local.example .env.local
npm run dev
```

Acesse http://localhost:3000 — o front-end vai apontar para a API em `http://localhost:8080` (definido em `.env.local`).

### 1.5. Comandos úteis

| Comando | Onde rodar | O que faz |
|---|---|---|
| `./mvnw spring-boot:run` | `backend/` | Sobe a API localmente (com hot reload e banco automático) |
| `./mvnw clean package` | `backend/` | Gera o `.jar` da API |
| `npm install` | `frontend/` | Instala as dependências do front-end |
| `npm run dev` | `frontend/` | Sobe o front-end em modo desenvolvimento |
| `npm run build` | `frontend/` | Gera o build de produção do front-end |
| `npm run lint` | `frontend/` | Roda o ESLint |
| `docker compose up --build` | raiz | Sobe banco + API + front-end via Docker |
| `docker compose down` | raiz | Derruba os containers |
| `docker compose logs -f backend` | raiz | Acompanha os logs de um serviço |

---

## 2. Sobre o projeto

### 2.1. Visão geral

O sistema é dividido em dois projetos independentes que se comunicam por HTTP:

- **`backend/`** — API REST feita em Spring Boot, responsável por toda a regra de negócio, persistência no PostgreSQL e autenticação.
- **`frontend/`** — aplicação Next.js que consome essa API e renderiza a interface para o usuário.

O `docker-compose.yml` da raiz só existe para orquestrar os dois junto com o banco de dados — ele não contém lógica da aplicação.

### 2.2. Stack utilizada

- **Java 26** + **Spring Boot 4** (Spring Web, Spring Data JPA, Spring Security)
- **PostgreSQL** como banco relacional
- **Maven** (via Maven Wrapper, `mvnw`) para build do back-end
- **Lombok** para reduzir boilerplate (getters/setters/construtores)
- **JWT** + **Basic Auth** para autenticação (ver seção 2.5)
- **Next.js 16** + **React 19** + **TypeScript** + **TailwindCSS 4** para o front-end
- **shadcn/ui** (preset Nova) para os componentes genéricos de UI e **Zod** para validação de formulários
- **Docker / Docker Compose** para empacotar e rodar tudo junto
- **Insomnia/Postman** para testar a API manualmente

### 2.3. Organização do back-end (`backend/src/main/java/...`)

A API segue arquitetura em camadas, cada uma com uma responsabilidade única:

- **`config`** — classes que customizam o comportamento global do Spring (segurança, CORS, beans de terceiros). Regras transversais que afetam todas as outras camadas.
- **`controller`** — ponto de entrada HTTP (`@RestController`). Recebe a requisição, desserializa o JSON, repassa para a `service` e devolve o `ResponseEntity`. Não tem regra de negócio.
- **`service`** — onde fica a regra de negócio, validações e controle transacional (`@Transactional`). Não conhece HTTP nem detalhes do banco, então dá pra testar isolado.
- **`repository`** — interfaces que estendem `JpaRepository`/Spring Data para acessar o banco, sem precisar escrever SQL/JDBC na mão.
- **`model`** — entidades JPA (`@Entity`) que representam as tabelas do banco e seus relacionamentos (`@ManyToOne`, `@ManyToMany` etc).
- **`dto`** — objetos usados para entrada/saída da API, para não expor as entidades do `model` diretamente nos endpoints.
- **`security`** — configuração do Spring Security e o filtro/serviço de JWT (`SecurityConfig`, `JwtAuthFilter`, `JwtService`).
- **`exception`** — tratamento centralizado de erros (`@RestControllerAdvice`), para a API responder erros de forma padronizada.

A configuração de conexão com o banco fica em `backend/src/main/resources/application.properties`, lida a partir de variáveis de ambiente (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) — por isso o mesmo `.jar` funciona tanto local quanto dentro do Docker, só mudando as variáveis.

### 2.4. Organização do front-end (`frontend/src/`)

O front-end usa organização **feature-based**: o código é agrupado por funcionalidade de negócio, não por tipo de arquivo.

- **`app/`** — rotas do Next.js (App Router). Cada `page.tsx` deve ser "fina": só monta a tela usando componentes vindos de `features/`, sem lógica de negócio.
- **`features/`** — uma pasta por funcionalidade do sistema. Cada feature é dona dos seus próprios `components/`, `services/` (chamadas à API) e `types.ts`, e exporta o que for público via um `index.ts`. Hoje existe a feature `auth/` (login); novas features (ex: o domínio do trabalho) devem seguir o mesmo padrão.
- **`shared/`** — código realmente compartilhado entre features: `lib/` (cliente HTTP, variáveis de ambiente), `components/` (UI genérica), `hooks/` (hooks reutilizáveis), `types/` (tipos globais).

Essa separação evita que features diferentes fiquem acopladas e deixa claro onde adicionar código novo: se é específico de uma funcionalidade, vai em `features/<nome>/`; se é genérico, vai em `shared/`.

### 2.5. Autenticação

O fluxo de autenticação combina os dois métodos pedidos no trabalho:

1. O usuário faz login em `POST /auth/login` enviando `Authorization: Basic <usuario:senha em base64>`.
2. O back-end valida as credenciais e devolve um **JWT**.
3. O front-end guarda esse token e passa a enviá-lo como `Authorization: Bearer <token>` em todas as outras requisições (isso já está implementado em `frontend/src/shared/lib/api-client.ts`).
4. No back-end, o `SecurityConfig` libera `/auth/login` com Basic Auth e protege as demais rotas com um filtro que valida o JWT.

### 2.6. Docker

- `backend/Dockerfile` — build multi-stage: compila o `.jar` com Maven numa imagem com JDK e roda numa imagem só com JRE (imagem final menor).
- `frontend/Dockerfile` — build multi-stage equivalente, usando o modo `standalone` do Next.js.
- `docker-compose.yml` (raiz) — sobe os três serviços (`postgres`, `backend`, `frontend`) na mesma rede, já com `healthcheck` no banco para o back-end só subir depois que o Postgres estiver pronto.
- `backend/compose.yaml` — **não é o mesmo arquivo do compose da raiz**. É usado só pelo Spring Boot Docker Compose Support quando você roda a API direto pela IDE/`mvnw` (fora de Docker), para subir um Postgres automaticamente em desenvolvimento.

---

## 3. Endpoints da API e Variáveis de Ambiente

### 3.1. Variável de Ambiente: `JWT_SECRET`

A variável `JWT_SECRET` define a chave secreta usada para assinar e validar os tokens JWT gerados no login. 
- **Ambiente de Desenvolvimento**: O sistema possui uma chave de desenvolvimento padrão configurada em `application.properties`, `.env.example` e `docker-compose.yml`.
- **Ambiente de Produção**: Deve ser obrigatoriamente sobrescrita com um hash seguro de pelo menos 256 bits para garantir a segurança da autenticação.

### 3.2. Catálogo de Endpoints da API

Todas as chamadas (exceto o registro de novos usuários) exigem autenticação ativa.

#### Autenticação (`/api/auth/**`)
- `POST /api/auth/register` (Público) — Cria uma nova conta de usuário.
  - **Body**: `{ "username": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login` (Basic Auth) — Autentica o usuário com Basic Auth e retorna o token JWT.
  - **Header**: `Authorization: Basic <base64(username:password)>`
  - **Resposta**: `{ "token": "..." }`
- `GET /api/auth/me` (JWT) — Retorna o username do usuário autenticado no token.
  - **Header**: `Authorization: Bearer <JWT_TOKEN>`

#### Livros (`/api/books/**`)
- `GET /api/books/search?q={query}` (JWT) — Realiza busca de livros na Google Books API e armazena os metadados localmente no cache do banco.
- `GET /api/books/{googleBooksId}` (JWT) — Retorna as informações detalhadas de um livro específico.

#### Avaliações (`/api/reviews/**`)
- `GET /api/reviews/book/{googleBooksId}` (JWT) — Retorna a média de notas, a contagem total e a lista de avaliações escritas para um livro.
  - **Resposta**: `{ "averageRating": 4.5, "reviewCount": 12, "reviews": [ ... ] }`
- `POST /api/reviews` (JWT) — Cria uma nova avaliação para um livro. Lança conflito (409) caso o usuário já tenha avaliado o mesmo livro.
  - **Body**: `{ "googleBooksId": "...", "rating": 5, "comment": "Muito bom!" }`
- `GET /api/reviews/me` (JWT) — Retorna a lista de avaliações realizadas pelo próprio usuário autenticado.

#### Listas de Livros (`/api/lists/**`)
- `GET /api/lists/me` (JWT) — Lista todas as listas de livros criadas pelo usuário autenticado.
- `POST /api/lists` (JWT) — Cria uma nova lista vazia. Lança conflito (409) caso o usuário já possua uma lista com o mesmo nome.
  - **Body**: `{ "name": "Minha Lista" }`
- `POST /api/lists/{id}/books` (JWT) — Adiciona um livro a uma lista existente.
  - **Body**: `{ "googleBooksId": "...", "title": "...", "coverUrl": "..." }`
- `DELETE /api/lists/{id}/books/{bookId}` (JWT) — Remove o livro (por seu `bookId` interno) da lista especificada.

#### Dashboard (`/api/dashboard`)
- `GET /api/dashboard` (JWT) — Retorna as estatísticas agrupadas para a visualização do painel.
  - **Resposta**: `{ "topRated": [ ... ], "mostReviewed": [ ... ], "recentReviews": [ ... ] }`
