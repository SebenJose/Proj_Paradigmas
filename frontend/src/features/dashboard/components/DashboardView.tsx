"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Star, TrendingUp } from "lucide-react";
import { getDashboard } from "../services/dashboard.service";
import { StarRating } from "@/shared/components/StarRating";
import { BookCard } from "@/features/books/components/BookCard";
import type { Dashboard } from "../types";

export function DashboardView() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch(() => setError("Não foi possível carregar o dashboard"));
  }, []);

  if (error) return (
    <div className="flex h-40 w-full items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
      <p className="font-medium">{error}</p>
    </div>
  );

  if (!dashboard) return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full max-w-6xl mx-auto px-4 py-8">
      <div className="lg:col-span-3 space-y-12">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted/60 animate-pulse rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[2/3] w-full bg-muted/60 animate-pulse rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted/60 animate-pulse rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[2/3] w-full bg-muted/60 animate-pulse rounded-md" />
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-4">
        <div className="h-8 w-32 bg-muted/60 animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full bg-muted/60 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full max-w-6xl mx-auto px-4 py-8">
      <div className="lg:col-span-3 space-y-12">
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-serif font-semibold text-foreground/80">Os Mais Populares</h2>
          </div>
          {dashboard.mostReviewed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum livro popular no momento.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {dashboard.mostReviewed.map((book) => (
                <div key={book.googleBooksId} className="flex flex-col gap-1">
                  <BookCard book={{
                    googleBooksId: book.googleBooksId,
                    title: book.title,
                    coverUrl: book.coverUrl,
                    authors: [],
                    publishedDate: null
                  }} />
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span className="font-mono">{book.averageRating.toFixed(1)} ★</span>
                    <span>{book.reviewCount} resenhas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-serif font-semibold text-foreground/80">Aclamação da Crítica</h2>
          </div>
          {dashboard.topRated.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma recomendação no momento.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {dashboard.topRated.map((book) => (
                <div key={book.googleBooksId} className="flex flex-col gap-1">
                  <BookCard book={{
                    googleBooksId: book.googleBooksId,
                    title: book.title,
                    coverUrl: book.coverUrl,
                    authors: [],
                    publishedDate: null
                  }} />
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span className="font-mono">{book.averageRating.toFixed(1)} ★</span>
                    <span>{book.reviewCount} resenhas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/20 pb-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-serif font-semibold text-foreground/80">Atividade Recente</h2>
        </div>
        {dashboard.recentReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
        ) : (
          <ul className="space-y-4">
            {dashboard.recentReviews.map((review) => (
              <li key={review.id} className="backdrop-blur-glass p-4 rounded-lg shadow flex flex-col gap-2 transition-transform duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <Link href={`/profile/${encodeURIComponent(review.username)}`} className="text-xs font-semibold text-primary hover:underline hover:text-primary-hover transition-colors">
                    {review.username}
                  </Link>
                  <StarRating rating={review.rating} className="scale-75 origin-right" />
                </div>
                <p className="text-xs text-muted-foreground italic border-l border-primary/20 pl-2 py-0.5">
                  {"\""}{review.comment || "Sem comentário."}{"\""}
                </p>
                <Link href={`/books/${encodeURIComponent(review.googleBooksId)}`} className="text-[10px] text-right text-muted-foreground hover:text-primary transition-colors">
                  Ver livro &rarr;
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
