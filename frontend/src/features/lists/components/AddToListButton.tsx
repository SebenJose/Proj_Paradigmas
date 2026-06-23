"use client";

import { useEffect, useState } from "react";
import { addBook, getMine } from "../services/list.service";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { CreateListForm } from "./CreateListForm";
import type { BookList } from "../types";

interface AddToListButtonProps {
  googleBooksId: string;
  title: string;
  coverUrl: string | null;
}

export function AddToListButton({ googleBooksId, title, coverUrl }: AddToListButtonProps) {
  const [lists, setLists] = useState<BookList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    getMine()
      .then((data) => {
        setLists(data);
        if (data.length > 0) setSelectedListId(String(data[0].id));
      })
      .catch(() => setLists([]));
  }, []);

  function handleListCreated(list: BookList) {
    setLists((prev) => [...prev, list]);
    setSelectedListId(String(list.id));
    setCreatingNew(false);
  }

  async function handleAdd() {
    if (!selectedListId) return;
    setIsAdding(true);
    setFeedback(null);

    try {
      await addBook(Number(selectedListId), { googleBooksId, title, coverUrl });
      setFeedback("Adicionado à lista!");
    } catch {
      setFeedback("Não foi possível adicionar à lista");
    } finally {
      setIsAdding(false);
    }
  }

  if (creatingNew || lists.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <CreateListForm onCreated={handleListCreated} />
        {lists.length > 0 && (
          <button
            type="button"
            onClick={() => setCreatingNew(false)}
            className="self-start text-sm text-muted-foreground underline"
          >
            Usar uma lista existente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedListId} onValueChange={setSelectedListId}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Escolha uma lista" />
        </SelectTrigger>
        <SelectContent>
          {lists.map((list) => (
            <SelectItem key={list.id} value={String(list.id)}>
              {list.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" onClick={handleAdd} disabled={isAdding}>
        {isAdding ? "Adicionando..." : "Adicionar à lista"}
      </Button>

      <button
        type="button"
        onClick={() => setCreatingNew(true)}
        className="text-sm text-muted-foreground underline"
      >
        nova lista
      </button>

      {feedback && <span className="text-sm text-muted-foreground">{feedback}</span>}
    </div>
  );
}
