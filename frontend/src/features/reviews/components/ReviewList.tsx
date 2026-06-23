import { StarRating } from "@/shared/components/StarRating";
import type { BookReviews } from "../types";

export function ReviewList({ data }: { data: BookReviews }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {data.averageRating !== null ? (
          <>
            <StarRating rating={data.averageRating} />
            <span className="text-sm text-muted-foreground">
              {data.averageRating.toFixed(1)} ({data.reviewCount}{" "}
              {data.reviewCount === 1 ? "avaliação" : "avaliações"})
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Ainda sem avaliações</span>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {data.reviews.map((review) => (
          <li key={review.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{review.username}</span>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
