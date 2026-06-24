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
import { Card, CardContent } from "@/shared/components/ui/card";

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
    <div className="flex w-full max-w-4xl flex-col gap-8 mx-auto">
      <Card className="overflow-hidden border-border/40 shadow-xl bg-card/80 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Book Cover Section */}
            <div className="flex-shrink-0 bg-muted/30 p-8 md:p-12 flex items-center justify-center md:border-r border-border/50">
              <div className="relative h-64 w-44 md:h-80 md:w-56 shrink-0 overflow-hidden rounded-md shadow-2xl transition-transform duration-500 hover:scale-105 hover:rotate-1">
                {book.coverUrl ? (
                  <Image 
                    src={book.coverUrl} 
                    alt={book.title} 
                    fill 
                    sizes="(max-width: 768px) 176px, 224px" 
                    className="object-cover" 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/80 text-muted-foreground/50 border border-border/50">
                    <BookOpen className="h-16 w-16 stroke-1" />
                  </div>
                )}
                {/* Soft inner shadow */}
                <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                {/* Book spine highlight */}
                <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-white/40 to-transparent mix-blend-overlay" />
              </div>
            </div>

            {/* Book Info Section */}
            <div className="flex flex-col flex-grow p-8 md:p-12 gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight text-foreground/90">
                  {book.title}
                </h1>
                
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {book.authors.length > 0 && (
                    <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full text-primary font-medium">
                      <User className="h-4 w-4" />
                      <span>{book.authors.join(", ")}</span>
                    </div>
                  )}
                  {book.publishedDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span>{book.publishedDate}</span>
                    </div>
                  )}
                  {book.pageCount && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 opacity-70" />
                      <span>{book.pageCount} páginas</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2">
                <AddToListButton
                  googleBooksId={book.googleBooksId}
                  title={book.title}
                  coverUrl={book.coverUrl}
                />
              </div>

              {book.description && (
                <div className="mt-2 space-y-3 border-t border-border/50 pt-6">
                  <h3 className="font-serif text-lg font-medium">Sinopse</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground/90 text-justify">
                    {book.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 mt-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-4">
          <h2 className="text-2xl font-serif font-medium">Avaliações e Resenhas</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <ReviewForm googleBooksId={googleBooksId} onCreated={loadReviews} />
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            {reviews && reviews.reviews.length > 0 ? (
              <ReviewList data={reviews} />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card/30 border-dashed">
                <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Nenhuma avaliação ainda.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Seja o primeiro a compartilhar sua opinião sobre este livro!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
