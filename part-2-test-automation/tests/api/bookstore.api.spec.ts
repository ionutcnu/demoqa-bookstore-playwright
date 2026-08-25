import { randomUUID } from 'node:crypto';
import { expect, test } from '../../src/fixtures/test-fixtures';
import type { ApiError } from '../../src/models/api-error';
import type { Book, BooksResponse } from '../../src/models/book';
import type { UserResponse } from '../../src/models/user';

test.describe('Book Store API', () => {
  test('catalog returns complete books with unique ISBNs', async ({
    bookstoreApi,
  }) => {
    const response = await bookstoreApi.getCatalog();

    expect(response.status()).toBe(200);

    const catalog = (await response.json()) as BooksResponse;
    expect(Array.isArray(catalog.books)).toBe(true);
    expect(catalog.books.length).toBeGreaterThan(0);

    for (const book of catalog.books) {
      expectRequiredBookFields(book);
    }

    const isbns = catalog.books.map((book) => book.isbn);
    expect(new Set(isbns).size).toBe(isbns.length);
  });

  test('book details match the selected catalog record', async ({
    bookstoreApi,
  }) => {
    const catalogResponse = await bookstoreApi.getCatalog();
    expect(catalogResponse.status()).toBe(200);

    const catalog = (await catalogResponse.json()) as BooksResponse;
    expect(catalog.books.length).toBeGreaterThan(0);
    const selectedBook = catalog.books[0];

    const detailResponse = await bookstoreApi.getBook(selectedBook.isbn);
    expect(detailResponse.status()).toBe(200);

    const details = (await detailResponse.json()) as Book;
    expect(details).toMatchObject({
      isbn: selectedBook.isbn,
      title: selectedBook.title,
      author: selectedBook.author,
      publisher: selectedBook.publisher,
    });
  });

  test('unknown ISBN returns a useful client error', async ({
    bookstoreApi,
  }) => {
    const response = await bookstoreApi.getBook(`invalid-${randomUUID()}`);

    expect(response.status()).toBe(400);

    const error = (await response.json()) as ApiError;
    expect(String(error.code)).toBe('1205');
    expect(error.message).toContain('ISBN');
    expect(error.message).toContain('not available');
  });

  test('authenticated user can add, retrieve, and remove one book', async ({
    accountApi,
    bookstoreApi,
    disposableUser,
  }) => {
    const catalogResponse = await bookstoreApi.getCatalog();
    expect(catalogResponse.status()).toBe(200);

    const catalog = (await catalogResponse.json()) as BooksResponse;
    expect(catalog.books.length).toBeGreaterThan(0);
    const selectedBook = catalog.books[0];

    const addResponse = await bookstoreApi.addBooks(
      disposableUser.userId,
      [selectedBook.isbn],
      disposableUser.token,
    );
    expect(addResponse.status()).toBe(201);

    const userAfterAddResponse = await accountApi.getUser(
      disposableUser.userId,
      disposableUser.token,
    );
    expect(userAfterAddResponse.status()).toBe(200);

    const userAfterAdd = (await userAfterAddResponse.json()) as UserResponse;
    expect(userAfterAdd.books.map((book) => book.isbn)).toContain(
      selectedBook.isbn,
    );

    const deleteResponse = await bookstoreApi.deleteBook(
      disposableUser.userId,
      selectedBook.isbn,
      disposableUser.token,
    );
    expect(deleteResponse.status()).toBe(204);

    const userAfterDeleteResponse = await accountApi.getUser(
      disposableUser.userId,
      disposableUser.token,
    );
    expect(userAfterDeleteResponse.status()).toBe(200);

    const userAfterDelete =
      (await userAfterDeleteResponse.json()) as UserResponse;
    expect(userAfterDelete.books.map((book) => book.isbn)).not.toContain(
      selectedBook.isbn,
    );
  });
});

function expectRequiredBookFields(book: Book): void {
  expect(book.isbn.trim()).not.toBe('');
  expect(book.title.trim()).not.toBe('');
  expect(book.author.trim()).not.toBe('');
  expect(book.publisher.trim()).not.toBe('');
  expect(book.pages).toBeGreaterThan(0);
}
