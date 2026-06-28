"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen, Calendar, FileText, User } from "lucide-react";
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

  if (error) return (
    <div className="flex h-40 w-full items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
      <p className="font-medium">{error}</p>
    </div>
  );
  
  if (!book) return (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 py-8">
      {book.coverUrl && (
        <div className="absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-15 blur-3xl scale-110"
            style={{ backgroundImage: `url(${book.coverUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="flex flex-col items-center lg:items-start lg:col-span-1">
          <div className="relative h-72 w-48 md:h-80 md:w-56 overflow-hidden rounded-md shadow-2xl transition-transform duration-500 hover:scale-105 hover:rotate-1">
            {book.coverUrl ? (
              <Image 
                src={book.coverUrl} 
                alt={book.title} 
                fill 
                sizes="(max-width: 768px) 192px, 224px" 
                className="object-cover" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/80 text-muted-foreground/50 border border-border/50">
                <BookOpen className="h-16 w-16 stroke-1" />
              </div>
            )}
            <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10 dark:ring-white/10" />
            <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-white/40 to-transparent mix-blend-overlay" />
          </div>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight text-foreground/90">
              {book.title}
            </h1>
            
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {book.authors.length > 0 && (
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full text-primary font-medium">
                  <User className="h-3.5 w-3.5" />
                  <span>{book.authors.join(", ")}</span>
                </div>
              )}
              {book.publishedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 opacity-75" />
                  <span>{book.publishedDate}</span>
                </div>
              )}
              {book.pageCount && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 opacity-75" />
                  <span>{book.pageCount} páginas</span>
                </div>
              )}
            </div>
          </div>

          {book.description && (
            <div className="space-y-2 border-t border-border/20 pt-6">
              <h3 className="font-serif text-lg font-medium text-foreground/80">Sinopse</h3>
              <p className="text-sm leading-relaxed text-muted-foreground/90 text-justify">
                {book.description}
              </p>
            </div>
          )}

          <div className="space-y-6 border-t border-border/20 pt-6">
            <h2 className="text-2xl font-serif font-medium text-foreground/80">Críticas de Leitores</h2>
            
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
          </div>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
          <div className="backdrop-blur-glass p-5 rounded-lg shadow-lg flex flex-col gap-6">
            <div>
              <AddToListButton
                googleBooksId={book.googleBooksId}
                title={book.title}
                coverUrl={book.coverUrl}
              />
            </div>
            
            <div className="border-t border-border/20 pt-5">
              <ReviewForm googleBooksId={googleBooksId} onCreated={loadReviews} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
