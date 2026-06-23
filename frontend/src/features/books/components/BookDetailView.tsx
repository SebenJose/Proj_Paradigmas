"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { getByGoogleId } from "../services/book.service";
import { getByBook } from "@/features/reviews/services/review.service";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { ReviewList } from "@/features/reviews/components/ReviewList";
import { AddToListButton } from "@/features/lists/components/AddToListButton";
import type { BookDetail } from "../types";
import type { BookReviews } from "@/features/reviews/types";

export function BookDetailView({ googleBooksId }: { googleBooksId: string }) {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [reviews, setReviews] = useState<BookReviews | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(() => {
    getByBook(googleBooksId)
      .then(setReviews)
      .catch(() => setReviews(null));
  }, [googleBooksId]);

  useEffect(() => {
    getByGoogleId(googleBooksId)
      .then(setBook)
      .catch(() => setError("Não foi possível carregar este livro"));
    loadReviews();
  }, [googleBooksId, loadReviews]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!book) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex gap-4">
        <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded-md bg-muted">
          {book.coverUrl ? (
            <Image src={book.coverUrl} alt={book.title} fill sizes="128px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <BookOpen className="size-8" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">{book.title}</h1>
          {book.authors.length > 0 && (
            <p className="text-sm text-muted-foreground">{book.authors.join(", ")}</p>
          )}
          {book.publishedDate && (
            <p className="text-xs text-muted-foreground">Publicado em {book.publishedDate}</p>
          )}
          {book.pageCount && (
            <p className="text-xs text-muted-foreground">{book.pageCount} páginas</p>
          )}

          <div className="mt-2">
            <AddToListButton
              googleBooksId={book.googleBooksId}
              title={book.title}
              coverUrl={book.coverUrl}
            />
          </div>
        </div>
      </div>

      {book.description && <p className="text-sm leading-relaxed">{book.description}</p>}

      <div className="flex flex-col gap-4 border-t pt-4">
        <h2 className="font-medium">Avaliações</h2>
        <ReviewForm googleBooksId={googleBooksId} onCreated={loadReviews} />
        {reviews && <ReviewList data={reviews} />}
      </div>
    </div>
  );
}
