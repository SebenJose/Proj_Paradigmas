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
  { id: "overview",  label: "Visão Geral",          icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "popular",   label: "Os Mais Populares",     icon: <TrendingUp       className="h-4 w-4" /> },
  { id: "acclaimed", label: "Aclamação da Crítica",  icon: <Star             className="h-4 w-4" /> },
  { id: "recent",    label: "Atividade Recente",     icon: <MessageSquare    className="h-4 w-4" /> },
];

// ── Skeleton ───────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-10 animate-pulse">
      <div className="flex gap-2 border-b border-border/20 pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-36 rounded-full bg-muted/60" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] w-full bg-muted/60 rounded-md" />
        ))}
      </div>
    </div>
  );
}

// ── Book card with hover stats ─────────────────────────────────────────────────
function BookEntry({
  book,
}: {
  book: Dashboard["topRated"][number];
}) {
  return (
    <div className="flex flex-col gap-1 group">
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
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border/20 pb-2">
      {icon}
      <h2 className="text-xl font-serif font-semibold text-foreground/80">{title}</h2>
    </div>
  );
}

// ── Book grid — catalog mode (all books, larger grid) ─────────────────────────
function CatalogGrid({
  books,
  emptyMessage,
}: {
  books: Dashboard["topRated"];
  emptyMessage: string;
}) {
  if (books.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-12 text-center">{emptyMessage}</p>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {books.map((book) => (
        <BookEntry key={book.googleBooksId} book={book} />
      ))}
    </div>
  );
}

// ── Book grid — overview mode (limited, compact) ───────────────────────────────
function OverviewGrid({
  books,
  emptyMessage,
  limit = 4,
}: {
  books: Dashboard["topRated"];
  emptyMessage: string;
  limit?: number;
}) {
  const slice = books.slice(0, limit);
  if (slice.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4 text-center">{emptyMessage}</p>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {slice.map((book) => (
        <BookEntry key={book.googleBooksId} book={book} />
      ))}
    </div>
  );
}

// ── Recent activity feed ───────────────────────────────────────────────────────
function RecentActivityFeed({
  reviews,
  compact = false,
}: {
  reviews: Dashboard["recentReviews"];
  compact?: boolean;
}) {
  const list = compact ? reviews.slice(0, 5) : reviews;

  if (list.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-6 text-center">
        Nenhuma atividade recente.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-3" : "space-y-4 max-w-2xl mx-auto"}>
      {list.map((review) => (
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
  );
}

// ── Fade wrapper ───────────────────────────────────────────────────────────────
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

// ── Main Component ─────────────────────────────────────────────────────────────
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
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <nav
        className="flex flex-wrap gap-1 border-b border-border/20"
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

      {/* ── Tab Panels ───────────────────────────────────────────────────── */}

      {/* Visão Geral — compact overview */}
      {activeTab === "overview" && (
        <FadeIn key="overview">
          <div
            id="panel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            className="grid grid-cols-1 lg:grid-cols-4 gap-10"
          >
            <div className="lg:col-span-3 space-y-10">
              <section className="space-y-4">
                <SectionHeader
                  icon={<TrendingUp className="h-5 w-5 text-red-500" />}
                  title="Os Mais Populares"
                />
                <OverviewGrid
                  books={dashboard.mostReviewed}
                  emptyMessage="Nenhum livro popular no momento."
                />
              </section>

              <section className="space-y-4">
                <SectionHeader
                  icon={<Star className="h-5 w-5 text-yellow-500" />}
                  title="Aclamação da Crítica"
                />
                <OverviewGrid
                  books={dashboard.topRated}
                  emptyMessage="Nenhuma recomendação no momento."
                />
              </section>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <SectionHeader
                icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
                title="Atividade Recente"
              />
              <RecentActivityFeed reviews={dashboard.recentReviews} compact />
            </div>
          </div>
        </FadeIn>
      )}

      {/* Os Mais Populares — full catalog */}
      {activeTab === "popular" && (
        <FadeIn key="popular">
          <div id="panel-popular" role="tabpanel" aria-labelledby="tab-popular" className="space-y-6">
            <SectionHeader
              icon={<TrendingUp className="h-5 w-5 text-red-500" />}
              title={`Os Mais Populares (${dashboard.mostReviewed.length})`}
            />
            <CatalogGrid
              books={dashboard.mostReviewed}
              emptyMessage="Nenhum livro popular no momento."
            />
          </div>
        </FadeIn>
      )}

      {/* Aclamação da Crítica — full catalog */}
      {activeTab === "acclaimed" && (
        <FadeIn key="acclaimed">
          <div id="panel-acclaimed" role="tabpanel" aria-labelledby="tab-acclaimed" className="space-y-6">
            <SectionHeader
              icon={<Star className="h-5 w-5 text-yellow-500" />}
              title={`Aclamação da Crítica (${dashboard.topRated.length})`}
            />
            <CatalogGrid
              books={dashboard.topRated}
              emptyMessage="Nenhuma recomendação no momento."
            />
          </div>
        </FadeIn>
      )}

      {/* Atividade Recente — full feed */}
      {activeTab === "recent" && (
        <FadeIn key="recent">
          <div id="panel-recent" role="tabpanel" aria-labelledby="tab-recent" className="space-y-6">
            <SectionHeader
              icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
              title={`Atividade Recente (${dashboard.recentReviews.length})`}
            />
            <RecentActivityFeed reviews={dashboard.recentReviews} />
          </div>
        </FadeIn>
      )}
    </div>
  );
}
