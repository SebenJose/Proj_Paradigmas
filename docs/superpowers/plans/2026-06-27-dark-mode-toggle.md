# Dark Mode Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a client-side theme provider and a toggle button in the NavBar to switch between Light and Dark modes.

**Architecture:** Use a custom React Context Provider (`ThemeProvider`) to persist and apply the selected theme. Integrate it into `layout.tsx` and place a toggle button using Lucide icons in `NavBar.tsx`.

**Tech Stack:** React Context, Next.js App Router, Tailwind CSS v4, Lucide Icons.

---

### Task 1: Create ThemeProvider Component

**Files:**
- Create: `frontend/src/shared/providers/ThemeProvider.tsx`

- [ ] **Step 1: Implement the ThemeProvider**
  Create the file `frontend/src/shared/providers/ThemeProvider.tsx` with the following content:

  ```tsx
  "use client";

  import React, { createContext, useContext, useEffect, useState } from "react";

  type Theme = "light" | "dark";

  interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
  }

  const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

  export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted) return;
      
      const root = window.document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    function toggleTheme() {
      setTheme((prev) => (prev === "light" ? "dark" : "light"));
    }

    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
      throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
  }
  ```

- [ ] **Step 2: Verify compilation and lints**
  Run: `npm run lint` inside `frontend` directory.
  Expected: Command finishes successfully with no TypeScript/ESLint errors in `ThemeProvider.tsx`.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add frontend/src/shared/providers/ThemeProvider.tsx
  git commit -m "feat: add ThemeProvider context and useTheme hook"
  ```

---

### Task 2: Integrate ThemeProvider in RootLayout

**Files:**
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Wrap layout with ThemeProvider**
  Modify `frontend/src/app/layout.tsx` to import and wrap the layout body with `<ThemeProvider>`.
  
  Updated code block:
  ```tsx
  import type { Metadata } from "next";
  import { Geist, Geist_Mono } from "next/font/google";
  import { MockProvider } from "@/mocks/MockProvider";
  import { NavBar } from "@/shared/components/NavBar";
  import { ThemeProvider } from "@/shared/providers/ThemeProvider";
  import "./globals.css";

  const geistSans = Geist({
    variable: "--font-sans",
    subsets: ["latin"],
  });

  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

  export const metadata: Metadata = {
    title: "Proj Paradigmas",
    description: "Trabalho final - Paradigmas de Linguagens de Programação",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider>
            <NavBar />
            <MockProvider>{children}</MockProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  }
  ```

- [ ] **Step 2: Verify compilation and lints**
  Run: `npm run lint` inside `frontend` directory.
  Expected: Command finishes successfully with no TypeScript/ESLint errors in `layout.tsx`.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add frontend/src/app/layout.tsx
  git commit -m "feat: wrap RootLayout with ThemeProvider"
  ```

---

### Task 3: Add Theme Toggle Button in NavBar

**Files:**
- Modify: `frontend/src/shared/components/NavBar.tsx`

- [ ] **Step 1: Implement the Toggle Button**
  Modify `frontend/src/shared/components/NavBar.tsx` to include `useTheme` and a toggle button next to the Login/Logout actions.

  Updated `NavBar.tsx` code:
  ```tsx
  "use client";

  import { useState, useEffect } from "react";
  import Link from "next/link";
  import { usePathname, useRouter } from "next/navigation";
  import { useAuth } from "@/shared/hooks/useAuth";
  import { logout } from "@/features/auth";
  import { Button } from "@/shared/components/ui/button";
  import { useTheme } from "@/shared/providers/ThemeProvider";
  import { BookOpen, LayoutDashboard, Library, LogOut, UserCircle2, Sun, Moon } from "lucide-react";

  const authLinks = [
    { href: "/books", label: "Explorar", icon: BookOpen },
    { href: "/lists", label: "Minhas Listas", icon: Library },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  export function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    function handleLogout() {
      logout();
      router.push("/login");
    }

    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md px-6 py-4 transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="rounded-xl bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight font-serif text-foreground">
                Paradigmas<span className="text-primary">.</span>
              </span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {authLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {mounted ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full w-9 h-9 p-0 text-muted-foreground hover:text-foreground active-press"
                aria-label="Alternar tema"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 transition-all" />
                ) : (
                  <Moon className="h-4 w-4 transition-all" />
                )}
              </Button>
            ) : (
              <div className="w-9 h-9" />
            )}

            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : (
              <Link href="/login">
                <Button size="sm" className="rounded-full px-6 font-medium shadow-sm transition-transform hover:scale-105">
                  <UserCircle2 className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }
  ```

- [ ] **Step 2: Verify compilation, lints, and functionality**
  Run: `npm run dev` inside `frontend` directory, open the app in browser, click the theme button, and verify dark mode transitions correctly. Also run `npm run lint`.
  Expected: Site changes themes smoothly, preference persists in `localStorage` on page reload.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add frontend/src/shared/components/NavBar.tsx
  git commit -m "feat: add theme toggle button to NavBar"
  ```
