import { BookSearchView } from "@/features/books/components/BookSearchView";
import { AuthGuard } from "@/shared/components/AuthGuard";

export default function BooksPage() {
  return (
    <AuthGuard>
      <div className="flex flex-1 flex-col items-center gap-6 p-8">
        <h1 className="text-2xl font-semibold">Buscar livros</h1>
        <BookSearchView />
      </div>
    </AuthGuard>
  );
}
