import { RegisterForm } from "@/features/auth";
import { PublicGuard } from "@/shared/components/PublicGuard";

export default function RegisterPage() {
  return (
    <PublicGuard>
      <div className="flex flex-1 items-center justify-center p-8">
        <RegisterForm />
      </div>
    </PublicGuard>
  );
}
