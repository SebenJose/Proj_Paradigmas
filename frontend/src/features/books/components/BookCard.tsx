import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { BookSearchResult } from "../types";

export function BookCard({ book }: { book: BookSearchResult }) {
  return (
    <Link href={`/books/${encodeURIComponent(book.googleBooksId)}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex gap-3">
          <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <BookOpen className="size-6" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="line-clamp-2 font-medium leading-snug">{book.title}</h3>
            {book.authors.length > 0 && (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {book.authors.join(", ")}
              </p>
            )}
            {book.publishedDate && (
              <p className="text-xs text-muted-foreground">{book.publishedDate}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
