import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { BookSearchResult } from "../types";

export function BookCard({ book }: { book: BookSearchResult }) {
  return (
    <Link href={`/books/${encodeURIComponent(book.googleBooksId)}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        <CardContent className="flex flex-col gap-4 p-5 h-full">
          <div className="relative mx-auto h-48 w-32 shrink-0 overflow-hidden rounded-md shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, 128px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground/50 border border-border/50">
                <BookOpen className="h-10 w-10 stroke-1" />
              </div>
            )}
            
            {/* Soft inner shadow for the book cover */}
            <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10 dark:ring-white/10" />
            
            {/* Book spine highlight effect */}
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/30 to-transparent mix-blend-overlay" />
          </div>

          <div className="flex flex-col flex-grow gap-2 mt-2">
            <h3 className="line-clamp-2 font-serif text-lg font-medium leading-snug text-foreground/90 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            
            <div className="mt-auto space-y-1.5 pt-2">
              {book.authors.length > 0 && (
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70" />
                  <span className="line-clamp-2">{book.authors.join(", ")}</span>
                </div>
              )}
              {book.publishedDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span>{book.publishedDate.substring(0, 4)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
