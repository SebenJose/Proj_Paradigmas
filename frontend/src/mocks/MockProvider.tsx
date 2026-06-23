"use client";

import { useEffect, useState } from "react";
import { API_MOCKING_ENABLED } from "@/shared/lib/env";

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!API_MOCKING_ENABLED);

  useEffect(() => {
    if (!API_MOCKING_ENABLED) return;

    import("./browser").then(({ worker }) => {
      worker
        .start({ onUnhandledRequest: "bypass" })
        .finally(() => setReady(true));
    });
  }, []);

  if (!ready) return null;

  return children;
}
