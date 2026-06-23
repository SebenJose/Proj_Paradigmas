import { http, HttpResponse } from "msw";
import { API_URL } from "@/shared/lib/env";
import type { BookReviews, CreateReviewRequest, Review } from "@/features/reviews/types";
import { reviews, takeNextReviewId } from "../data";
import { usernameFromAuthHeader } from "../jwt";

function reviewsForBook(googleBooksId: string): Review[] {
  return reviews.filter((review) => review.googleBooksId === googleBooksId);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export const reviewHandlers = [
  http.get(`${API_URL}/api/reviews/book/:googleBooksId`, ({ params }) => {
    const googleBooksId = params.googleBooksId as string;
    const bookReviews = reviewsForBook(googleBooksId);

    const body: BookReviews = {
      averageRating: average(bookReviews.map((review) => review.rating)),
      reviewCount: bookReviews.length,
      reviews: [...bookReviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    };

    return HttpResponse.json(body);
  }),

  http.get(`${API_URL}/api/reviews/me`, ({ request }) => {
    const username = usernameFromAuthHeader(request.headers.get("authorization"));
    if (!username) {
      return HttpResponse.json({ status: 401, message: "Não autenticado" }, { status: 401 });
    }

    const mine = reviews.filter((review) => review.username === username);
    return HttpResponse.json(mine);
  }),

  http.post(`${API_URL}/api/reviews`, async ({ request }) => {
    const username = usernameFromAuthHeader(request.headers.get("authorization"));
    if (!username) {
      return HttpResponse.json({ status: 401, message: "Não autenticado" }, { status: 401 });
    }

    const body = (await request.json()) as CreateReviewRequest;

    if (body.rating < 1 || body.rating > 5) {
      return HttpResponse.json(
        { status: 400, message: "Dados inválidos", errors: { rating: "A nota deve ser entre 1 e 5" } },
        { status: 400 },
      );
    }

    const alreadyReviewed = reviews.some(
      (review) => review.username === username && review.googleBooksId === body.googleBooksId,
    );
    if (alreadyReviewed) {
      return HttpResponse.json(
        { status: 409, message: "Você já avaliou esse livro" },
        { status: 409 },
      );
    }

    const review: Review = {
      id: takeNextReviewId(),
      username,
      googleBooksId: body.googleBooksId,
      rating: body.rating,
      comment: body.comment,
      createdAt: new Date().toISOString(),
    };
    reviews.push(review);

    return HttpResponse.json(review, { status: 201 });
  }),
];
