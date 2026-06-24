import { LoginForm } from "@/features/auth";
import { PublicGuard } from "@/shared/components/PublicGuard";

export default function LoginPage() {
  return (
    <PublicGuard>
      <div className="flex flex-1 items-center justify-center p-8">
        <LoginForm />
      </div>
    </PublicGuard>
  );
}
