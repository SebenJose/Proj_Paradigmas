import { BookDetailView } from "@/features/books/components/BookDetailView";
import { AuthGuard } from "@/shared/components/AuthGuard";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ googleBooksId: string }>;
}) {
  const { googleBooksId } = await params;

  return (
    <AuthGuard>
      <div className="flex flex-1 justify-center p-8">
        <BookDetailView googleBooksId={googleBooksId} />
      </div>
    </AuthGuard>
  );
}
