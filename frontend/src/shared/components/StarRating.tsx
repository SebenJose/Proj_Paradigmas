"use client";

import { useState, useRef } from "react";
import { Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  className?: string;
  interactive?: boolean;
}

export function StarRating({ rating, onChange, className, interactive = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>, starIndex: number) {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const currentStarRating = starIndex + (isLeftHalf ? 0.5 : 1.0);
    setHoverRating(currentStarRating);
  }

  function handleMouseLeave() {
    if (!interactive) return;
    setHoverRating(null);
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>, starIndex: number) {
    if (!interactive || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const selectedRating = starIndex + (isLeftHalf ? 0.5 : 1.0);
    onChange(selectedRating);
  }

  return (
    <div
      ref={containerRef}
      className={cn("flex items-center gap-0.5", className, interactive && "cursor-pointer")}
      onMouseLeave={handleMouseLeave}
      aria-label={`${displayRating} de 5 estrelas`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const isFull = displayRating >= index + 1;
        const isHalf = displayRating >= index + 0.5 && displayRating < index + 1;

        return (
          <div
            key={index}
            className={cn(
              "relative size-5 select-none transition-transform duration-100",
              interactive && "hover:scale-125 active-press"
            )}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={(e) => handleClick(e, index)}
          >
            <Star className="absolute size-5 fill-none text-muted-foreground" />
            {isFull && (
              <Star className="absolute size-5 fill-[var(--star-rating)] text-[var(--star-rating)]" />
            )}
            {isHalf && (
              <Star
                className="absolute size-5 fill-[var(--star-rating)] text-[var(--star-rating)]"
                style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
              />
            )}
          </div>
        );
      })}
      {interactive && (
        <span className="ml-2 font-mono text-sm text-muted-foreground">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
