import { apiFetch } from "@/shared/lib/api-client";
import type { BookReviews, CreateReviewRequest, Review } from "../types";

export function getByBook(googleBooksId: string): Promise<BookReviews> {
  return apiFetch<BookReviews>(`/api/reviews/book/${encodeURIComponent(googleBooksId)}`);
}

export function create(data: CreateReviewRequest): Promise<Review> {
  return apiFetch<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMine(): Promise<Review[]> {
  return apiFetch<Review[]>("/api/reviews/me");
}
