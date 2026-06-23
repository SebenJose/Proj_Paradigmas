import { http, HttpResponse } from "msw";
import { API_URL } from "@/shared/lib/env";
import type { AddBookToListRequest, BookList, CreateListRequest } from "@/features/lists/types";
import { bookTitlesByGoogleId, lists, takeNextBookEntryId, takeNextListId } from "../data";
import { usernameFromAuthHeader } from "../jwt";

function requireAuth(authHeader: string | null) {
  return usernameFromAuthHeader(authHeader);
}

export const listHandlers = [
  http.get(`${API_URL}/api/lists/me`, ({ request }) => {
    const username = requireAuth(request.headers.get("authorization"));
    if (!username) {
      return HttpResponse.json({ status: 401, message: "Não autenticado" }, { status: 401 });
    }

    return HttpResponse.json(lists);
  }),

  http.post(`${API_URL}/api/lists`, async ({ request }) => {
    const username = requireAuth(request.headers.get("authorization"));
    if (!username) {
      return HttpResponse.json({ status: 401, message: "Não autenticado" }, { status: 401 });
    }

    const body = (await request.json()) as CreateListRequest;

    if (!body.name?.trim()) {
      return HttpResponse.json(
        { status: 400, message: "Dados inválidos", errors: { name: "Nome é obrigatório" } },
        { status: 400 },
      );
    }

    const nameTaken = lists.some(
      (list) => list.name.toLowerCase() === body.name.trim().toLowerCase(),
    );
    if (nameTaken) {
      return HttpResponse.json(
        { status: 409, message: "Você já tem uma lista com esse nome" },
        { status: 409 },
      );
    }

    const list: BookList = { id: takeNextListId(), name: body.name.trim(), books: [] };
    lists.push(list);

    return HttpResponse.json(list, { status: 201 });
  }),

  http.post(`${API_URL}/api/lists/:id/books`, async ({ request, params }) => {
    const username = requireAuth(request.headers.get("authorization"));
    if (!username) {
      return HttpResponse.json({ status: 401, message: "Não autenticado" }, { status: 401 });
    }

    const listId = Number(params.id);
    const list = lists.find((item) => item.id === listId);
    if (!list) {
      return HttpResponse.json({ status: 404, message: "Lista não encontrada" }, { status: 404 });
    }

    const body = (await request.json()) as AddBookToListRequest;
    bookTitlesByGoogleId.set(body.googleBooksId, { title: body.title, coverUrl: body.coverUrl });

    const alreadyInList = list.books.some((book) => book.googleBooksId === body.googleBooksId);
    if (!alreadyInList) {
      list.books.push({
        id: takeNextBookEntryId(),
        googleBooksId: body.googleBooksId,
        title: body.title,
        coverUrl: body.coverUrl,
      });
    }

    return HttpResponse.json(list);
  }),

  http.delete(`${API_URL}/api/lists/:id/books/:bookId`, ({ request, params }) => {
    const username = requireAuth(request.headers.get("authorization"));
    if (!username) {
      return HttpResponse.json({ status: 401, message: "Não autenticado" }, { status: 401 });
    }

    const listId = Number(params.id);
    const bookId = Number(params.bookId);
    const list = lists.find((item) => item.id === listId);
    if (!list) {
      return HttpResponse.json({ status: 404, message: "Lista não encontrada" }, { status: 404 });
    }

    list.books = list.books.filter((book) => book.id !== bookId);

    return HttpResponse.json(list);
  }),
];
