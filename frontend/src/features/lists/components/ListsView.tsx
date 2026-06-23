"use client";

import { useEffect, useState } from "react";
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
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <CreateListForm onCreated={handleCreated} />

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && !error && lists.length === 0 && (
        <p className="text-sm text-muted-foreground">Você ainda não criou nenhuma lista.</p>
      )}

      <div className="flex flex-col gap-4">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}
