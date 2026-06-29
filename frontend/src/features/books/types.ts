export interface BookSearchResult {
  googleBooksId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  publishedDate: string | null;
}

export interface BookDetail {
  googleBooksId: string;
  title: string;
  authors: string[];
  description: string | null;
  coverUrl: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  embeddable?: boolean;
}

