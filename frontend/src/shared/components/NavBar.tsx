"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getToken, TOKEN_CHANGE_EVENT } from "@/shared/lib/api-client";
import { logout } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Buscar" },
  { href: "/lists", label: "Listas" },
  { href: "/dashboard", label: "Dashboard" },
];

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

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    subscribeToTokenChange,
    getIsAuthenticatedSnapshot,
    getServerSnapshot,
  );

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between gap-4 border-b px-6 py-3">
      <div className="flex items-center gap-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "text-sm font-medium underline"
                : "text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>

      {isAuthenticated ? (
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sair
        </Button>
      ) : (
        <Link href="/login" className="text-sm font-medium underline">
          Entrar
        </Link>
      )}
    </nav>
  );
}
