"use client";

import { useEffect, useState } from "react";
import { LibraryBig, SearchX } from "lucide-react";
import { getMine } from "../services/list.service";
import { CreateListForm } from "./CreateListForm";
import { ListCard } from "./ListCard";
import type { BookList } from "../types";

export function ListsView() {
  const [lists, setLists] = useState<BookList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMine()
      .then(setLists)
      .catch(() => setError("Não foi possível carregar suas listas"))
      .finally(() => setIsLoading(false));
  }, []);

  function handleCreated(list: BookList) {
    setLists((prev) => [...prev, list]);
  }

  function handleChange(updated: BookList) {
    setLists((prev) => prev.map((list) => (list.id === updated.id ? updated : list)));
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <LibraryBig className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground text-lg">Organize suas leituras em coleções personalizadas.</p>
        </div>
        <div className="max-w-md mt-2">
          <CreateListForm onCreated={handleCreated} />
        </div>
      </div>

      {isLoading && (
        <div className="flex h-40 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      
      {error && (
        <div className="flex h-40 w-full items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!isLoading && !error && lists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card/30 border-dashed border-border/50">
          <SearchX className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-serif font-medium text-foreground">Sua estante está vazia</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">Crie sua primeira lista acima para começar a organizar os livros que você já leu ou quer ler.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}
