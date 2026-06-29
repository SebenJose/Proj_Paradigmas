# Perfis de Usuário e Privacidade de Listas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar suporte a listas de livros públicas/privadas e permitir a visualização de perfis públicos de outros usuários (listas públicas e avaliações feitas por eles).

**Architecture:** O banco de dados PostgreSQL receberá uma coluna booleana `is_private` na tabela `book_lists`. Criaremos novas APIs para alterar a privacidade de listas e consultar perfis públicos de outros usuários. No frontend, modificaremos a criação de listas, adicionaremos o indicador visual 🔒 para privacidade, e criaremos uma nova página de perfil dinâmico em `/profile/{username}`.

**Tech Stack:** Java 26, Spring Boot 4, Spring Security, Next.js 16 (App Router), TypeScript, TailwindCSS

---

### Task 1: Backend - Atualização dos Modelos e DTOs de Listas

**Files:**
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/model/BookList.java`
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/BookListRequest.java`
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/BookListResponse.java`
- Create: `backend/src/test/java/utfpr/com/Proj_Paradigmas/service/BookListServiceTest.java`

- [ ] **Step 1: Modificar o modelo BookList.java**
  Adicionar a propriedade `isPrivate` na entidade `BookList`:
  ```java
  @Column(nullable = false)
  private boolean isPrivate = false;
  ```
  *(Nota: Se houver construtores manuais ou builders, garantir que reflitam a nova propriedade. O Lombok `@Builder` e `@AllArgsConstructor` cuidam disso automaticamente).*

- [ ] **Step 2: Modificar o DTO BookListRequest.java**
  ```java
  package utfpr.com.Proj_Paradigmas.dto;
  
  import jakarta.validation.constraints.NotBlank;
  
  public record BookListRequest(
          @NotBlank(message = "O nome da lista é obrigatório")
          String name,
          boolean isPrivate
  ) {}
  ```

- [ ] **Step 3: Modificar o DTO BookListResponse.java**
  ```java
  package utfpr.com.Proj_Paradigmas.dto;
  
  import java.util.List;
  
  public record BookListResponse(
          Long id,
          String name,
          List<BookSummaryResponse> books,
          boolean isPrivate
  ) {}
  ```

- [ ] **Step 4: Criar teste falho BookListServiceTest.java**
  Criar a classe de teste para validar o comportamento da privacidade de listas:
  ```java
  package utfpr.com.Proj_Paradigmas.service;
  
  import org.junit.jupiter.api.Test;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.boot.test.context.SpringBootTest;
  import org.springframework.test.context.ActiveProfiles;
  import utfpr.com.Proj_Paradigmas.dto.BookListRequest;
  import utfpr.com.Proj_Paradigmas.dto.BookListResponse;
  import utfpr.com.Proj_Paradigmas.model.User;
  import utfpr.com.Proj_Paradigmas.repository.UserRepository;
  
  import static org.junit.jupiter.api.Assertions.*;
  
  @SpringBootTest
  @ActiveProfiles("test")
  public class BookListServiceTest {
  
      @Autowired
      private BookListService bookListService;
  
      @Autowired
      private UserRepository userRepository;
  
      @Test
      public void testCreatePrivateList() {
          User user = User.builder()
                  .username("listuser")
                  .email("listuser@email.com")
                  .passwordHash("hashedpassword")
                  .build();
          userRepository.save(user);
  
          BookListRequest request = new BookListRequest("Lista Privada de Teste", true);
          BookListResponse response = bookListService.createList("listuser", request);
  
          assertNotNull(response);
          assertTrue(response.isPrivate());
          assertEquals("Lista Privada de Teste", response.name());
      }
  }
  ```

- [ ] **Step 5: Executar o teste e certificar-se de que falha (por conta das alterações de mapeamento pendentes)**
  Chamar no terminal:
  `mvn test -Dtest=BookListServiceTest`
  *(Nota: Deve dar erro de compilação/execução no mapeamento de BookList em BookListService.java)*

- [ ] **Step 6: Atualizar o mapeamento no BookListService.java**
  Modificar a linha 44-48 e 91-96 do `BookListService.java` para salvar e retornar `isPrivate`:
  ```java
  // No método createList:
  BookList bookList = BookList.builder()
          .name(request.name())
          .user(user)
          .isPrivate(request.isPrivate())
          .build();
  ```
  ```java
  // No método toResponse:
  private BookListResponse toResponse(BookList list) {
      List<BookSummaryResponse> books = list.getBooks().stream()
              .map(this::toSummaryResponse)
              .toList();
      return new BookListResponse(list.getId(), list.getName(), books, list.isPrivate());
  }
  ```

- [ ] **Step 7: Executar os testes novamente e certificar-se de que passam**
  Chamar no terminal:
  `mvn test -Dtest=BookListServiceTest`
  Esperado: PASS.

- [ ] **Step 8: Commit**
  ```bash
  git add backend/src/main/java/utfpr/com/Proj_Paradigmas/model/BookList.java backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/BookListRequest.java backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/BookListResponse.java backend/src/main/java/utfpr/com/Proj_Paradigmas/service/BookListService.java backend/src/test/java/utfpr/com/Proj_Paradigmas/service/BookListServiceTest.java
  git commit -m "feat(backend): add privacy flag to BookList entity and DTOs"
  ```

---

### Task 2: Backend - Endpoint PATCH para Alterar Privacidade da Lista

**Files:**
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/repository/BookListRepository.java`
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/service/BookListService.java`
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/controller/BookListController.java`
- Create: `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/UpdateListPrivacyRequest.java`
- Modify: `backend/src/test/java/utfpr/com/Proj_Paradigmas/service/BookListServiceTest.java`

- [ ] **Step 1: Criar o DTO UpdateListPrivacyRequest.java**
  ```java
  package utfpr.com.Proj_Paradigmas.dto;
  
  public record UpdateListPrivacyRequest(
          boolean isPrivate
  ) {}
  ```

- [ ] **Step 2: Atualizar o BookListRepository.java**
  Adicionar a query para carregar apenas as listas públicas de um usuário:
  ```java
  List<BookList> findByUserUsernameAndIsPrivateFalse(String username);
  ```

- [ ] **Step 3: Adicionar a lógica de atualização no BookListService.java**
  Adicionar o método:
  ```java
  @Transactional
  public BookListResponse updatePrivacy(String username, Long listId, boolean isPrivate) {
      BookList bookList = bookListRepository.findById(listId)
              .orElseThrow(() -> new ResourceNotFoundException("Lista não encontrada"));
  
      if (!bookList.getUser().getUsername().equals(username)) {
          throw new ResourceNotFoundException("Lista não encontrada");
      }
  
      bookList.setPrivate(isPrivate);
      BookList savedList = bookListRepository.save(bookList);
      return toResponse(savedList);
  }
  ```

- [ ] **Step 4: Adicionar o endpoint no BookListController.java**
  Adicionar a rota PATCH:
  ```java
  @org.springframework.web.bind.annotation.PatchMapping("/{id}/privacy")
  public ResponseEntity<BookListResponse> updatePrivacy(
          @PathVariable("id") Long listId,
          @Valid @RequestBody utfpr.com.Proj_Paradigmas.dto.UpdateListPrivacyRequest request,
          Authentication authentication) {
      return ResponseEntity.ok(bookListService.updatePrivacy(authentication.getName(), listId, request.isPrivate()));
  }
  ```

- [ ] **Step 5: Escrever teste de integração em BookListServiceTest.java**
  Adicionar o teste:
  ```java
  @Test
  public void testUpdatePrivacy() {
      User user = userRepository.findByUsername("listuser")
              .orElseThrow();
      BookListRequest createReq = new BookListRequest("Lista Mutável", false);
      BookListResponse created = bookListService.createList("listuser", createReq);
      assertFalse(created.isPrivate());
  
      BookListResponse updated = bookListService.updatePrivacy("listuser", created.id(), true);
      assertTrue(updated.isPrivate());
  }
  ```

- [ ] **Step 6: Executar testes**
  `mvn test -Dtest=BookListServiceTest`
  Esperado: PASS.

- [ ] **Step 7: Commit**
  ```bash
  git add backend/src/main/java/utfpr/com/Proj_Paradigmas/repository/BookListRepository.java backend/src/main/java/utfpr/com/Proj_Paradigmas/service/BookListService.java backend/src/main/java/utfpr/com/Proj_Paradigmas/controller/BookListController.java backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/UpdateListPrivacyRequest.java
  git commit -m "feat(backend): implement PATCH /api/lists/{id}/privacy endpoint"
  ```

---

### Task 3: Backend - Endpoint de Perfil de Usuário

**Files:**
- Create: `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/UserProfileResponse.java`
- Create: `backend/src/main/java/utfpr/com/Proj_Paradigmas/service/UserService.java`
- Create: `backend/src/main/java/utfpr/com/Proj_Paradigmas/controller/UserController.java`
- Create: `backend/src/test/java/utfpr/com/Proj_Paradigmas/service/UserServiceTest.java`

- [ ] **Step 1: Criar o DTO UserProfileResponse.java**
  ```java
  package utfpr.com.Proj_Paradigmas.dto;
  
  import java.util.List;
  
  public record UserProfileResponse(
          String username,
          List<BookListResponse> lists,
          List<ReviewResponse> reviews
  ) {}
  ```

- [ ] **Step 2: Criar o UserService.java**
  Este serviço busca as listas públicas (onde `isPrivate = false`) e as avaliações do usuário:
  ```java
  package utfpr.com.Proj_Paradigmas.service;
  
  import lombok.RequiredArgsConstructor;
  import org.springframework.stereotype.Service;
  import org.springframework.transaction.annotation.Transactional;
  import utfpr.com.Proj_Paradigmas.dto.BookListResponse;
  import utfpr.com.Proj_Paradigmas.dto.ReviewResponse;
  import utfpr.com.Proj_Paradigmas.dto.UserProfileResponse;
  import utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException;
  import utfpr.com.Proj_Paradigmas.model.User;
  import utfpr.com.Proj_Paradigmas.repository.BookListRepository;
  import utfpr.com.Proj_Paradigmas.repository.ReviewRepository;
  import utfpr.com.Proj_Paradigmas.repository.UserRepository;
  
  import java.util.List;
  
  @Service
  @RequiredArgsConstructor
  public class UserService {
  
      private final UserRepository userRepository;
      private final BookListRepository bookListRepository;
      private final ReviewRepository reviewRepository;
      private final BookListService bookListService;
  
      @Transactional(readOnly = true)
      public UserProfileResponse getUserProfile(String username) {
          User user = userRepository.findByUsername(username)
                  .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
  
          // Buscar listas públicas apenas
          List<BookListResponse> publicLists = bookListRepository.findByUserUsernameAndIsPrivateFalse(username)
                  .stream()
                  .map(list -> new BookListResponse(
                          list.getId(),
                          list.getName(),
                          list.getBooks().stream().map(b -> new utfpr.com.Proj_Paradigmas.dto.BookSummaryResponse(
                                  b.getId(),
                                  b.getGoogleBooksId(),
                                  b.getTitle(),
                                  b.getCoverUrl()
                          )).toList(),
                          list.isPrivate()
                  ))
                  .toList();
  
          // Buscar avaliações feitas por este usuário
          List<ReviewResponse> reviews = reviewRepository.findByUserUsername(username)
                  .stream()
                  .map(review -> new ReviewResponse(
                          review.getId(),
                          review.getUser().getUsername(),
                          review.getBook().getGoogleBooksId(),
                          review.getRating(),
                          review.getComment(),
                          review.getCreatedAt()
                  ))
                  .toList();
  
          return new UserProfileResponse(user.getUsername(), publicLists, reviews);
      }
  }
  ```

- [ ] **Step 3: Criar o UserController.java**
  Expor a rota `/api/users/{username}/profile`:
  ```java
  package utfpr.com.Proj_Paradigmas.controller;
  
  import lombok.RequiredArgsConstructor;
  import org.springframework.http.ResponseEntity;
  import org.springframework.web.bind.annotation.GetMapping;
  import org.springframework.web.bind.annotation.PathVariable;
  import org.springframework.web.bind.annotation.RequestMapping;
  import org.springframework.web.bind.annotation.RestController;
  import utfpr.com.Proj_Paradigmas.dto.UserProfileResponse;
  import utfpr.com.Proj_Paradigmas.service.UserService;
  
  @RestController
  @RequestMapping("/api/users")
  @RequiredArgsConstructor
  public class UserController {
  
      private final UserService userService;
  
      @GetMapping("/{username}/profile")
      public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable String username) {
          return ResponseEntity.ok(userService.getUserProfile(username));
      }
  }
  ```

- [ ] **Step 4: Criar o teste UserServiceTest.java**
  Validar que listas privadas do usuário NÃO são retornadas pelo endpoint público:
  ```java
  package utfpr.com.Proj_Paradigmas.service;
  
  import org.junit.jupiter.api.Test;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.boot.test.context.SpringBootTest;
  import org.springframework.test.context.ActiveProfiles;
  import utfpr.com.Proj_Paradigmas.dto.BookListRequest;
  import utfpr.com.Proj_Paradigmas.dto.UserProfileResponse;
  import utfpr.com.Proj_Paradigmas.model.User;
  import utfpr.com.Proj_Paradigmas.repository.UserRepository;
  
  import static org.junit.jupiter.api.Assertions.*;
  
  @SpringBootTest
  @ActiveProfiles("test")
  public class UserServiceTest {
  
      @Autowired
      private UserService userService;
  
      @Autowired
      private UserRepository userRepository;
  
      @Autowired
      private BookListService bookListService;
  
      @Test
      public void testUserProfileListsPrivacy() {
          User user = User.builder()
                  .username("profileuser")
                  .email("profileuser@email.com")
                  .passwordHash("hashedpassword")
                  .build();
          userRepository.save(user);
  
          // Criar uma pública e uma privada
          bookListService.createList("profileuser", new BookListRequest("Lista Pública", false));
          bookListService.createList("profileuser", new BookListRequest("Lista Privada", true));
  
          UserProfileResponse profile = userService.getUserProfile("profileuser");
          assertNotNull(profile);
          assertEquals("profileuser", profile.username());
          assertEquals(1, profile.lists().size());
          assertEquals("Lista Pública", profile.lists().get(0).name());
      }
  }
  ```

- [ ] **Step 5: Executar testes de integração**
  `mvn test -Dtest=UserServiceTest`
  Esperado: PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/UserProfileResponse.java backend/src/main/java/utfpr/com/Proj_Paradigmas/service/UserService.java backend/src/main/java/utfpr/com/Proj_Paradigmas/controller/UserController.java backend/src/test/java/utfpr/com/Proj_Paradigmas/service/UserServiceTest.java
  git commit -m "feat(backend): implement user profile endpoint filtering private lists"
  ```

---

### Task 4: Frontend - Integração de Privacidade de Listas

**Files:**
- Modify: `frontend/src/features/lists/types.ts`
- Modify: `frontend/src/features/lists/schemas.ts`
- Modify: `frontend/src/features/lists/services/list.service.ts`
- Modify: `frontend/src/features/lists/components/CreateListForm.tsx`
- Modify: `frontend/src/features/lists/components/ListCard.tsx`
- Modify: `frontend/src/features/lists/components/ListsView.tsx`

- [ ] **Step 1: Atualizar tipos em types.ts**
  Adicionar a propriedade `isPrivate` às definições de `BookList` e `CreateListRequest`:
  ```typescript
  // Em frontend/src/features/lists/types.ts
  export interface BookList {
    id: number;
    name: string;
    books: BookSummary[];
    isPrivate: boolean; // ADICIONAR
  }
  
  export interface CreateListRequest {
    name: string;
    isPrivate: boolean; // ADICIONAR
  }
  ```

- [ ] **Step 2: Atualizar o esquema de validação em schemas.ts**
  Atualizar o esquema para incluir o campo booleano `isPrivate`:
  ```typescript
  // Em frontend/src/features/lists/schemas.ts
  export const createListSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
    isPrivate: z.boolean().default(false), // ADICIONAR
  });
  ```

- [ ] **Step 3: Atualizar lists API service list.service.ts**
  Adicionar a função de alteração de privacidade (`PATCH`):
  ```typescript
  // Em frontend/src/features/lists/services/list.service.ts
  export function updatePrivacy(listId: number, isPrivate: boolean): Promise<BookList> {
    return apiFetch<BookList>(`/api/lists/${listId}/privacy`, {
      method: "PATCH",
      body: JSON.stringify({ isPrivate }),
    });
  }
  ```

- [ ] **Step 4: Atualizar formulário CreateListForm.tsx**
  Adicionar um switch/checkbox de privacidade no formulário (linhas 27-57 aprox.):
  ```tsx
  // Adicionar checkbox de privacidade:
  <div className="flex items-center space-x-2 py-2">
    <input
      type="checkbox"
      id="isPrivate"
      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      {...register("isPrivate")}
    />
    <label htmlFor="isPrivate" className="text-sm font-medium text-foreground/80 cursor-pointer">
      Tornar esta lista privada
    </label>
  </div>
  ```

- [ ] **Step 5: Atualizar ListCard.tsx para exibir e alternar privacidade**
  - Importar `updatePrivacy` de `./services/list.service` e `Lock`, `Eye` de `lucide-react`.
  - Exibir ícone visual ao lado do nome:
    ```tsx
    <div className="flex items-center gap-2">
      <h3 className="font-serif text-lg font-semibold">{list.name}</h3>
      {list.isPrivate ? (
        <Lock className="h-4 w-4 text-muted-foreground" title="Lista Privada" />
      ) : (
        <Eye className="h-4 w-4 text-muted-foreground/50" title="Lista Pública" />
      )}
    </div>
    ```
  - Se for a página do próprio usuário (onde ele gerencia suas listas), adicionar um botão/toggle para alternar a privacidade:
    ```tsx
    const handleTogglePrivacy = async () => {
      try {
        await updatePrivacy(list.id, !list.isPrivate);
        // Recarregar listas (pode ser passado um callback do componente pai)
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error("Erro ao alterar privacidade:", err);
      }
    };
    ```

- [ ] **Step 6: Executar build e lint para certificar compilação do TypeScript**
  Chamar:
  `npm run lint` na pasta frontend.

- [ ] **Step 7: Commit**
  ```bash
  git add frontend/src/features/lists/types.ts frontend/src/features/lists/schemas.ts frontend/src/features/lists/services/list.service.ts frontend/src/features/lists/components/CreateListForm.tsx frontend/src/features/lists/components/ListCard.tsx frontend/src/features/lists/components/ListsView.tsx
  git commit -m "feat(frontend): integrate public/private visibility switches in lists management"
  ```

---

### Task 5: Frontend - Links de Perfis nas Resenhas

**Files:**
- Modify: `frontend/src/features/dashboard/components/DashboardView.tsx`
- Modify: `frontend/src/features/reviews/components/ReviewList.tsx`

- [ ] **Step 1: Atualizar o DashboardView.tsx**
  Modificar a linha 130 onde renderiza `{review.username}` para apontar como Link:
  ```tsx
  // Adicionar import: import Link from "next/link";
  <Link href={`/profile/${encodeURIComponent(review.username)}`} className="text-xs font-semibold text-primary hover:underline">
    {review.username}
  </Link>
  ```

- [ ] **Step 2: Atualizar o ReviewList.tsx**
  Modificar a linha 25 onde renderiza `{review.username}` para apontar como Link:
  ```tsx
  // Adicionar import: import Link from "next/link";
  <Link href={`/profile/${encodeURIComponent(review.username)}`} className="text-sm font-medium text-primary hover:underline">
    {review.username}
  </Link>
  ```

- [ ] **Step 3: Rodar o lint do Next.js**
  `npm run lint` na pasta frontend.

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/features/dashboard/components/DashboardView.tsx frontend/src/features/reviews/components/ReviewList.tsx
  git commit -m "feat(frontend): turn review authors usernames into links to user profiles"
  ```

---

### Task 6: Frontend - Criação da Tela de Perfil Público

**Files:**
- Create: `frontend/src/features/users/types.ts`
- Create: `frontend/src/features/users/services/user.service.ts`
- Create: `frontend/src/features/users/components/UserProfileView.tsx`
- Create: `frontend/src/features/users/index.ts`
- Create: `frontend/src/app/profile/[username]/page.tsx`

- [ ] **Step 1: Criar os tipos em users/types.ts**
  ```typescript
  import type { BookList } from "@/features/lists/types";
  
  export interface UserReview {
    id: number;
    bookTitle: string;
    googleBooksId: string;
    rating: number;
    comment: string;
    createdAt: string;
  }
  
  export interface UserProfile {
    username: string;
    lists: BookList[];
    reviews: UserReview[];
  }
  ```

- [ ] **Step 2: Criar o service em users/services/user.service.ts**
  ```typescript
  import { apiFetch } from "@/shared/lib/api-client";
  import type { UserProfile } from "../types";
  
  export function getUserProfile(username: string): Promise<UserProfile> {
    return apiFetch<UserProfile>(`/api/users/${username}/profile`);
  }
  ```

- [ ] **Step 3: Criar a view UserProfileView.tsx**
  Deve exibir informações do usuário e conter duas abas (Listas Públicas e Avaliações):
  ```tsx
  "use client";
  
  import { useEffect, useState } from "react";
  import { getUserProfile } from "../services/user.service";
  import type { UserProfile } from "../types";
  import { StarRating } from "@/shared/components/StarRating";
  import { BookCard } from "@/features/books/components/BookCard";
  import Link from "next/link";
  import { BookOpen, Star } from "lucide-react";
  
  export function UserProfileView({ username }: { username: string }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"lists" | "reviews">("lists");
  
    useEffect(() => {
      getUserProfile(username)
        .then(setProfile)
        .catch(() => setError("Não foi possível carregar o perfil do usuário."));
    }, [username]);
  
    if (error) return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 text-destructive max-w-4xl mx-auto mt-8">
        <p className="font-medium">{error}</p>
      </div>
    );
  
    if (!profile) return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-24 w-full bg-muted/60 animate-pulse rounded-lg" />
        <div className="h-40 w-full bg-muted/60 animate-pulse rounded-lg" />
      </div>
    );
  
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Perfil Header */}
        <div className="flex items-center gap-4 bg-muted/20 p-6 rounded-xl border border-border/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Perfil de @{profile.username}</h1>
            <p className="text-sm text-muted-foreground">
              {profile.lists.length} listas públicas • {profile.reviews.length} avaliações
            </p>
          </div>
        </div>
  
        {/* Tabs */}
        <div className="flex border-b border-border/20">
          <button
            onClick={() => setActiveTab("lists")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "lists"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" /> Listas Públicas
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="h-4 w-4" /> Avaliações ({profile.reviews.length})
          </button>
        </div>
  
        {/* Content */}
        <div>
          {activeTab === "lists" ? (
            profile.lists.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Nenhuma lista pública encontrada.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.lists.map((list) => (
                  <div key={list.id} className="border border-border/20 rounded-xl p-4 space-y-4 bg-background">
                    <h3 className="font-serif text-lg font-semibold">{list.name}</h3>
                    {list.books.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Lista vazia.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {list.books.map((book) => (
                          <div key={book.googleBooksId} className="flex flex-col gap-1">
                            <BookCard book={{
                              googleBooksId: book.googleBooksId,
                              title: book.title,
                              coverUrl: book.coverUrl,
                              authors: [],
                              publishedDate: null
                            }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            profile.reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Nenhuma avaliação encontrada.</p>
            ) : (
              <ul className="space-y-4">
                {profile.reviews.map((review) => (
                  <li key={review.id} className="border border-border/20 rounded-xl p-4 space-y-2 bg-background">
                    <div className="flex items-center justify-between">
                      <Link href={`/books/${encodeURIComponent(review.googleBooksId)}`} className="text-sm font-semibold hover:underline text-foreground/80">
                        {review.bookTitle}
                      </Link>
                      <StarRating rating={review.rating} className="scale-90 origin-right" />
                    </div>
                    <p className="text-sm text-muted-foreground italic pl-2 border-l border-primary/20">
                      "{review.comment || "Sem comentário."}"
                    </p>
                    <div className="text-[10px] text-muted-foreground text-right">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Criar o export index.ts**
  ```typescript
  export { UserProfileView } from "./components/UserProfileView";
  export type { UserProfile, UserReview } from "./types";
  ```

- [ ] **Step 5: Criar a rota dinâmica profile/[username]/page.tsx**
  ```tsx
  import { UserProfileView } from "@/features/users";
  
  interface PageProps {
    params: Promise<{
      username: string;
    }>;
  }
  
  export default async function ProfilePage({ params }: PageProps) {
    const { username } = await params;
    return <UserProfileView username={username} />;
  }
  ```

- [ ] **Step 6: Executar build final para verificar lints e compilação**
  Chamar no terminal:
  `npm run build` na pasta frontend.

- [ ] **Step 7: Commit**
  ```bash
  git add frontend/src/features/users/types.ts frontend/src/features/users/services/user.service.ts frontend/src/features/users/components/UserProfileView.tsx frontend/src/features/users/index.ts frontend/src/app/profile/`[username`]/page.tsx
  git commit -m "feat(frontend): create public user profile page showing lists and reviews"
  ```
