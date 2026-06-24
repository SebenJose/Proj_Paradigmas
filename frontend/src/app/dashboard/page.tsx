import { DashboardView } from "@/features/dashboard/components/DashboardView";
import { AuthGuard } from "@/shared/components/AuthGuard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="flex flex-1 flex-col items-center gap-6 p-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DashboardView />
      </div>
    </AuthGuard>
  );
}
