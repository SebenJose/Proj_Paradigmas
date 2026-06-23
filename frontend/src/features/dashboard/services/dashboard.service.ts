import { apiFetch } from "@/shared/lib/api-client";
import type { Dashboard } from "../types";

export function getDashboard(): Promise<Dashboard> {
  return apiFetch<Dashboard>("/api/dashboard");
}
