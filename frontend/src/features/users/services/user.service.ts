import { apiFetch } from "@/shared/lib/api-client";
import type { UserProfile } from "../types";

export function getUserProfile(username: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/api/users/${encodeURIComponent(username)}/profile`);
}
