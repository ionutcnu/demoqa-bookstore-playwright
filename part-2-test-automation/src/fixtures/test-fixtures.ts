import { randomUUID } from 'node:crypto';
import { type APIResponse, test as base, expect } from '@playwright/test';
import { AccountApi } from '../api/account-api';
import { BookStoreApi } from '../api/bookstore-api';
import type {
  Credentials,
  DisposableUser,
  RegistrationUser,
  TokenResponse,
  UserResponse,
} from '../models/user';
import { BookDetailsPage } from '../pages/book-details-page';
import { BookStorePage } from '../pages/book-store-page';
import { LoginPage } from '../pages/login-page';
import { ProfilePage } from '../pages/profile-page';
import { RegistrationPage } from '../pages/registration-page';

interface TestFixtures {
  accountApi: AccountApi;
  bookstoreApi: BookStoreApi;
  disposableUser: DisposableUser;
  bookDetailsPage: BookDetailsPage;
  bookStorePage: BookStorePage;
  loginPage: LoginPage;
  profilePage: ProfilePage;
  registrationPage: RegistrationPage;
  registrationUser: RegistrationUser;
}

export const test = base.extend<TestFixtures>({
  accountApi: async ({ request }, use) => {
    await use(new AccountApi(request));
  },

  bookstoreApi: async ({ request }, use) => {
    await use(new BookStoreApi(request));
  },

  bookDetailsPage: async ({ page }, use) => {
    await use(new BookDetailsPage(page));
  },

  bookStorePage: async ({ page }, use) => {
    await use(new BookStorePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },

  registrationUser: async ({ accountApi }, use) => {
    const suffix = uniqueSuffix();
    const registrationUser: RegistrationUser = {
      firstName: 'QA',
      lastName: 'Automation',
      credentials: {
        userName: `qa_reg_${suffix}`,
        password: `Qa1!${suffix}x`,
      },
    };

    await use(registrationUser);

    if (registrationUser.userId) {
      await deleteCreatedUser(
        accountApi,
        registrationUser.userId,
        registrationUser.credentials,
      );
    }
  },

  disposableUser: async ({ accountApi }, use) => {
    const suffix = uniqueSuffix();
    const credentials = {
      userName: `qa_${suffix}`,
      password: `Qa1!${suffix}x`,
    };

    const createResponse = await accountApi.createUser(credentials);
    if (createResponse.status() !== 201) {
      throw await responseError('Create disposable user', createResponse);
    }

    const createdUser = (await createResponse.json()) as UserResponse;
    const disposableUser: DisposableUser = {
      credentials,
      userId: createdUser.userID,
      token: '',
    };

    try {
      disposableUser.token = await generatedToken(
        'Generate disposable-user token',
        await accountApi.generateToken(credentials),
      );
      await use(disposableUser);
    } finally {
      await deleteCreatedUser(
        accountApi,
        disposableUser.userId,
        disposableUser.credentials,
      );
    }
  },
});

export { expect };

function uniqueSuffix(): string {
  return randomUUID().replaceAll('-', '').slice(0, 12);
}

async function deleteCreatedUser(
  accountApi: AccountApi,
  userId: string,
  credentials: Credentials,
): Promise<void> {
  const cleanupToken = await generatedToken(
    'Generate cleanup token',
    await accountApi.generateToken(credentials),
  );
  const deleteResponse = await accountApi.deleteUser(userId, cleanupToken);

  if (!deleteResponse.ok()) {
    throw await responseError('Delete disposable user', deleteResponse);
  }

  const verificationResponse = await accountApi.getUser(userId, cleanupToken);
  if (verificationResponse.status() === 200) {
    throw new Error('Delete disposable user failed: user still exists');
  }
}

async function generatedToken(
  operation: string,
  response: APIResponse,
): Promise<string> {
  if (response.status() !== 200) {
    throw await responseError(operation, response);
  }

  const tokenBody = (await response.json()) as TokenResponse;
  if (tokenBody.status !== 'Success' || !tokenBody.token) {
    throw new Error(`${operation} failed: ${tokenBody.result}`);
  }

  return tokenBody.token;
}

async function responseError(
  operation: string,
  response: APIResponse,
): Promise<Error> {
  return new Error(
    `${operation} failed with HTTP ${response.status()}: ${await response.text()}`,
  );
}
