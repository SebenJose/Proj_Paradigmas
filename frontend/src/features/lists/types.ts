export interface BookSummary {
  id: number;
  googleBooksId: string;
  title: string;
  coverUrl: string | null;
}

export interface BookList {
  id: number;
  name: string;
  books: BookSummary[];
  isPrivate: boolean;
}

export interface CreateListRequest {
  name: string;
  isPrivate: boolean;
}

export interface AddBookToListRequest {
  googleBooksId: string;
  title: string;
  coverUrl: string | null;
}
