import { API_URL } from "@/shared/lib/env";
import { ApiError, clearToken, setToken } from "@/shared/lib/api-client";
import type { LoginCredentials } from "../schemas";
import type { AuthResponse } from "../types";

export async function login({
  username,
  password,
}: LoginCredentials): Promise<void> {
  const basicAuth = btoa(`${username}:${password}`);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${basicAuth}` },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Usuário ou senha inválidos");
  }

  const data: AuthResponse = await response.json();
  setToken(data.token);
}

export function logout(): void {
  clearToken();
}
