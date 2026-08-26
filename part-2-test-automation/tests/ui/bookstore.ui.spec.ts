import { expect, test } from '../../src/fixtures/test-fixtures';
import type { CatalogBook } from '../../src/pages/book-store-page';

test.describe('Book Store UI', () => {
  test('catalog displays complete book records with usable title links', async ({
    bookStorePage,
  }) => {
    await bookStorePage.open();
    await expect(bookStorePage.dataRows.first()).toBeVisible();

    const books = await bookStorePage.visibleBooks();
    expect(books.length).toBeGreaterThan(0);

    for (const book of books) {
      expect(book.title).not.toBe('');
      expect(book.author).not.toBe('');
      expect(book.publisher).not.toBe('');
      expect(book.isbn).toMatch(/^\d{13}$/);
    }
  });

  test('search matches partial title and author regardless of case', async ({
    bookStorePage,
  }) => {
    await bookStorePage.open();
    await expect(bookStorePage.dataRows.first()).toBeVisible();

    const catalog = await bookStorePage.visibleBooks();
    const target = catalog.find(
      (book) =>
        longestWord(book.title).length >= 5 &&
        longestWord(book.author).length >= 5,
    );
    if (!target) {
      throw new Error('Catalog needs a book with searchable title and author');
    }

    const titleTerm = mixedCase(partialWord(longestWord(target.title)));
    await bookStorePage.search(titleTerm);
    await expect(bookStorePage.dataRows.first()).toBeVisible();
    const titleResults = await bookStorePage.visibleBooks();
    expect(titleResults.map((book) => book.title)).toContain(target.title);
    expectEveryResultContains(titleResults, 'title', titleTerm);

    const authorTerm = mixedCase(partialWord(longestWord(target.author)));
    await bookStorePage.search(authorTerm);
    await expect(bookStorePage.dataRows.first()).toBeVisible();
    const authorResults = await bookStorePage.visibleBooks();
    expect(authorResults.map((book) => book.title)).toContain(target.title);
    expectEveryResultContains(authorResults, 'author', authorTerm);
  });

  test('book details match the selected catalog record', async ({
    bookDetailsPage,
    bookStorePage,
  }) => {
    await bookStorePage.open();
    await expect(bookStorePage.dataRows.first()).toBeVisible();

    const [selectedBook] = await bookStorePage.visibleBooks();
    expect(selectedBook).toBeDefined();

    await bookStorePage.openBook(selectedBook.title);
    await bookDetailsPage.waitForLoaded();
    const details = await bookDetailsPage.details();

    expect(details).toEqual({
      isbn: selectedBook.isbn,
      title: selectedBook.title,
      author: selectedBook.author,
      publisher: selectedBook.publisher,
    });
  });

  test('logged-out user cannot add a book to a collection', async ({
    bookDetailsPage,
    bookStorePage,
  }) => {
    await bookStorePage.open();
    await expect(bookStorePage.dataRows.first()).toBeVisible();

    const [selectedBook] = await bookStorePage.visibleBooks();
    expect(selectedBook).toBeDefined();

    await bookStorePage.openBook(selectedBook.title);
    await bookDetailsPage.waitForLoaded();

    await expect(bookDetailsPage.loginButton).toBeVisible();
    await expect(bookDetailsPage.addToCollectionButton).toHaveCount(0);
  });
});

function longestWord(value: string): string {
  return (
    value
      .split(/\s+/)
      .map((word) => word.replace(/[^a-z]/gi, ''))
      .sort((left, right) => right.length - left.length)[0] ?? ''
  );
}

function partialWord(word: string): string {
  return word.length > 2 ? word.slice(1, -1) : word;
}

function mixedCase(value: string): string {
  return [...value]
    .map((character, index) =>
      index % 2 === 0 ? character.toLowerCase() : character.toUpperCase(),
    )
    .join('');
}

function expectEveryResultContains(
  books: CatalogBook[],
  field: 'title' | 'author',
  term: string,
): void {
  expect(books.length).toBeGreaterThan(0);
  for (const book of books) {
    expect(book[field].toLowerCase()).toContain(term.toLowerCase());
  }
}
