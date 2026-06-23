"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboard } from "../services/dashboard.service";
import { StarRating } from "@/shared/components/StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { BookRatingSummary, Dashboard } from "../types";

function BookRatingRow({ book }: { book: BookRatingSummary }) {
  return (
    <li>
      <Link
        href={`/books/${encodeURIComponent(book.googleBooksId)}`}
        className="flex items-center justify-between gap-2 hover:underline"
      >
        <span className="text-sm">{book.title}</span>
        <span className="flex items-center gap-1.5 shrink-0">
          <StarRating rating={book.averageRating} />
          <span className="text-xs text-muted-foreground">({book.reviewCount})</span>
        </span>
      </Link>
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

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!dashboard) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Melhor avaliados</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.topRated.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem avaliações ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {dashboard.topRated.map((book) => (
                <BookRatingRow key={book.googleBooksId} book={book} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mais avaliados</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.mostReviewed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem avaliações ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {dashboard.mostReviewed.map((book) => (
                <BookRatingRow key={book.googleBooksId} book={book} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Avaliações recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.recentReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem avaliações ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {dashboard.recentReviews.map((review) => (
                <li key={review.id} className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium">{review.username}</span>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
