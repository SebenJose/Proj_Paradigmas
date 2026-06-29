import { apiFetch } from "@/shared/lib/api-client";
import type { AddBookToListRequest, BookList, CreateListRequest } from "../types";

export function getMine(): Promise<BookList[]> {
  return apiFetch<BookList[]>("/api/lists/me");
}

export function create(data: CreateListRequest): Promise<BookList> {
  return apiFetch<BookList>("/api/lists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function addBook(listId: number, data: AddBookToListRequest): Promise<BookList> {
  return apiFetch<BookList>(`/api/lists/${listId}/books`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function removeBook(listId: number, bookId: number): Promise<BookList> {
  return apiFetch<BookList>(`/api/lists/${listId}/books/${bookId}`, {
    method: "DELETE",
  });
}

export function updatePrivacy(listId: number, isPrivate: boolean): Promise<BookList> {
  return apiFetch<BookList>(`/api/lists/${listId}/privacy`, {
    method: "PATCH",
    body: JSON.stringify({ isPrivate }),
  });
}
