import { apiFetch } from "@/shared/lib/api-client";
import type { BookDetail, BookSearchResult } from "../types";

export function search(query: string): Promise<BookSearchResult[]> {
  return apiFetch<BookSearchResult[]>(`/api/books/search?q=${encodeURIComponent(query)}`);
}

export function getByGoogleId(googleBooksId: string): Promise<BookDetail> {
  return apiFetch<BookDetail>(`/api/books/${encodeURIComponent(googleBooksId)}`);
}
