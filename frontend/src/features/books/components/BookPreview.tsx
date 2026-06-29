"use client";

import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    google?: {
      books?: {
        load: () => void;
        setOnLoadCallback: (callback: () => void) => void;
        DefaultViewer: new (element: HTMLElement | null) => {
          load: (
            identifiers: string | string[],
            notFoundCallback?: () => void,
            successCallback?: () => void
          ) => void;
        };
      };
    };
  }
}

interface BookPreviewProps {
  googleBooksId: string;
}

export function BookPreview({ googleBooksId }: BookPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const initializeViewer = () => {
      if (!active) return;

      const google = window.google;
      if (!google || !google.books) {
        setError("API do Google Books não disponível.");
        setIsLoading(false);
        return;
      }

      const books = google.books;

      try {
        books.load();
      } catch (err) {
        console.error("Erro ao chamar google.books.load():", err);
      }

      books.setOnLoadCallback(() => {
        if (!active) return;

        try {
          const container = canvasRef.current;
          if (!container) {
            setError("Elemento de visualização não encontrado.");
            setIsLoading(false);
            return;
          }

          const viewer = new books.DefaultViewer(container);

          viewer.load(
            googleBooksId,
            () => {
              if (active) {
                setError("Pré-visualização do livro não encontrada ou indisponível.");
                setIsLoading(false);
              }
            },
            () => {
              if (active) {
                setIsLoading(false);
              }
            }
          );
        } catch (err) {
          console.error("Erro ao inicializar o DefaultViewer:", err);
          if (active) {
            setError("Falha ao inicializar a visualização.");
            setIsLoading(false);
          }
        }
      });
    };

    // Load Google Books JSAPI script if it's not present
    const scriptId = "google-books-api-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.google.com/books/jsapi.js";
      script.type = "text/javascript";
      script.async = true;

      script.onload = () => {
        // Poll to wait for window.google.books to be fully populated
        const pollGoogleBooks = () => {
          if (window.google?.books) {
            initializeViewer();
          } else {
            if (active) {
              setTimeout(pollGoogleBooks, 50);
            }
          }
        };
        pollGoogleBooks();
      };

      script.onerror = () => {
        if (active) {
          setError("Falha ao carregar o script do Google Books.");
          setIsLoading(false);
        }
      };

      document.body.appendChild(script);
    } else {
      // Script is already loaded/loading.
      // Poll to check when window.google.books is available.
      const pollGoogleBooks = () => {
        if (window.google?.books) {
          initializeViewer();
        } else {
          if (active) {
            setTimeout(pollGoogleBooks, 50);
          }
        }
      };
      pollGoogleBooks();
    }

    return () => {
      active = false;
    };
  }, [googleBooksId]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-border bg-card">
      {/* 600px tall div for Google Books Viewer */}
      <div 
        ref={canvasRef} 
        style={{ height: "600px" }} 
        className="w-full bg-muted/20"
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Carregando visualização...</p>
        </div>
      )}

      {/* Error State Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-destructive/10 backdrop-blur-sm border-t border-destructive/20 text-center">
          <div className="max-w-md bg-background border border-destructive/20 rounded-xl p-6 shadow-lg">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
