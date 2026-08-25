import type { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly usernameValue: Locator;
  readonly table: Locator;
  readonly dataRows: Locator;

  constructor(private readonly page: Page) {
    this.usernameValue = page.locator('#userName-value');
    this.table = page.getByRole('table');
    this.dataRows = this.table.locator('tbody').getByRole('row');
  }

  async open(): Promise<void> {
    await this.page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await this.usernameValue.waitFor({ state: 'visible' });
  }

  bookRow(title: string): Locator {
    return this.dataRows.filter({
      has: this.page.getByRole('link', { name: title, exact: true }),
    });
  }

  async deleteBook(title: string): Promise<string> {
    const row = this.bookRow(title);
    await row.locator('[title="Delete"]').click();

    const confirmButton = this.page.locator('#closeSmallModal-ok');
    await confirmButton.waitFor({ state: 'visible' });

    const dialogPromise = this.page.waitForEvent('dialog');
    await confirmButton.click();
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    return message;
  }

  async cancelDelete(title: string): Promise<void> {
    const row = this.bookRow(title);
    await row.locator('[title="Delete"]').click();

    const cancelButton = this.page.locator('#closeSmallModal-cancel');
    await cancelButton.waitFor({ state: 'visible' });
    await cancelButton.click();
    await cancelButton.waitFor({ state: 'hidden' });
  }
}
