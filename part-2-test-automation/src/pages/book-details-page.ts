import type { Locator, Page } from '@playwright/test';

export interface BookDetails {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
}

export class BookDetailsPage {
  readonly loginButton: Locator;
  readonly addToCollectionButton: Locator;
  readonly backToBookStoreButton: Locator;

  constructor(private readonly page: Page) {
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.addToCollectionButton = page.getByRole('button', {
      name: 'Add To Your Collection',
    });
    this.backToBookStoreButton = page.getByRole('button', {
      name: 'Back To Book Store',
    });
  }

  async waitForLoaded(): Promise<void> {
    await this.valueFor('ISBN').waitFor({ state: 'visible' });
  }

  async details(): Promise<BookDetails> {
    return {
      isbn: (await this.valueFor('ISBN').innerText()).trim(),
      title: (await this.valueFor('title').innerText()).trim(),
      author: (await this.valueFor('author').innerText()).trim(),
      publisher: (await this.valueFor('publisher').innerText()).trim(),
    };
  }

  async addToCollection(): Promise<string> {
    const dialogPromise = this.page.waitForEvent('dialog');
    await this.addToCollectionButton.click();
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    return message;
  }

  private valueFor(field: 'ISBN' | 'title' | 'author' | 'publisher'): Locator {
    return this.page.locator(`#${field}-wrapper .col-md-9`);
  }
}
