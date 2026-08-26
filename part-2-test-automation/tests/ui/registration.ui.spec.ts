import { expect, test } from '../../src/fixtures/test-fixtures';
import type { UserResponse } from '../../src/models/user';

test.describe('Registration UI', () => {
  test('required fields and a weak password are rejected', async ({
    page,
    registrationPage,
    registrationUser,
  }) => {
    await registrationPage.open();

    await registrationPage.submit();
    await expect(registrationPage.firstNameInput).toHaveClass(/is-invalid/);
    await expect(registrationPage.lastNameInput).toHaveClass(/is-invalid/);
    await expect(registrationPage.usernameInput).toHaveClass(/is-invalid/);
    await expect(registrationPage.passwordInput).toHaveClass(/is-invalid/);

    await registrationPage.fill({
      ...registrationUser,
      credentials: {
        ...registrationUser.credentials,
        password: 'weak',
      },
    });

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/Account/v1/User') &&
        response.request().method() === 'POST',
    );
    await registrationPage.submit();
    const response = await responsePromise;

    expect(response.status()).toBe(400);
    await expect(registrationPage.errorMessage).toContainText(
      'Passwords must have',
    );
  });

  test('user can register and log in', async ({
    loginPage,
    page,
    profilePage,
    registrationPage,
    registrationUser,
  }) => {
    await registrationPage.open();
    await registrationPage.fill(registrationUser);

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/Account/v1/User') &&
        response.request().method() === 'POST',
    );
    const dialogPromise = page.waitForEvent('dialog');

    await registrationPage.submit();

    const dialog = await dialogPromise;
    const dialogMessage = dialog.message();
    await dialog.accept();

    const response = await responsePromise;
    const createdUser = (await response.json()) as Partial<UserResponse>;
    registrationUser.userId = createdUser.userID;

    expect(response.status()).toBe(201);
    expect(createdUser.username).toBe(registrationUser.credentials.userName);
    expect(registrationUser.userId).toBeDefined();
    expect(dialogMessage).toBe('User Registered Successfully.');

    await loginPage.open();
    await loginPage.login(registrationUser.credentials);
    await expect(profilePage.usernameValue).toHaveText(
      registrationUser.credentials.userName,
    );
  });
});
