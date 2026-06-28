"use client";

import { useEffect, useState } from "react";
import { getUserProfile } from "../services/user.service";
import type { UserProfile } from "../types";
import { StarRating } from "@/shared/components/StarRating";
import { BookCard } from "@/features/books/components/BookCard";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";

export function UserProfileView({ username }: { username: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"lists" | "reviews">("lists");

  useEffect(() => {
    getUserProfile(username)
      .then(setProfile)
      .catch(() => setError("Não foi possível carregar o perfil do usuário."));
  }, [username]);

  if (error) return (
    <div className="flex h-40 w-full items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 text-destructive max-w-4xl mx-auto mt-8">
      <p className="font-medium">{error}</p>
    </div>
  );

  if (!profile) return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="h-24 w-full bg-muted/60 animate-pulse rounded-lg" />
      <div className="h-40 w-full bg-muted/60 animate-pulse rounded-lg" />
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Perfil Header */}
      <div className="flex items-center gap-4 bg-muted/20 p-6 rounded-xl border border-border/20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Perfil de @{profile.username}</h1>
          <p className="text-sm text-muted-foreground">
            {profile.lists.length} listas públicas • {profile.reviews.length} avaliações
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/20">
        <button
          onClick={() => setActiveTab("lists")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "lists"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Listas Públicas
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "reviews"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="h-4 w-4" /> Avaliações ({profile.reviews.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === "lists" ? (
          profile.lists.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Nenhuma lista pública encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.lists.map((list) => (
                <div key={list.id} className="border border-border/20 rounded-xl p-4 space-y-4 bg-background shadow-sm">
                  <h3 className="font-serif text-lg font-semibold">{list.name}</h3>
                  {list.books.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Lista vazia.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {list.books.map((book) => (
                        <div key={book.googleBooksId} className="flex flex-col gap-1">
                          <BookCard book={{
                            googleBooksId: book.googleBooksId,
                            title: book.title,
                            coverUrl: book.coverUrl,
                            authors: [],
                            publishedDate: null
                          }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          profile.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Nenhuma avaliação encontrada.</p>
          ) : (
            <ul className="space-y-4">
              {profile.reviews.map((review) => (
                <li key={review.id} className="border border-border/20 rounded-xl p-4 space-y-2 bg-background shadow-sm">
                  <div className="flex items-center justify-between">
                    <Link href={`/books/${encodeURIComponent(review.googleBooksId)}`} className="text-sm font-semibold hover:underline text-foreground/80">
                      {review.bookTitle}
                    </Link>
                    <StarRating rating={review.rating} className="scale-90 origin-right" />
                  </div>
                  <p className="text-sm text-muted-foreground italic pl-2 border-l border-primary/20">
                    {`"${review.comment || "Sem comentário."}"`}
                  </p>
                  <div className="text-[10px] text-muted-foreground text-right">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
