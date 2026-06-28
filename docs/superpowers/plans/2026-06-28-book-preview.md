# Google Books Preview Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive book preview tab using the Google Books Embedded Viewer API to the book details page, displayable only if the book has an embeddable preview available.

**Architecture:** Hybrid approach. The Spring Boot backend queries and persists the `embeddable` status of the book from the Google Books API. The Next.js frontend fetches this state and conditionally displays a "Prévia" tab that loads the official Google Books viewer script dynamically on-demand with a height of 600px.

**Tech Stack:** Java, Spring Boot, PostgreSQL/Hibernate, TypeScript, Next.js (React), Lucide Icons, Google Books API.

---

### Task 1: Backend DTO and Model Updates

**Files:**
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/GoogleBookVolumeDto.java`
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/BookDetailResponse.java`
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/model/Book.java`

- [ ] **Step 1: Update GoogleBookVolumeDto to parse accessInfo.embeddable**
  Update `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/GoogleBookVolumeDto.java`:
  ```java
  package utfpr.com.Proj_Paradigmas.dto;

  import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
  import java.util.List;

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record GoogleBookVolumeDto(String id, VolumeInfo volumeInfo, AccessInfo accessInfo) {

      @JsonIgnoreProperties(ignoreUnknown = true)
      public record VolumeInfo(
              String title,
              List<String> authors,
              String description,
              String publishedDate,
              Integer pageCount,
              ImageLinks imageLinks) {}

      @JsonIgnoreProperties(ignoreUnknown = true)
      public record ImageLinks(String thumbnail) {}

      @JsonIgnoreProperties(ignoreUnknown = true)
      public record AccessInfo(Boolean embeddable) {}
  }
  ```

- [ ] **Step 2: Add embeddable field to Book entity**
  Update `backend/src/main/java/utfpr/com/Proj_Paradigmas/model/Book.java`:
  ```java
  // Under existing fields, add the new embeddable field around line 58
  private Boolean embeddable;
  ```

- [ ] **Step 3: Update BookDetailResponse DTO record**
  Update `backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/BookDetailResponse.java`:
  ```java
  package utfpr.com.Proj_Paradigmas.dto;

  import java.util.List;

  public record BookDetailResponse(
          String googleBooksId,
          String title,
          List<String> authors,
          String description,
          String coverUrl,
          String publishedDate,
          Integer pageCount,
          Boolean embeddable) {}
  ```

- [ ] **Step 4: Commit changes**
  ```bash
  git add backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/GoogleBookVolumeDto.java backend/src/main/java/utfpr/com/Proj_Paradigmas/dto/BookDetailResponse.java backend/src/main/java/utfpr/com/Proj_Paradigmas/model/Book.java
  git commit -m "chore(backend): add embeddable field to DTOs and Book entity"
  ```

---

### Task 2: Backend Service Mapping & TDD Verification

**Files:**
- Modify: `backend/src/main/java/utfpr/com/Proj_Paradigmas/service/BookService.java`
- Create: `backend/src/test/java/utfpr/com/Proj_Paradigmas/service/BookServiceTest.java`

- [ ] **Step 1: Write failing test in BookServiceTest**
  Create `backend/src/test/java/utfpr/com/Proj_Paradigmas/service/BookServiceTest.java`:
  ```java
  package utfpr.com.Proj_Paradigmas.service;

  import static org.junit.jupiter.api.Assertions.*;
  import static org.mockito.Mockito.*;

  import java.util.List;
  import java.util.Optional;
  import org.junit.jupiter.api.Test;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.boot.test.context.SpringBootTest;
  import org.springframework.boot.test.mock.mockito.MockBean;
  import org.springframework.test.context.ActiveProfiles;
  import org.springframework.transaction.annotation.Transactional;
  import utfpr.com.Proj_Paradigmas.dto.BookDetailResponse;
  import utfpr.com.Proj_Paradigmas.dto.GoogleBookVolumeDto;
  import utfpr.com.Proj_Paradigmas.model.Book;
  import utfpr.com.Proj_Paradigmas.repository.BookRepository;

  @SpringBootTest
  @ActiveProfiles("test")
  @Transactional
  public class BookServiceTest {

      @Autowired
      private BookService bookService;

      @Autowired
      private BookRepository bookRepository;

      @MockBean
      private GoogleBooksClient googleBooksClient;

      @Test
      public void testFindOrCreateSavesEmbeddable() {
          String googleId = "test_embeddable_id";
          
          GoogleBookVolumeDto.VolumeInfo volumeInfo = new GoogleBookVolumeDto.VolumeInfo(
                  "Test Title",
                  List.of("Author Name"),
                  "Description",
                  "2026-06-28",
                  120,
                  null
          );
          GoogleBookVolumeDto.AccessInfo accessInfo = new GoogleBookVolumeDto.AccessInfo(true);
          GoogleBookVolumeDto mockDto = new GoogleBookVolumeDto(googleId, volumeInfo, accessInfo);

          when(googleBooksClient.findById(googleId)).thenReturn(Optional.of(mockDto));

          BookDetailResponse response = bookService.getDetail(googleId);

          assertNotNull(response);
          assertEquals(googleId, response.googleBooksId());
          assertTrue(response.embeddable());

          Book savedBook = bookRepository.findByGoogleBooksId(googleId).orElse(null);
          assertNotNull(savedBook);
          assertTrue(savedBook.getEmbeddable());
      }
  }
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `./mvnw test -Dtest=BookServiceTest` in the `backend` directory.
  Expected: Compile error due to mismatched constructors or mapping failures.

- [ ] **Step 3: Update BookService mapping logic**
  Modify `backend/src/main/java/utfpr/com/Proj_Paradigmas/service/BookService.java` to map the `embeddable` field:
  ```java
      private BookDetailResponse toDetailResponse(Book book) {
          return new BookDetailResponse(
                  book.getGoogleBooksId(),
                  book.getTitle(),
                  book.getAuthors(),
                  book.getDescription(),
                  book.getCoverUrl(),
                  book.getPublishedDate(),
                  book.getPageCount(),
                  book.getEmbeddable());
      }

      private Book toEntity(GoogleBookVolumeDto dto) {
          GoogleBookVolumeDto.VolumeInfo info = dto.volumeInfo();
          return Book.builder()
                  .googleBooksId(dto.id())
                  .title(info.title())
                  .authors(info.authors() != null ? info.authors() : List.of())
                  .description(info.description())
                  .coverUrl(info.imageLinks() != null ? info.imageLinks().thumbnail() : null)
                  .publishedDate(info.publishedDate())
                  .pageCount(info.pageCount())
                  .embeddable(dto.accessInfo() != null && Boolean.TRUE.equals(dto.accessInfo().embeddable()))
                  .build();
      }
  ```

- [ ] **Step 4: Run tests to verify they pass**
  Run: `./mvnw test` in the `backend` directory.
  Expected: Compile succeeds, and all tests pass (including `BookServiceTest` and other pre-existing backend tests).

- [ ] **Step 5: Commit changes**
  ```bash
  git add backend/src/main/java/utfpr/com/Proj_Paradigmas/service/BookService.java backend/src/test/java/utfpr/com/Proj_Paradigmas/service/BookServiceTest.java
  git commit -m "feat(backend): implement and test embeddable mapping in BookService"
  ```

---

### Task 3: Frontend Type & Component Implementation

**Files:**
- Modify: `frontend/src/features/books/types.ts`
- Create: `frontend/src/features/books/components/BookPreview.tsx`

- [ ] **Step 1: Update BookDetail TypeScript Interface**
  Modify `frontend/src/features/books/types.ts`:
  ```typescript
  export interface BookDetail {
    googleBooksId: string;
    title: string;
    authors: string[];
    description: string | null;
    coverUrl: string | null;
    publishedDate: string | null;
    pageCount: number | null;
    embeddable?: boolean;
  }
  ```

- [ ] **Step 2: Create BookPreview Component**
  Create `frontend/src/features/books/components/BookPreview.tsx`:
  ```typescript
  "use client";

  import { useEffect, useRef, useState } from "react";
  import { AlertCircle, Loader2 } from "lucide-react";

  interface BookPreviewProps {
    googleBooksId: string;
  }

  export function BookPreview({ googleBooksId }: BookPreviewProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      let isActive = true;

      const initializeViewer = () => {
        if (!containerRef.current || !isActive) return;

        try {
          const google = (window as any).google;
          if (google && google.books) {
            google.books.load();
            google.books.setOnLoadCallback(() => {
              if (!isActive || !containerRef.current) return;
              
              const viewer = new google.books.DefaultViewer(containerRef.current);
              viewer.load(
                googleBooksId,
                () => {
                  if (isActive) setError(true);
                },
                () => {
                  if (isActive) setLoaded(true);
                }
              );
            });
          } else {
            setError(true);
          }
        } catch (err) {
          console.error("Error initializing Google Books Viewer:", err);
          if (isActive) setError(true);
        }
      };

      // Check if script is already loaded
      if ((window as any).google && (window as any).google.books) {
        initializeViewer();
      } else {
        const existingScript = document.getElementById("google-books-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "google-books-script";
          script.src = "https://www.google.com/books/jsapi.js";
          script.async = true;
          script.onload = initializeViewer;
          script.onerror = () => {
            if (isActive) setError(true);
          };
          document.body.appendChild(script);
        } else {
          // Script element exists but maybe not fully initialized yet
          const interval = setInterval(() => {
            if ((window as any).google && (window as any).google.books) {
              clearInterval(interval);
              initializeViewer();
            }
          }, 100);
          return () => {
            clearInterval(interval);
            isActive = false;
          };
        }
      }

      return () => {
        isActive = false;
      };
    }, [googleBooksId]);

    return (
      <div className="relative w-full rounded-lg border border-border/40 overflow-hidden bg-card/10">
        {!loaded && !error && (
          <div className="flex h-[600px] w-full items-center justify-center bg-muted/10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando prévia do livro...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-[600px] w-full items-center justify-center border border-dashed border-border/60 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center max-w-sm gap-2">
              <AlertCircle className="h-10 w-10 text-muted-foreground/60" />
              <p className="font-semibold text-foreground/80">Não foi possível carregar a prévia</p>
              <p className="text-xs text-muted-foreground">
                Este livro pode não ter uma prévia pública ou ocorreu um erro de conexão.
              </p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          id="viewerCanvas"
          style={{
            display: error ? "none" : "block",
            height: "600px",
            width: "100%",
          }}
        />
      </div>
    );
  }
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add frontend/src/features/books/types.ts frontend/src/features/books/components/BookPreview.tsx
  git commit -m "feat(frontend): define types and build BookPreview component"
  ```

---

### Task 4: Tab Layout and Integration in BookDetailView

**Files:**
- Modify: `frontend/src/features/books/components/BookDetailView.tsx`

- [ ] **Step 1: Implement Tabs and conditional BookPreview loading in BookDetailView**
  Refactor `frontend/src/features/books/components/BookDetailView.tsx` to add Tab Navigation:
  ```typescript
  // 1. Add import:
  import { BookPreview } from "./BookPreview";

  // 2. Inside BookDetailView function, add state:
  const [activeTab, setActiveTab] = useState<"synopsis" | "reviews" | "preview">("synopsis");

  // 3. Replace the content area (lines 105-128 in original file) with:
  {/* Tab Navigation */}
  <div className="flex border-b border-border/20 mb-6">
    <button
      onClick={() => setActiveTab("synopsis")}
      className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
        activeTab === "synopsis"
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      Sinopse
    </button>
    <button
      onClick={() => setActiveTab("reviews")}
      className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
        activeTab === "reviews"
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      Críticas ({reviews?.reviews.length || 0})
    </button>
    {book.embeddable && (
      <button
        onClick={() => setActiveTab("preview")}
        className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
          activeTab === "preview"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        Prévia
      </button>
    )}
  </div>

  {/* Tab Content */}
  <div className="min-h-[300px]">
    {activeTab === "synopsis" && book.description && (
      <p className="text-sm leading-relaxed text-muted-foreground/90 text-justify">
        {book.description}
      </p>
    )}
    {activeTab === "synopsis" && !book.description && (
      <p className="text-sm italic text-muted-foreground/60">
        Nenhuma sinopse disponível para este livro.
      </p>
    )}

    {activeTab === "reviews" && (
      <div>
        {reviews && reviews.reviews.length > 0 ? (
          <ReviewList data={reviews} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card/20 border-dashed border-border/40">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm font-medium">Nenhuma avaliação cadastrada</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Seja o primeiro a avaliar e opinar sobre este livro!</p>
          </div>
        )}
      </div>
    )}

    {activeTab === "preview" && book.embeddable && (
      <BookPreview googleBooksId={book.googleBooksId} />
    )}
  </div>
  ```

- [ ] **Step 2: Commit changes**
  ```bash
  git add frontend/src/features/books/components/BookDetailView.tsx
  git commit -m "feat(frontend): integrate tabs and BookPreview in BookDetailView"
  ```
