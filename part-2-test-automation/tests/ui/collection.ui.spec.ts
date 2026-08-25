import { expect, test } from '../../src/fixtures/test-fixtures';

test.describe('Collection UI', () => {
  test('user can add, retain, and remove one book', async ({
    bookDetailsPage,
    bookStorePage,
    disposableUser,
    loginPage,
    page,
    profilePage,
  }) => {
    await loginPage.open();
    await loginPage.login(disposableUser.credentials);
    await expect(profilePage.usernameValue).toHaveText(
      disposableUser.credentials.userName,
    );

    await bookStorePage.open();
    await expect(bookStorePage.dataRows.first()).toBeVisible();
    const [selectedBook] = await bookStorePage.visibleBooks();
    expect(selectedBook).toBeDefined();

    await bookStorePage.openBook(selectedBook.title);
    await bookDetailsPage.waitForLoaded();
    expect(await bookDetailsPage.addToCollection()).toBe(
      'Book added to your collection.',
    );

    await profilePage.open();
    await expect(profilePage.bookRow(selectedBook.title)).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(profilePage.bookRow(selectedBook.title)).toBeVisible();

    expect(await profilePage.deleteBook(selectedBook.title)).toBe(
      'Book deleted.',
    );
    await expect(profilePage.bookRow(selectedBook.title)).toHaveCount(0);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(profilePage.bookRow(selectedBook.title)).toHaveCount(0);
  });
});
