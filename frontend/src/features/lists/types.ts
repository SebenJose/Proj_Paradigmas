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
}

export interface CreateListRequest {
  name: string;
}

export interface AddBookToListRequest {
  googleBooksId: string;
  title: string;
  coverUrl: string | null;
}
