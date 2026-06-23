import type { Review } from "@/features/reviews/types";

export interface BookRatingSummary {
  googleBooksId: string;
  title: string;
  coverUrl: string | null;
  averageRating: number;
  reviewCount: number;
}

export interface Dashboard {
  topRated: BookRatingSummary[];
  mostReviewed: BookRatingSummary[];
  recentReviews: Review[];
}
