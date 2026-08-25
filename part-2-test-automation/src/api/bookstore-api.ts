import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { AddBooksRequest, DeleteBookRequest } from '../models/book';

export class BookStoreApi {
  constructor(private readonly request: APIRequestContext) {}

  getCatalog(): Promise<APIResponse> {
    return this.request.get('/BookStore/v1/Books');
  }

  getBook(isbn: string): Promise<APIResponse> {
    return this.request.get('/BookStore/v1/Book', {
      params: { ISBN: isbn },
    });
  }

  addBooks(
    userId: string,
    isbns: string[],
    token: string,
  ): Promise<APIResponse> {
    const data: AddBooksRequest = {
      userId,
      collectionOfIsbns: isbns.map((isbn) => ({ isbn })),
    };

    return this.request.post('/BookStore/v1/Books', {
      headers: this.authorizationHeader(token),
      data,
    });
  }

  deleteBook(
    userId: string,
    isbn: string,
    token: string,
  ): Promise<APIResponse> {
    const data: DeleteBookRequest = {
      isbn,
      userId,
    };

    return this.request.delete('/BookStore/v1/Book', {
      headers: this.authorizationHeader(token),
      data,
    });
  }

  private authorizationHeader(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}
