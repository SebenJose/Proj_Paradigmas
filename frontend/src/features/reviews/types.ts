export interface Review {
  id: number;
  username: string;
  googleBooksId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BookReviews {
  averageRating: number | null;
  reviewCount: number;
  reviews: Review[];
}

export interface CreateReviewRequest {
  googleBooksId: string;
  rating: number;
  comment: string;
}
