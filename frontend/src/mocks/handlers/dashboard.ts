import { http, HttpResponse } from "msw";
import { API_URL } from "@/shared/lib/env";
import type { BookRatingSummary, Dashboard } from "@/features/dashboard/types";
import { bookTitlesByGoogleId, reviews } from "../data";

function buildBookRatingSummaries(): BookRatingSummary[] {
  const byBook = new Map<string, { title: string; coverUrl: string | null; ratings: number[] }>();

  for (const review of reviews) {
    const known = bookTitlesByGoogleId.get(review.googleBooksId);
    const entry = byBook.get(review.googleBooksId) ?? {
      title: known?.title ?? review.googleBooksId,
      coverUrl: known?.coverUrl ?? null,
      ratings: [],
    };
    entry.ratings.push(review.rating);
    byBook.set(review.googleBooksId, entry);
  }

  return Array.from(byBook.entries()).map(([googleBooksId, entry]) => ({
    googleBooksId,
    title: entry.title,
    coverUrl: entry.coverUrl,
    averageRating:
      Math.round((entry.ratings.reduce((sum, r) => sum + r, 0) / entry.ratings.length) * 10) / 10,
    reviewCount: entry.ratings.length,
  }));
}

export const dashboardHandlers = [
  http.get(`${API_URL}/api/dashboard`, () => {
    const summaries = buildBookRatingSummaries();

    const topRated = [...summaries].sort((a, b) => b.averageRating - a.averageRating).slice(0, 5);
    const mostReviewed = [...summaries].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);
    const recentReviews = [...reviews]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const body: Dashboard = { topRated, mostReviewed, recentReviews };
    return HttpResponse.json(body);
  }),
];
