"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, X } from "lucide-react";
import { removeBook } from "../services/list.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import type { BookList } from "../types";

interface ListCardProps {
  list: BookList;
  onChange: (list: BookList) => void;
}

export function ListCard({ list, onChange }: ListCardProps) {
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function handleRemove(bookId: number) {
    setRemovingId(bookId);
    try {
      const updated = await removeBook(list.id, bookId);
      onChange(updated);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{list.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {list.books.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum livro nessa lista ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {list.books.map((book) => (
              <li key={book.id} className="flex items-center gap-3">
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                  {book.coverUrl ? (
                    <Image src={book.coverUrl} alt={book.title} fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <BookOpen className="size-4" />
                    </div>
                  )}
                </div>
                <Link
                  href={`/books/${encodeURIComponent(book.googleBooksId)}`}
                  className="flex-1 text-sm font-medium hover:underline"
                >
                  {book.title}
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={removingId === book.id}
                  onClick={() => handleRemove(book.id)}
                  aria-label={`Remover ${book.title} da lista`}
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
