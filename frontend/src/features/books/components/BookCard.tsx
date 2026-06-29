"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, Plus } from "lucide-react";
import { create as createReview } from "../../reviews/services/review.service";
import type { BookSearchResult } from "../types";

export function BookCard({ book, showActions = true }: { book: BookSearchResult; showActions?: boolean }) {
  const router = useRouter();

  async function handleQuickRead(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await createReview({
        googleBooksId: book.googleBooksId,
        rating: 5.0,
        comment: ""
      });
      alert(`Livro "${book.title}" marcado como lido com nota 5.0!`);
      router.refresh();
    } catch {
      router.push(`/books/${encodeURIComponent(book.googleBooksId)}?review=true`);
    }
  }

  function handleQuickAddList(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/books/${encodeURIComponent(book.googleBooksId)}?add-list=true`);
  }

  return (
    <Link href={`/books/${encodeURIComponent(book.googleBooksId)}`} className="group relative block aspect-[2/3] w-full overflow-hidden rounded-md shadow-md hover-card">
      {book.coverUrl ? (
        <Image
          src={book.coverUrl}
          alt={book.title}
          fill
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/60 text-muted-foreground/50 border border-border/40">
          <BookOpen className="h-12 w-12 stroke-1" />
        </div>
      )}

      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/20 to-transparent mix-blend-overlay" />
      <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10 dark:ring-white/10" />

      {showActions && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4">
          <div className="translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
            <h3 className="line-clamp-2 font-serif text-sm font-semibold text-white leading-tight">
              {book.title}
            </h3>
            <p className="mt-1 line-clamp-1 text-xs text-neutral-300">
              {book.authors.join(", ") || "Autor desconhecido"}
            </p>

            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2">
              <button
                onClick={handleQuickRead}
                className="flex flex-1 items-center justify-center gap-1 rounded bg-[var(--primary)] px-2 py-1.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-red-800 active-press"
                title="Marcar como lido com nota 5"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Lido</span>
              </button>
              <button
                onClick={handleQuickAddList}
                className="flex items-center justify-center rounded bg-white/10 p-1.5 text-white transition-colors duration-200 hover:bg-white/20 active-press"
                title="Adicionar à lista"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}
