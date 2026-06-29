import type { BookList } from "@/features/lists/types";

export interface UserReview {
  id: number;
  bookTitle: string;
  googleBooksId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserProfile {
  username: string;
  lists: BookList[];
  reviews: UserReview[];
}
