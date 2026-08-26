import type { Locator, Page } from '@playwright/test';
import type { RegistrationUser } from '../models/user';

export class RegistrationPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly registerButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.usernameInput = page.getByRole('textbox', { name: 'UserName' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.errorMessage = page.locator('#name');
  }

  async open(): Promise<void> {
    await this.page.route(
      /^https:\/\/www\.google\.com\/recaptcha\/api\.js/,
      (route) => {
        route.fulfill({
          contentType: 'application/javascript',
          body: `
          if (!window.__demoqaRecaptchaStub) {
            window.__demoqaRecaptchaStub = { executions: 0 };
          }
          window.grecaptcha = (() => {
            const stubbedToken = 'demoqa-stubbed-recaptcha-token';
            const api = {
              ready: (callback) => {
                if (typeof callback === 'function') {
                  callback();
                }
                return api;
              },
              render: () => 'stubbed-widget-id',
              execute: () => {
                window.__demoqaRecaptchaStub.executions += 1;
                return window.__demoqaRecaptchaStub.executions === 1
                  ? Promise.resolve(stubbedToken)
                  : new Promise(() => {});
              },
              getResponse: () => stubbedToken,
              reset: () => {},
            };
            return api;
          })();
          if (typeof window.onRecaptchaLoadCallback === 'function') {
            window.onRecaptchaLoadCallback();
          }
        `,
        });
      },
    );
    await this.page.goto('/register', { waitUntil: 'domcontentloaded' });
    await this.registerButton.waitFor({ state: 'visible' });
  }

  async fill(user: RegistrationUser): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.usernameInput.fill(user.credentials.userName);
    await this.passwordInput.fill(user.credentials.password);
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }
}
