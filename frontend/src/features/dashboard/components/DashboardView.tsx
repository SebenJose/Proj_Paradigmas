"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MessageSquare, Star, TrendingUp } from "lucide-react";
import { getDashboard } from "../services/dashboard.service";
import { StarRating } from "@/shared/components/StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { BookRatingSummary, Dashboard } from "../types";

function BookRatingRow({ book, index }: { book: BookRatingSummary; index?: number }) {
  return (
    <li className="group relative flex items-center justify-between gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-border/50 hover:bg-muted/30">
      <div className="flex items-center gap-3 overflow-hidden">
        {index !== undefined && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {index + 1}
          </span>
        )}
        <Link
          href={`/books/${encodeURIComponent(book.googleBooksId)}`}
          className="truncate text-sm font-medium transition-colors hover:text-primary"
        >
          {book.title}
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-background px-2 py-1 shadow-sm border border-border/50">
        <StarRating rating={book.averageRating} />
        <span className="text-[10px] font-medium text-muted-foreground ml-1">
          ({book.reviewCount})
        </span>
      </div>
    </li>
  );
}

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
    <div className="flex h-64 w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-lg transition-all hover:shadow-xl">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 border-b border-border/40">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
            <Star className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-serif">Aclamação da Crítica</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {dashboard.topRated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground/70">
              <Star className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Sem avaliações ainda.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {dashboard.topRated.map((book, i) => (
                <BookRatingRow key={book.googleBooksId} book={book} index={i} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-lg transition-all hover:shadow-xl">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 border-b border-border/40">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
            <TrendingUp className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-serif">Os Mais Populares</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {dashboard.mostReviewed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground/70">
              <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Sem avaliações ainda.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {dashboard.mostReviewed.map((book, i) => (
                <BookRatingRow key={book.googleBooksId} book={book} index={i} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 border-border/40 bg-card/60 backdrop-blur-sm shadow-lg">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 border-b border-border/40">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
            <Clock className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-serif">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {dashboard.recentReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/70">
              <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">O clube do livro está quieto no momento.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard.recentReviews.map((review) => (
                <li key={review.id} className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                      {review.username}
                    </span>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3 py-1">
                    "{review.comment}"
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
