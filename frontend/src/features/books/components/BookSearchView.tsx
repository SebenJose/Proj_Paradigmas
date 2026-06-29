"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    handleSearch("best sellers");
  }, []);

  return (
    <div className="flex w-full max-w-7xl flex-col gap-6">
      <BookSearchForm onSearch={handleSearch} isSearching={isSearching} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isSearching && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full bg-muted/60 animate-pulse rounded-md" />
          ))}
        </div>
      )}

      {hasSearched && !isSearching && !error && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">Nenhum livro encontrado.</p>
      )}

      {!isSearching && results.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {results.length} {results.length === 1 ? "resultado" : "resultados"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((book) => (
              <BookCard key={book.googleBooksId} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
