"use client";

import { useState } from "react";
import { search } from "../services/book.service";
import { BookSearchForm } from "./BookSearchForm";
import { BookCard } from "./BookCard";
import type { BookSearchResult } from "../types";
import { ApiError } from "@/shared/lib/api-client";

export function BookSearchView() {
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(query: string) {
    setIsSearching(true);
    setError(null);

    try {
      const books = await search(query);
      setResults(books);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível buscar livros agora");
      setResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <BookSearchForm onSearch={handleSearch} isSearching={isSearching} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {hasSearched && !isSearching && !error && results.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum livro encontrado.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {results.map((book) => (
          <BookCard key={book.googleBooksId} book={book} />
        ))}
      </div>
    </div>
  );
}
