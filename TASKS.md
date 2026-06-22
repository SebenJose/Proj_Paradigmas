# Tasks do projeto — Letterbox de Livros

Checklist sequencial do trabalho final. As fases de **backend vêm antes do frontend** porque o frontend depende dos endpoints já existirem. Dentro de cada fase, as tasks também são sequenciais (uma task geralmente depende da anterior pra compilar). Cada fase termina com uma task de teste manual via Insomnia/Postman ou na própria UI — só passe pra próxima fase depois de validar.

Pacotes do backend ficam sob `backend/src/main/java/utfpr/com/Proj_Paradigmas/`: `config`, `controller`, `service`, `repository`, `model`, `dto`, `security`, `exception`.

## Regras de implementação

Valem para todas as tasks abaixo, nos dois projetos:

- **Formulários com `react-hook-form` + Zod.** Todo formulário tem um schema Zod (ex: `frontend/src/features/auth/schemas.ts`) e usa `useForm` com `zodResolver(schema)` (de `@hookform/resolvers/zod`) — nada de `useState` manual por campo nem validação com `if`s soltos. O service da feature deve usar o tipo inferido do schema (`z.infer<typeof schema>`) em vez de duplicar a interface à mão.
- **Componentes genéricos vêm do shadcn.** Já configurado em `frontend/components.json` (aliases apontando para `@/shared/components/ui`). Antes de criar um botão/input/card do zero, rode `npx shadcn add <componente>` na pasta `frontend/` e use o que já existe em `shared/components/ui/`. Esse projeto usa o preset **Nova** do shadcn, que substitui o componente clássico `Form` pelos primitivos `Field`/`FieldLabel`/`FieldError` (`shared/components/ui/field.tsx`) — agnósticos de lib de validação, alimentados com os erros do `formState.errors` do `react-hook-form`. O `LoginForm` (`frontend/src/features/auth/components/LoginForm.tsx`) é a referência desse padrão — copie a estrutura dele pros próximos formulários (registro, review, listas).
- **Código limpo e fortemente tipado.** Proibido usar `any` (TypeScript) ou tipos brutos sem necessidade no Java — sempre tipar explicitamente parâmetros, retornos e DTOs. Em TS, prefira `unknown` + narrowing a `any` quando o tipo for genuinamente desconhecido.
- **DRY** — não duplicar lógica/tipos; extrair para `shared/` (frontend) ou `service`/`dto` reaproveitável (backend) quando o mesmo código aparecer em mais de um lugar.
- **SoC (Separation of Concerns)** — respeitar as camadas já definidas: `controller` não tem regra de negócio, `service` não conhece HTTP, componente de UI não faz chamada de API direto (sempre via `services/` da feature).
- **SOLID** — principalmente Single Responsibility (uma classe/componente, uma razão pra mudar) e Dependency Inversion (`service` depende de abstração do `repository`, não de detalhes do JPA espalhados pela regra de negócio).
- **KISS** — preferir a solução mais simples que resolve a task; não introduzir abstração/generalização para casos que ainda não existem.

---

## Fase 1 — Backend: Fundação e Segurança

- [x] Adicionar dependência do JWT (`io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson`) no `backend/pom.xml`
- [x] Criar entidade `User` em `model/User.java` (`id, username, email, passwordHash, createdAt`)
- [x] Criar `UserRepository` em `repository/UserRepository.java` (`findByUsername`)
- [x] Criar `dto/RegisterRequest.java` e `dto/AuthResponse.java`
- [x] Criar `CustomUserDetailsService` em `security/CustomUserDetailsService.java`
- [x] Criar bean `PasswordEncoder` (BCrypt) em `config/SecurityConfig.java`
- [x] Criar `JwtService` em `security/JwtService.java` (gerar/validar token, lendo o segredo de `JWT_SECRET`)
- [x] Criar `JwtAuthFilter` em `security/JwtAuthFilter.java`
- [x] Finalizar `SecurityConfig`: `permitAll` em `POST /api/auth/register`, Basic Auth obrigatório em `POST /api/auth/login`, JWT exigido nas demais rotas `/api/**` (inclui CORS liberado para o frontend chamar a API)
- [x] Criar `AuthService` em `service/AuthService.java` (registra usuário com senha criptografada)
- [x] Criar `AuthController` em `controller/AuthController.java` (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` para validar o JWT)
- [x] Criar `GlobalExceptionHandler` em `exception/GlobalExceptionHandler.java` (400 validação, 401 autenticação, 409 conflito, 404 não encontrado)
- [x] Adicionar `JWT_SECRET` (com valor padrão de dev) em `application.properties`, `.env.example` e `docker-compose.yml`
- [x] **Testar**: registrar usuário, logar (Basic Auth) e confirmar que o JWT retornado autentica numa rota protegida

## Fase 2 — Backend: Livros via Google Books

- [ ] Criar entidade `Book` em `model/Book.java` (`id, googleBooksId, title, authors, description, coverUrl, publishedDate, pageCount`)
- [ ] Criar `BookRepository` em `repository/BookRepository.java` (`findByGoogleBooksId`)
- [ ] Criar `dto/GoogleBookVolumeDto.java` (mapeia o JSON da Google Books API)
- [ ] Criar bean `RestClient` em `config/RestClientConfig.java` apontando para `https://www.googleapis.com/books/v1`
- [ ] Criar `GoogleBooksClient` em `service/GoogleBooksClient.java` (busca por texto na API externa, sem chave)
- [ ] Criar `dto/BookSearchResultDto.java` e `dto/BookDetailResponse.java`
- [ ] Criar `BookService` em `service/BookService.java` (busca ao vivo na Google API + `findOrCreate` do cache local)
- [ ] Criar `BookController` em `controller/BookController.java` (`GET /api/books/search?q=`, `GET /api/books/{googleBooksId}`)
- [ ] **Testar**: buscar um livro real (ex: "Harry Potter") no Insomnia/Postman e conferir os campos retornados

## Fase 3 — Backend: Reviews

- [ ] Criar entidade `Review` em `model/Review.java` (`@ManyToOne User`, `@ManyToOne Book`, `rating 1-5`, `comment`, constraint única `user_id + book_id`)
- [ ] Criar `ReviewRepository` em `repository/ReviewRepository.java` (`findByBookId`, `existsByUserAndBook`, query de média/contagem por livro)
- [ ] Criar `dto/ReviewRequest.java` e `dto/ReviewResponse.java`
- [ ] Criar `ReviewService` em `service/ReviewService.java` (valida nota 1-5, impede review duplicado, cria o `Book` no cache se ainda não existir)
- [ ] Criar `ReviewController` em `controller/ReviewController.java` (`POST /api/reviews`, `GET /api/reviews/me`)
- [ ] Atualizar `BookService`/`BookController` para incluir média e lista de reviews no `GET /api/books/{googleBooksId}`
- [ ] **Testar**: criar um review, tentar duplicar (deve falhar com 409) e conferir a média atualizada no livro

## Fase 4 — Backend: Listas de livros

- [ ] Criar entidade `BookList` em `model/BookList.java` (`@ManyToOne User`, `@ManyToMany Book`, `name`)
- [ ] Criar `BookListRepository` em `repository/BookListRepository.java`
- [ ] Criar `dto/BookListRequest.java` e `dto/BookListResponse.java`
- [ ] Criar `BookListService` em `service/BookListService.java` (criar lista, adicionar/remover livro, nome único por usuário)
- [ ] Criar `BookListController` em `controller/BookListController.java` (`POST /api/lists`, `POST /api/lists/{id}/books`, `DELETE /api/lists/{id}/books/{bookId}`, `GET /api/lists/me`)
- [ ] **Testar**: criar a lista "Quero ler", adicionar 2 livros e listar

## Fase 5 — Backend: Dashboard

- [ ] Adicionar queries agregadas no `ReviewRepository` (top livros por média, livros mais avaliados, reviews recentes)
- [ ] Criar `dto/DashboardResponse.java`
- [ ] Criar `DashboardService` em `service/DashboardService.java`
- [ ] Criar `DashboardController` em `controller/DashboardController.java` (`GET /api/dashboard`)
- [ ] **Testar**: com pelo menos 3 livros avaliados por usuários diferentes, conferir se o dashboard reflete os dados certos

## Fase 6 — Frontend: Autenticação

- [ ] Adicionar `register()` em `frontend/src/features/auth/services/auth.service.ts`
- [ ] Criar `frontend/src/features/auth/components/RegisterForm.tsx`
- [ ] Criar rota `frontend/src/app/register/page.tsx`
- [ ] Adicionar link cruzado entre `/login` e `/register`
- [ ] **Testar**: criar conta nova pela tela e confirmar que loga automaticamente depois

## Fase 7 — Frontend: Busca e detalhe de livro

- [ ] Criar `frontend/src/features/books/types.ts`
- [ ] Criar `frontend/src/features/books/services/book.service.ts` (`search`, `getByGoogleId`)
- [ ] Criar `frontend/src/features/books/components/BookSearchForm.tsx` e `BookCard.tsx`
- [ ] Criar rota `frontend/src/app/books/page.tsx` (busca + grid de resultados)
- [ ] Criar feature `frontend/src/features/reviews/` (`types.ts`, `services/review.service.ts`, `components/ReviewForm.tsx`)
- [ ] Criar rota `frontend/src/app/books/[googleBooksId]/page.tsx` (detalhe do livro + média + reviews + formulário)
- [ ] **Testar**: buscar um livro, abrir o detalhe e enviar um review pela UI

## Fase 8 — Frontend: Listas

- [ ] Criar `frontend/src/features/lists/types.ts` e `services/list.service.ts`
- [ ] Criar `frontend/src/features/lists/components/CreateListForm.tsx` e `ListCard.tsx`
- [ ] Adicionar botão "adicionar à lista" na página de detalhe do livro
- [ ] Criar rota `frontend/src/app/lists/page.tsx`
- [ ] **Testar**: criar lista e adicionar/remover livro pela UI

## Fase 9 — Frontend: Dashboard

- [ ] Criar `frontend/src/features/dashboard/types.ts` e `services/dashboard.service.ts`
- [ ] Criar `frontend/src/features/dashboard/components/DashboardView.tsx` (cards de top rated, mais avaliados, recentes)
- [ ] Criar rota `frontend/src/app/dashboard/page.tsx`
- [ ] **Testar**: dashboard refletindo os dados criados nas fases anteriores

## Fase 10 — Polimento

- [ ] Criar navegação comum `frontend/src/shared/components/NavBar.tsx` (Home, Buscar, Listas, Dashboard, Login/Logout)
- [ ] Padronizar estados de loading/erro nas chamadas à API (reaproveitar `ApiError` de `shared/lib/api-client.ts`)
- [ ] Atualizar `README.md` com a lista de endpoints da API e a variável `JWT_SECRET`
- [ ] Revisão final: `docker compose up --build` do zero e validar o fluxo completo (registro → login → busca → review → lista → dashboard)
