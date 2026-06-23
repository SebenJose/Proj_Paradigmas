import { BookDetailView } from "@/features/books/components/BookDetailView";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ googleBooksId: string }>;
}) {
  const { googleBooksId } = await params;

  return (
    <div className="flex flex-1 justify-center p-8">
      <BookDetailView googleBooksId={googleBooksId} />
    </div>
  );
}
