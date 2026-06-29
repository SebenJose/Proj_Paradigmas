# Task 6 Code Quality Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply code quality improvements including backend DTO book title additions, frontend type/service safety enhancements, component race condition preventions, and BookCard conditional hover overlays.

**Architecture:** Update Java record and mapping services on the backend. Upgrade TypeScript types, service URL escaping, hook cleanup logic, and conditional rendering on the frontend.

**Tech Stack:** Java, Spring Boot, React, Next.js, TypeScript

---

### Task 1: Backend DTO Upgrade

**Files:**
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/ReviewResponse.java`
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/service/ReviewService.java`
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/service/DashboardService.java`

- [ ] **Step 1: Update ReviewResponse Record**
  Modify `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/ReviewResponse.java` to add `String bookTitle` to the record definition.
  ```java
  package utfpr.com.Proj_Paradigmas.dto;
  
  import java.time.Instant;
  
  public record ReviewResponse(
          Long id,
          String username,
          String googleBooksId,
          String bookTitle,
          Double rating,
          String comment,
          Instant createdAt
  ) {}
  ```

- [ ] **Step 2: Update ReviewService Mapping**
  Modify `backend/src/main/java/utfpr/com/Proj_Paradigmas/service/ReviewService.java` in the `toResponse` method to pass `review.getBook().getTitle()`.
  ```java
  private ReviewResponse toResponse(Review review) {
      return new ReviewResponse(
              review.getId(),
              review.getUser().getUsername(),
              review.getBook().getGoogleBooksId(),
              review.getBook().getTitle(),
              review.getRating(),
              review.getComment(),
              review.getCreatedAt()
      );
  }
  ```

- [ ] **Step 3: Update DashboardService Mapping**
  Modify `backend/src/main/java/utfpr/com/Proj_Paradigmas/service/DashboardService.java` in the `toReviewResponse` method to pass `review.getBook().getTitle()`.
  ```java
  private ReviewResponse toReviewResponse(Review review) {
      return new ReviewResponse(
              review.getId(),
              review.getUser().getUsername(),
              review.getBook().getGoogleBooksId(),
              review.getBook().getTitle(),
              review.getRating(),
              review.getComment(),
              review.getCreatedAt()
      );
  }
  ```

- [ ] **Step 4: Verify Backend Compilation and Tests**
  Run: `$env:JAVA_HOME = "C:\Program Files\Java\jdk-26.0.1"; .\mvnw.cmd test` in directory `c:\Projetos\Proj_Paradigmas-main\Proj_Paradigmas-main`
  Expected: Maven project compiles successfully and all tests pass.

- [ ] **Step 5: Commit Backend Changes**
  Run:
  ```powershell
  git add backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/ReviewResponse.java backend/src/main/java/utfpr/com/Proj_Paradigmas/service/ReviewService.java backend/src/main/java/utfpr/com/Proj_Paradigmas/service/DashboardService.java
  git commit -m "refactor(backend): add bookTitle to ReviewResponse and map it in services"
  ```

---

### Task 2: Frontend Type & Service Upgrades

**Files:**
- Modify: `frontend/src/features/reviews/types.ts`
- Modify: `frontend/src/features/users/services/user.service.ts`

- [ ] **Step 1: Add bookTitle to Review Type**
  Modify `frontend/src/features/reviews/types.ts` to include optional `bookTitle?: string;`.
  ```typescript
  export interface Review {
    id: number;
    username: string;
    googleBooksId: string;
    bookTitle?: string;
    rating: number;
    comment: string;
    createdAt: string;
  }
  ```

- [ ] **Step 2: Escape Username in User Service**
  Modify `frontend/src/features/users/services/user.service.ts` to wrap username with `encodeURIComponent` in the fetch URL path.
  ```typescript
  export function getUserProfile(username: string): Promise<UserProfile> {
    return apiFetch<UserProfile>(`/api/users/${encodeURIComponent(username)}/profile`);
  }
  ```

- [ ] **Step 3: Commit Type and Service changes**
  Run:
  ```powershell
  git add frontend/src/features/reviews/types.ts frontend/src/features/users/services/user.service.ts
  git commit -m "refactor(frontend): add optional bookTitle to Review and escape username in getUserProfile"
  ```

---

### Task 3: Component Cleanup & Race Condition Prevention

**Files:**
- Modify: `frontend/src/features/users/components/UserProfileView.tsx`
- Modify: `frontend/src/features/books/components/BookCard.tsx`

- [ ] **Step 1: Add showActions Prop to BookCard**
  Modify `frontend/src/features/books/components/BookCard.tsx` to add `showActions?: boolean` (default `true`) to the `BookCard` component props and wrap the hover overlay with `{showActions && (...)}`.
  ```typescript
  export function BookCard({ book, showActions = true }: { book: BookSearchResult; showActions?: boolean }) {
  ```
  And conditionally render:
  ```tsx
  {showActions && (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4">
      {/* ... hover text, buttons, etc ... */}
    </div>
  )}
  ```

- [ ] **Step 2: Implement Cleanup Flag in UserProfileView useEffect**
  Modify `frontend/src/features/users/components/UserProfileView.tsx` to utilize an `active` boolean inside the `useEffect` to prevent state updates if the component unmounts.
  ```typescript
    useEffect(() => {
      let active = true;
      getUserProfile(username)
        .then((data) => {
          if (active) setProfile(data);
        })
        .catch(() => {
          if (active) setError("Não foi possível carregar o perfil do usuário.");
        });
      return () => {
        active = false;
      };
    }, [username]);
  ```

- [ ] **Step 3: Pass showActions={false} to BookCard in UserProfileView**
  Modify `frontend/src/features/users/components/UserProfileView.tsx` to include `showActions={false}` on `BookCard` components.
  ```tsx
  <BookCard book={{
    googleBooksId: book.googleBooksId,
    title: book.title,
    coverUrl: book.coverUrl,
    authors: [],
    publishedDate: null
  }} showActions={false} />
  ```

- [ ] **Step 4: Verify Frontend Build and Lints**
  Run: `npm run build` inside directory `c:\Projetos\Proj_Paradigmas-main\Proj_Paradigmas-main\frontend`
  Expected: Next.js build and ESLint check passes successfully.

- [ ] **Step 5: Commit Frontend Component Changes**
  Run:
  ```powershell
  git add frontend/src/features/users/components/UserProfileView.tsx frontend/src/features/books/components/BookCard.tsx
  git commit -m "refactor(frontend): prevent race conditions in UserProfileView and add showActions prop to BookCard"
  ```
