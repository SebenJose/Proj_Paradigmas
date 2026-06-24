"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks/useAuth";

export function PublicGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      setIsReady(true);
    }
  }, [isAuthenticated, router]);

  if (!isReady) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
