import type { Review } from "@/features/reviews/types";
import type { BookList } from "@/features/lists/types";

interface SeedBook {
  googleBooksId: string;
  title: string;
  coverUrl: string | null;
}

const seedBooks: SeedBook[] = [
  { googleBooksId: "wrOQLV6xB-wC", title: "Harry Potter e a Pedra Filosofal", coverUrl: null },
  { googleBooksId: "zyTCAlFPjgYC", title: "A Guerra dos Tronos", coverUrl: null },
  { googleBooksId: "PCDengEACAAJ", title: "O Hobbit", coverUrl: null },
];

export const bookTitlesByGoogleId = new Map<string, { title: string; coverUrl: string | null }>(
  seedBooks.map((book) => [book.googleBooksId, { title: book.title, coverUrl: book.coverUrl }]),
);

export const reviews: Review[] = [
  {
    id: 1,
    username: "leitora_ana",
    googleBooksId: seedBooks[0].googleBooksId,
    rating: 5,
    comment: "Releio todo ano, um clássico que não envelhece.",
    createdAt: "2026-06-10T14:30:00Z",
  },
  {
    id: 2,
    username: "bruno_livros",
    googleBooksId: seedBooks[0].googleBooksId,
    rating: 4,
    comment: "Ótimo início de saga, mas o ritmo demora a engrenar.",
    createdAt: "2026-06-15T09:00:00Z",
  },
  {
    id: 3,
    username: "leitora_ana",
    googleBooksId: seedBooks[1].googleBooksId,
    rating: 5,
    comment: "Construção de mundo impressionante.",
    createdAt: "2026-06-18T20:15:00Z",
  },
  {
    id: 4,
    username: "carla_reads",
    googleBooksId: seedBooks[2].googleBooksId,
    rating: 4,
    comment: "Aventura leve e divertida, ótima porta de entrada pro Tolkien.",
    createdAt: "2026-06-20T11:45:00Z",
  },
];

export let nextReviewId = reviews.length + 1;
export function takeNextReviewId(): number {
  return nextReviewId++;
}

export const lists: BookList[] = [
  {
    id: 1,
    name: "Quero ler",
    books: [
      { id: 201, googleBooksId: seedBooks[2].googleBooksId, title: seedBooks[2].title, coverUrl: null },
    ],
  },
];

export let nextListId = lists.length + 1;
export function takeNextListId(): number {
  return nextListId++;
}

export let nextBookEntryId = 1000;
export function takeNextBookEntryId(): number {
  return nextBookEntryId++;
}
