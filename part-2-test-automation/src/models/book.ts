export interface Book {
  isbn: string;
  title: string;
  subTitle: string;
  author: string;
  publish_date: string;
  publisher: string;
  pages: number;
  description: string;
  website: string;
}

export interface BooksResponse {
  books: Book[];
}

export interface AddBooksRequest {
  userId: string;
  collectionOfIsbns: Array<{ isbn: string }>;
}

export interface DeleteBookRequest {
  isbn: string;
  userId: string;
}
