import { API_URL } from "@/shared/lib/env";
import { apiFetch, ApiError, clearToken, setToken } from "@/shared/lib/api-client";
import type { LoginCredentials, RegisterData } from "../schemas";
import type { AuthResponse } from "../types";

export async function login({
  username,
  password,
}: LoginCredentials): Promise<void> {
  const basicAuth = btoa(`${username}:${password}`);

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${basicAuth}` },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Usuário ou senha inválidos");
  }

  const data: AuthResponse = await response.json();
  setToken(data.token);
}

export async function register(data: RegisterData): Promise<void> {
  await apiFetch<void>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  await login({ username: data.username, password: data.password });
}

export function logout(): void {
  clearToken();
}
