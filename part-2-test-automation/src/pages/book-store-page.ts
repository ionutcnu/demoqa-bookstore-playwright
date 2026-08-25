import type { Locator, Page } from '@playwright/test';

export interface CatalogBook {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
}

export class BookStorePage {
  readonly searchInput: Locator;
  readonly table: Locator;
  readonly dataRows: Locator;
  readonly loginButton: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByPlaceholder('Type to search');
    this.table = page.getByRole('table');
    this.dataRows = this.table.locator('tbody').getByRole('row');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
  }

  async open(): Promise<void> {
    const catalogResponse = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/BookStore/v1/Books',
    );

    await this.page.goto('/books', { waitUntil: 'domcontentloaded' });
    await catalogResponse;
    await this.table.waitFor({ state: 'visible' });
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }

  bookRow(title: string): Locator {
    return this.dataRows.filter({
      has: this.page.getByRole('link', { name: title, exact: true }),
    });
  }

  async openBook(title: string): Promise<void> {
    await this.bookRow(title)
      .getByRole('link', { name: title, exact: true })
      .click();
  }

  async visibleBooks(): Promise<CatalogBook[]> {
    const books: CatalogBook[] = [];
    const rowCount = await this.dataRows.count();

    for (let index = 0; index < rowCount; index += 1) {
      const row = this.dataRows.nth(index);
      const cells = row.getByRole('cell');
      const titleLink = cells.nth(1).getByRole('link');
      const href = await titleLink.getAttribute('href');
      const isbn = href
        ? new URL(href, this.page.url()).searchParams.get('search')
        : null;

      books.push({
        title: (await titleLink.innerText()).trim(),
        author: (await cells.nth(2).innerText()).trim(),
        publisher: (await cells.nth(3).innerText()).trim(),
        isbn: isbn ?? '',
      });
    }

    return books;
  }
}
