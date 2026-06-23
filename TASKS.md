# Tasks do projeto — Letterbox de Livros

Checklist sequencial do trabalho final. Dentro de cada fase, as tasks são sequenciais (uma task geralmente depende da anterior pra compilar). Cada fase termina com uma task de teste manual via Insomnia/Postman ou na própria UI — só passe pra próxima fase depois de validar.

Pacotes do backend ficam sob `backend/src/main/java/utfpr/com/Proj_Paradigmas/`: `config`, `controller`, `service`, `repository`, `model`, `dto`, `security`, `exception`.

## Backend e frontend em paralelo (MSW)

Originalmente o frontend só avançava depois de cada fase de backend correspondente existir. Como o grupo dividiu o trabalho (uma pessoa segue no backend das Fases 3-5, o resto já avança no frontend), o frontend das Fases 7-9 foi construído **contra mocks**, usando [MSW (Mock Service Worker)](https://mswjs.io/), em vez de esperar o backend real.

- `frontend/src/mocks/handlers/` — um arquivo por domínio mockado (`reviews.ts`, `lists.ts`, `dashboard.ts`). Só esses três domínios são mockados.
- `frontend/src/mocks/data.ts` — estado em memória (arrays) usado pelos handlers, com alguns dados de exemplo já seedados pra Dashboard/Listas não começarem vazios. **Esse estado é só em memória do Service Worker** — reseta ao fechar a aba ou se o navegador derrubar o worker por inatividade. Não é uma solução de persistência, é só pra dar vida à UI enquanto o backend real não existe.
- `frontend/src/mocks/MockProvider.tsx` — componente client montado no `layout.tsx` raiz que liga o MSW (`worker.start()`) só quando `NEXT_PUBLIC_API_MOCKING=enabled` (ver `.env.local.example`).
- **Auth (`/api/auth/**`) e Books (`/api/books/**`) NÃO são mockados** — são chamadas reais pro backend Spring Boot, porque as Fases 1 e 2 já existem de verdade.

### Quando o backend real de Reviews/Listas/Dashboard estiver pronto

1. Quem implementar cada fase deve seguir **exatamente** o contrato descrito na seção "Contrato de API esperado pelo frontend" abaixo — o frontend já foi escrito contra esse formato e não deve precisar mudar.
2. Depois de validar o endpoint real no Insomnia/Postman, é só apagar o arquivo correspondente em `frontend/src/mocks/handlers/` (e a entrada dele em `frontend/src/mocks/handlers/index.ts`). Sem handler MSW pra aquele path, a chamada passa direto pro backend real (o `MockProvider` já está configurado com `onUnhandledRequest: "bypass"`).
3. Quando os três domínios tiverem backend real, dá pra remover a pasta `frontend/src/mocks/` inteira e a dependência `msw` do `package.json`.

### Contrato de API esperado pelo frontend (Reviews / Listas / Dashboard)

Esses são os endpoints que os mocks implementam hoje e que o backend real (Fases 3-5) precisa replicar. Tipos completos em `frontend/src/features/{reviews,lists,dashboard}/types.ts`.

**Reviews**
- `GET /api/reviews/book/{googleBooksId}` → `{ averageRating: number | null, reviewCount: number, reviews: Review[] }` (nota: isso é uma rota própria, **não** fica embutido em `GET /api/books/{id}` como o rascunho original da Fase 3 sugeria — ver nota abaixo)
- `POST /api/reviews` com body `{ googleBooksId, rating (1-5), comment }` → `Review` (201). 409 se o usuário já avaliou esse livro.
- `GET /api/reviews/me` → `Review[]`
- `Review` = `{ id, username, googleBooksId, rating, comment, createdAt }`

**Listas**
- `GET /api/lists/me` → `BookList[]`
- `POST /api/lists` com body `{ name }` → `BookList` (201). 409 se já existe lista com esse nome pro usuário.
- `POST /api/lists/{id}/books` com body `{ googleBooksId, title, coverUrl }` → `BookList` atualizado. O frontend manda `title`/`coverUrl` direto (já tem esses dados carregados na tela do livro) — o backend real pode ignorá-los e usar o `Book` já cacheado pelo `googleBooksId`, ou aceitá-los, tanto faz.
- `DELETE /api/lists/{id}/books/{bookId}` → `BookList` atualizado. `{bookId}` é o id interno do `Book` (não o `googleBooksId`).
- `BookList` = `{ id, name, books: BookSummary[] }`, `BookSummary` = `{ id, googleBooksId, title, coverUrl }`

**Dashboard**
- `GET /api/dashboard` → `{ topRated: BookRatingSummary[], mostReviewed: BookRatingSummary[], recentReviews: Review[] }`
- `BookRatingSummary` = `{ googleBooksId, title, coverUrl, averageRating, reviewCount }`

> **Nota sobre a Fase 3:** o rascunho original tinha a média/lista de reviews embutida em `GET /api/books/{googleBooksId}` (via `BookService`/`BookController`). Isso foi trocado por uma rota própria (`GET /api/reviews/book/{googleBooksId}`) pra desacoplar Reviews de Books — assim o endpoint de Books (já real) não precisa ser tocado de novo, e o mock de Reviews não depende de simular o endpoint de Books também. Ajuste a task da Fase 3 abaixo de acordo.

## Regras de implementação

Valem para todas as tasks abaixo, nos dois projetos:

- **Formulários com `react-hook-form` + Zod.** Todo formulário tem um schema Zod (ex: `frontend/src/features/auth/schemas.ts`) e usa `useForm` com `zodResolver(schema)` (de `@hookform/resolvers/zod`) — nada de `useState` manual por campo nem validação com `if`s soltos. O service da feature deve usar o tipo inferido do schema (`z.infer<typeof schema>`) em vez de duplicar a interface à mão.
- **Componentes genéricos vêm do shadcn — sempre.** Já configurado em `frontend/components.json` (aliases apontando para `@/shared/components/ui`). Antes de criar um botão/input/card/select/etc do zero, primeiro confira se já existe em `shared/components/ui/` (hoje tem `button`, `card`, `field`, `input`, `label`, `select`, `separator`, `textarea`, `badge`). Se não existir, rode `npx shadcn add <componente>` na pasta `frontend/` em vez de escrever o componente na mão — não duplicar o que o shadcn já resolve. Esse projeto usa o preset **Nova** do shadcn, que substitui o componente clássico `Form` pelos primitivos `Field`/`FieldLabel`/`FieldError` (`shared/components/ui/field.tsx`) — agnósticos de lib de validação, alimentados com os erros do `formState.errors` do `react-hook-form`. O `LoginForm` (`frontend/src/features/auth/components/LoginForm.tsx`) é a referência desse padrão — copie a estrutura dele pros próximos formulários.
  - **Customize editando o arquivo gerado, não envolvendo com wrapper.** Os componentes em `shared/components/ui/` são código seu assim que o `shadcn add` termina (não é uma lib externa importada) — se a necessidade da tela pedir uma variante, tamanho, cor ou comportamento que o componente gerado não cobre, edite o próprio arquivo (ex: adicionar uma entrada em `buttonVariants`/`cva` do `button.tsx`) em vez de criar um componente novo do zero ou empilhar um wrapper por cima só pra mudar estilo. Isso mantém um único lugar de verdade por componente genérico e evita duas formas diferentes de renderizar a mesma coisa (ex: dois "botões" com classNames divergentes espalhados pelas features).
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

- [x] Criar entidade `Book` em `model/Book.java` (`id, googleBooksId, title, authors, description, coverUrl, publishedDate, pageCount`)
- [x] Criar `BookRepository` em `repository/BookRepository.java` (`findByGoogleBooksId`)
- [x] Criar `dto/GoogleBookVolumeDto.java` (mapeia o JSON da Google Books API)
- [x] Criar bean `RestClient` em `config/RestClientConfig.java` apontando para `https://www.googleapis.com/books/v1`
- [x] Criar `GoogleBooksClient` em `service/GoogleBooksClient.java` (busca por texto na API externa, sem chave)
- [x] Criar `dto/BookSearchResultDto.java` e `dto/BookDetailResponse.java`
- [x] Criar `BookService` em `service/BookService.java` (busca ao vivo na Google API + `findOrCreate` do cache local)
- [x] Criar `BookController` em `controller/BookController.java` (`GET /api/books/search?q=`, `GET /api/books/{googleBooksId}`)
- [ ] **Testar**: buscar um livro real (ex: "Harry Potter") no Insomnia/Postman e conferir os campos retornados — **não foi possível validar neste ambiente**: a Google Books API está com cota diária zerada para a rede daqui (confirmado com `curl` direto, fora da aplicação, retornando o mesmo `429`). O fluxo de auth, segurança e tratamento de erro (502 limpo em vez de exceção crua) foi validado de ponta a ponta; falta só rodar essa busca numa rede sem esse bloqueio (ex: na sua máquina) pra conferir os campos de um livro real

## Fase 3 — Backend: Reviews

> Siga o contrato documentado em "Contrato de API esperado pelo frontend" no topo deste arquivo — o frontend já está pronto contra ele (mockado via MSW). Quando essa fase terminar, é só apagar `frontend/src/mocks/handlers/reviews.ts` (e a referência em `handlers/index.ts`) que o frontend passa a falar com o backend real sem nenhuma outra mudança.

- [ ] Criar entidade `Review` em `model/Review.java` (`@ManyToOne User`, `@ManyToOne Book`, `rating 1-5`, `comment`, constraint única `user_id + book_id`)
- [ ] Criar `ReviewRepository` em `repository/ReviewRepository.java` (`findByBookId`, `existsByUserAndBook`, query de média/contagem por livro)
- [ ] Criar `dto/ReviewRequest.java` e `dto/ReviewResponse.java`
- [ ] Criar `ReviewService` em `service/ReviewService.java` (valida nota 1-5, impede review duplicado, cria o `Book` no cache se ainda não existir)
- [ ] Criar `ReviewController` em `controller/ReviewController.java` com `GET /api/reviews/book/{googleBooksId}` (média + contagem + lista), `POST /api/reviews`, `GET /api/reviews/me` — **não** mexe em `BookController`/`BookService` (ver nota sobre o contrato no topo do arquivo)
- [ ] **Testar**: criar um review, tentar duplicar (deve falhar com 409) e conferir a média em `GET /api/reviews/book/{googleBooksId}`

## Fase 4 — Backend: Listas de livros

> Siga o contrato documentado em "Contrato de API esperado pelo frontend" no topo deste arquivo. Quando terminar, apague `frontend/src/mocks/handlers/lists.ts` (e a referência em `handlers/index.ts`).

- [ ] Criar entidade `BookList` em `model/BookList.java` (`@ManyToOne User`, `@ManyToMany Book`, `name`)
- [ ] Criar `BookListRepository` em `repository/BookListRepository.java`
- [ ] Criar `dto/BookListRequest.java` e `dto/BookListResponse.java`
- [ ] Criar `BookListService` em `service/BookListService.java` (criar lista, adicionar/remover livro, nome único por usuário)
- [ ] Criar `BookListController` em `controller/BookListController.java` (`POST /api/lists`, `POST /api/lists/{id}/books`, `DELETE /api/lists/{id}/books/{bookId}`, `GET /api/lists/me`)
- [ ] **Testar**: criar a lista "Quero ler", adicionar 2 livros e listar

## Fase 5 — Backend: Dashboard

> Siga o contrato documentado em "Contrato de API esperado pelo frontend" no topo deste arquivo. Quando terminar, apague `frontend/src/mocks/handlers/dashboard.ts` (e a referência em `handlers/index.ts`).

- [ ] Adicionar queries agregadas no `ReviewRepository` (top livros por média, livros mais avaliados, reviews recentes)
- [ ] Criar `dto/DashboardResponse.java`
- [ ] Criar `DashboardService` em `service/DashboardService.java`
- [ ] Criar `DashboardController` em `controller/DashboardController.java` (`GET /api/dashboard`)
- [ ] **Testar**: com pelo menos 3 livros avaliados por usuários diferentes, conferir se o dashboard reflete os dados certos

## Fase 6 — Frontend: Autenticação

- [x] Adicionar `register()` em `frontend/src/features/auth/services/auth.service.ts`
- [x] Criar `frontend/src/features/auth/components/RegisterForm.tsx`
- [x] Criar rota `frontend/src/app/register/page.tsx`
- [x] Adicionar link cruzado entre `/login` e `/register`
- [x] **Testado** (browser real, Playwright): criar conta nova pela tela confirma login automático e a NavBar atualiza pra "Sair". De brinde, corrigido um bug que já existia: `login()` chamava `${API_URL}/auth/login` sem o prefixo `/api` (a rota real é `/api/auth/login`).

## Fase 7 — Frontend: Busca e detalhe de livro

- [x] Criar `frontend/src/features/books/types.ts`
- [x] Criar `frontend/src/features/books/services/book.service.ts` (`search`, `getByGoogleId`) — fala com o backend real (Fase 2, sem mock)
- [x] Criar `frontend/src/features/books/components/BookSearchForm.tsx` e `BookCard.tsx`
- [x] Criar rota `frontend/src/app/books/page.tsx` (busca + grid de resultados)
- [x] Criar feature `frontend/src/features/reviews/` (`types.ts`, `services/review.service.ts`, `components/ReviewForm.tsx`, `components/ReviewList.tsx`) — fala com os mocks MSW (Fase 3 ainda não existe)
- [x] Criar rota `frontend/src/app/books/[googleBooksId]/page.tsx` (detalhe do livro + média + reviews + formulário)
- [x] **Testado parcialmente**: a tela de busca renderiza e trata erro corretamente, mas a busca em si (`GET /api/books/search`) não retornou resultado real neste ambiente — mesma limitação de rede da Fase 2 (cota da Google Books API zerada aqui). O formulário de review (mockado) não foi exercitado de ponta a ponta por depender de abrir um livro real primeiro; teste isso na sua máquina depois que a busca funcionar.

## Fase 8 — Frontend: Listas

- [x] Criar `frontend/src/features/lists/types.ts` e `services/list.service.ts` — fala com os mocks MSW (Fase 4 ainda não existe)
- [x] Criar `frontend/src/features/lists/components/CreateListForm.tsx`, `ListCard.tsx` e `AddToListButton.tsx`
- [x] Adicionar botão "adicionar à lista" na página de detalhe do livro
- [x] Criar rota `frontend/src/app/lists/page.tsx`
- [x] **Testado** (browser real, Playwright): criar lista pela UI funciona e ela aparece na tela na hora (estado mockado). Adicionar/remover livro pela `AddToListButton` não foi exercitado de ponta a ponta (depende da busca de livros funcionar primeiro).

## Fase 9 — Frontend: Dashboard

- [x] Criar `frontend/src/features/dashboard/types.ts` e `services/dashboard.service.ts` — fala com os mocks MSW (Fase 5 ainda não existe)
- [x] Criar `frontend/src/features/dashboard/components/DashboardView.tsx` (cards de top rated, mais avaliados, recentes)
- [x] Criar rota `frontend/src/app/dashboard/page.tsx`
- [x] **Testado** (browser real, Playwright): os 3 cards (Melhor avaliados, Mais avaliados, Avaliações recentes) aparecem preenchidos com os dados de exemplo do mock assim que a página carrega.

## Fase 10 — Polimento

- [x] Criar navegação comum `frontend/src/shared/components/NavBar.tsx` (Home, Buscar, Listas, Dashboard, Login/Logout) — usa `useSyncExternalStore` pra reagir a login/logout em tempo real
- [x] Padronizar estados de loading/erro nas chamadas à API (reaproveitar `ApiError` de `shared/lib/api-client.ts`) — corrigido de brinde: `apiFetch` agora extrai `message` do JSON de erro do backend (`ErrorResponse`) em vez de mostrar o corpo cru, e trata corpo vazio em qualquer status (não só 204) — isso quebrava o `register()` com respostas 201 sem corpo
- [ ] Atualizar `README.md` com a lista de endpoints da API e a variável `JWT_SECRET`
- [ ] Revisão final: `docker compose up --build` do zero e validar o fluxo completo (registro → login → busca → review → lista → dashboard) — só dá pra fechar isso depois que as Fases 3-5 do backend estiverem prontas (ou os mocks trocados pelos endpoints reais) e numa rede sem o bloqueio de cota da Google Books API
