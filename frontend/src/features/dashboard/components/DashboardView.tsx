"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MessageSquare, Star, TrendingUp, LayoutDashboard } from "lucide-react";
import { getDashboard } from "../services/dashboard.service";
import { StarRating } from "@/shared/components/StarRating";
import { BookCard } from "@/features/books/components/BookCard";
import type { Dashboard } from "../types";

type TabId = "overview" | "popular" | "acclaimed" | "recent";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "overview", label: "Visão Geral", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "popular", label: "Os Mais Populares", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "acclaimed", label: "Aclamação da Crítica", icon: <Star className="h-4 w-4" /> },
  { id: "recent", label: "Atividade Recente", icon: <MessageSquare className="h-4 w-4" /> },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-10 animate-pulse">
      {/* tab bar skeleton */}
      <div className="flex gap-2 border-b border-border/20 pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-36 rounded-full bg-muted/60" />
        ))}
      </div>
      {/* grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[2/3] w-full bg-muted/60 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[2/3] w-full bg-muted/60 rounded-md" />
        ))}
      </div>
    </div>
  );
}

// ── Book grid section ─────────────────────────────────────────────────────────
function BookSection({
  title,
  icon,
  books,
  emptyMessage,
}: {
  title: string;
  icon: React.ReactNode;
  books: Dashboard["topRated"];
  emptyMessage: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border/20 pb-2">
        {icon}
        <h2 className="text-xl font-serif font-semibold text-foreground/80">{title}</h2>
      </div>
      {books.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <div key={book.googleBooksId} className="flex flex-col gap-1 group">
              <BookCard
                book={{
                  googleBooksId: book.googleBooksId,
                  title: book.title,
                  coverUrl: book.coverUrl,
                  authors: [],
                  publishedDate: null,
                }}
              />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="font-mono">{book.averageRating.toFixed(1)} ★</span>
                <span>{book.reviewCount} resenhas</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Recent activity feed ──────────────────────────────────────────────────────
function RecentActivityFeed({ reviews }: { reviews: Dashboard["recentReviews"] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border/20 pb-2">
        <MessageSquare className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-serif font-semibold text-foreground/80">Atividade Recente</h2>
      </div>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">Nenhuma atividade recente.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="backdrop-blur-glass p-4 rounded-lg shadow flex flex-col gap-2 transition-transform duration-200 hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/profile/${encodeURIComponent(review.username)}`}
                  className="text-xs font-semibold text-primary hover:underline hover:text-primary-hover transition-colors"
                >
                  {review.username}
                </Link>
                <StarRating rating={review.rating} className="scale-75 origin-right" />
              </div>
              <p className="text-xs text-muted-foreground italic border-l border-primary/20 pl-2 py-0.5">
                {'"'}{review.comment || "Sem comentário."}{'"'}
              </p>
              <Link
                href={`/books/${encodeURIComponent(review.googleBooksId)}`}
                className="text-[10px] text-right text-muted-foreground hover:text-primary transition-colors"
              >
                Ver livro &rarr;
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Fade wrapper ──────────────────────────────────────────────────────────────
function FadeIn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 280ms ease, transform 280ms ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}

// ── Main Component ────────────────────────────────────────────────────────────
export function DashboardView() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch(() => setError("Não foi possível carregar o dashboard"));
  }, []);

  if (error) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (!dashboard) return <DashboardSkeleton />;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <nav
        className="flex flex-wrap gap-1 border-b border-border/20 pb-0"
        role="tablist"
        aria-label="Seções do dashboard"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg",
                "transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                "before:absolute before:bottom-[-1px] before:left-0 before:right-0 before:h-[2px]",
                "before:transition-all before:duration-200",
                isActive
                  ? "text-primary before:bg-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40 before:bg-transparent",
              ].join(" ")}
            >
              <span className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}

      {/* Visão Geral */}
      {activeTab === "overview" && (
        <FadeIn key="overview">
          <div
            id="panel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            <div className="lg:col-span-3 space-y-12">
              <BookSection
                title="Os Mais Populares"
                icon={<TrendingUp className="h-5 w-5 text-red-500" />}
                books={dashboard.mostReviewed}
                emptyMessage="Nenhum livro popular no momento."
              />
              <BookSection
                title="Aclamação da Crítica"
                icon={<Star className="h-5 w-5 text-yellow-500" />}
                books={dashboard.topRated}
                emptyMessage="Nenhuma recomendação no momento."
              />
            </div>
            <div className="lg:col-span-1">
              <RecentActivityFeed reviews={dashboard.recentReviews} />
            </div>
          </div>
        </FadeIn>
      )}

      {/* Os Mais Populares */}
      {activeTab === "popular" && (
        <FadeIn key="popular">
          <div id="panel-popular" role="tabpanel" aria-labelledby="tab-popular">
            <BookSection
              title="Os Mais Populares"
              icon={<TrendingUp className="h-5 w-5 text-red-500" />}
              books={dashboard.mostReviewed}
              emptyMessage="Nenhum livro popular no momento."
            />
          </div>
        </FadeIn>
      )}

      {/* Aclamação da Crítica */}
      {activeTab === "acclaimed" && (
        <FadeIn key="acclaimed">
          <div id="panel-acclaimed" role="tabpanel" aria-labelledby="tab-acclaimed">
            <BookSection
              title="Aclamação da Crítica"
              icon={<Star className="h-5 w-5 text-yellow-500" />}
              books={dashboard.topRated}
              emptyMessage="Nenhuma recomendação no momento."
            />
          </div>
        </FadeIn>
      )}

      {/* Atividade Recente */}
      {activeTab === "recent" && (
        <FadeIn key="recent">
          <div
            id="panel-recent"
            role="tabpanel"
            aria-labelledby="tab-recent"
            className="max-w-xl mx-auto"
          >
            <RecentActivityFeed reviews={dashboard.recentReviews} />
          </div>
        </FadeIn>
      )}
    </div>
  );
}
