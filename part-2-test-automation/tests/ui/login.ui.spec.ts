import { expect, test } from '../../src/fixtures/test-fixtures';

test.describe('Login UI', () => {
  test('required fields and invalid credentials do not authenticate the user', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();

    await loginPage.submit();
    await expect(loginPage.usernameInput).toHaveClass(/is-invalid/);
    await expect(loginPage.passwordInput).toHaveClass(/is-invalid/);

    await loginPage.usernameInput.fill('definitely_invalid_qa_user');
    await loginPage.submit();
    await expect(loginPage.passwordInput).toHaveClass(/is-invalid/);

    await loginPage.passwordInput.fill('Invalid1!Password');
    await loginPage.submit();

    await expect(loginPage.errorMessage).toHaveText(
      'Invalid username or password!',
    );
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
