"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, FolderOpen, Trash2, Lock, Eye } from "lucide-react";
import { removeBook, updatePrivacy } from "../services/list.service";
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
    } catch {
      alert("Não foi possível remover o livro da lista. Tente novamente.");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleTogglePrivacy() {
    try {
      const updated = await updatePrivacy(list.id, !list.isPrivate);
      onChange(updated);
    } catch {
      alert("Não foi possível alterar a privacidade da lista. Tente novamente.");
    }
  }

  return (
    <Card className="h-full border-border/40 bg-card/60 backdrop-blur-sm shadow-md transition-all hover:shadow-lg flex flex-col">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-serif">{list.name}</CardTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"
            onClick={handleTogglePrivacy}
            title={list.isPrivate ? "Tornar Pública (Visível para outros)" : "Tornar Privada (Apenas você vê)"}
          >
            {list.isPrivate ? (
              <Lock className="h-4 w-4 text-amber-600" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground/50" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {list.books.length} {list.books.length === 1 ? 'livro' : 'livros'}
        </p>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        {list.books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground/50">
            <BookOpen className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum livro nessa lista ainda.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {list.books.map((book) => (
              <li key={book.id} className="group flex items-center justify-between gap-3 rounded-md border border-transparent p-2 transition-colors hover:border-border/50 hover:bg-muted/30">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded shadow-sm bg-muted border border-border/50">
                    {book.coverUrl ? (
                      <Image src={book.coverUrl} alt={book.title} fill sizes="32px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                        <BookOpen className="size-3" />
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/books/${encodeURIComponent(book.googleBooksId)}`}
                    className="truncate text-sm font-medium hover:text-primary transition-colors"
                  >
                    {book.title}
                  </Link>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                  disabled={removingId === book.id}
                  onClick={() => handleRemove(book.id)}
                  aria-label={`Remover ${book.title} da lista`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
