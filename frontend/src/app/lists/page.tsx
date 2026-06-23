import { ListsView } from "@/features/lists/components/ListsView";

export default function ListsPage() {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Minhas listas</h1>
      <ListsView />
    </div>
  );
}
