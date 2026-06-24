import { useSyncExternalStore } from "react";
import { getToken, TOKEN_CHANGE_EVENT } from "@/shared/lib/api-client";

function subscribeToTokenChange(callback: () => void) {
  window.addEventListener(TOKEN_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(TOKEN_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getIsAuthenticatedSnapshot() {
  return getToken() !== null;
}

function getServerSnapshot() {
  return false;
}

export function useAuth() {
  const isAuthenticated = useSyncExternalStore(
    subscribeToTokenChange,
    getIsAuthenticatedSnapshot,
    getServerSnapshot,
  );

  return { isAuthenticated };
}
