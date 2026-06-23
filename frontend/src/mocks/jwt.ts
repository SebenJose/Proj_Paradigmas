export function usernameFromAuthHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.slice("Bearer ".length);
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload)) as { sub?: string };
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}
