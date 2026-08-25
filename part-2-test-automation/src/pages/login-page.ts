import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '../models/user';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('#userName');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('#name');
  }

  async open(): Promise<void> {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await this.loginButton.waitFor({ state: 'visible' });
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.userName);
    await this.passwordInput.fill(credentials.password);
    await this.submit();
    await this.page.waitForURL(/\/profile$/);
  }
}
