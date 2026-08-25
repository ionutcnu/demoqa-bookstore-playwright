# Test Plan: DemoQA Book Store Application

## 1. Objective

The purpose of testing is to verify that users can find books, view correct book information, log in, and manage their book collection.

The application will be tested through the web interface as a black box. No source code or internal implementation will be used.

No formal requirements were provided. Expected results are based on the visible behaviour of the application, consistency between pages, and normal expectations for a bookstore application. Unclear behaviour will be recorded as an observation until the expected result is confirmed.

## 2. Scope

Testing covers the following Book Store Application pages:

- Book Store
- Book Details
- Login
- Profile

The following user actions are included:

- Loading the book catalog
- Searching by title and author
- Opening and checking book details
- Registering a new user
- Entering invalid login details
- Logging in with a valid disposable account
- Adding a book to the collection
- Checking that the book remains after a page reload
- Removing the added book
- Checking access while logged out
- Handling empty, unusual, or invalid search input
- Checking navigation between the catalog, details, and profile
- Sorting books by title
- Handling an invalid book identifier

Additional API checks cover the documented catalog, account, and collection endpoints used by these flows.

## 3. Risks and priorities

DemoQA is a public practice application created for testing exercises. Priorities are therefore based on functional importance, dependencies between features, state complexity, and the value of each scenario for finding defects. They do not represent commercial or production impact.

### High priority

| Area | What will be checked | Reason |
|---|---|---|
| Catalog | Books load with a title, author, and publisher | Search and book-detail tests depend on the catalog |
| Search | Partial title and author searches work regardless of letter case | It is one of the main Book Store functions |
| Book details | The selected book opens and its details match the catalog | This checks data consistency between two related pages |
| Registration | A user can create an account with valid details, while invalid input is rejected | Registration is required before a new user can use authenticated features |
| Login | Missing fields and invalid credentials do not authenticate the user | Login must reject invalid input before authenticated functions are available |
| Collection | A logged-in user can add, retain, and remove a book | It checks login, stored data, page reload, removal, and cleanup |

### Medium priority

| Area | What will be checked | Reason |
|---|---|---|
| Logged-out access | A logged-out user cannot add books to a collection | It covers the logged-out state; the full collection flow is tested separately |
| Search edge cases | Empty, whitespace, and unknown searches are handled consistently | These inputs are common but do not block the whole application |
| Navigation state | Returning from a book detail page leaves the catalog and search field consistent | Incorrect state can confuse users but has a simple recovery |

### Low priority

| Area | What will be checked | Reason |
|---|---|---|
| Sorting | Books can be sorted by title in both directions | Sorting is useful but users can still browse and search without it |

## 4. Test approach

Testing will include:

- Positive scenarios for the main catalog, detail, login, and collection flows
- Positive and negative registration scenarios
- Negative scenarios for invalid credentials, unauthorized actions, and unknown data
- Edge cases for empty and whitespace input
- End-to-end checks for collection persistence and cleanup
- API checks for catalog data, error responses, authentication, and collection state
- Exploratory testing for behaviour not covered by written requirements

The main black-box techniques are:

- Equivalence partitioning for valid, invalid, matching, and non-matching inputs
- Decision-table testing for login-field combinations
- State-transition testing for logged-out, logged-in, book-added, and book-removed states
- Error guessing for whitespace input and navigation state

## 5. Test data and environment

- Application: <https://demoqa.com>
- Browser: Google Chrome
- Automation: Playwright with TypeScript
- Catalog data: Books currently available on the public site
- Registration data: A unique username and valid user details
- Authentication: A manually supplied account or an account created through the documented API for one automated test

Tests must not depend on a book's row position because the catalog may change.

The authenticated test must remove the book it adds, including when the test fails after the add step. A pre-existing account must never be deleted. An account created by automation must be deleted during teardown.

## 6. Not covered

| Area | Reason |
|---|---|
| Direct reCAPTCHA testing | reCAPTCHA is a third-party service; it will only be completed manually as part of registration |
| Delete account through the UI | Destructive and not needed to verify the selected collection flow; API deletion is used only to clean up accounts created by automation |
| Delete all books | Destructive and overlaps with the safer single-book removal test |
| Pagination across multiple pages | The current catalog contains only one page of books |
| Full API coverage | API checks are limited to the catalog, account, and collection operations used by the selected flows |
| Full security testing | The public site is not an authorized security-testing environment; only visible login and access-control behaviour will be checked |
| Performance and load testing | The public environment is shared and no performance requirements or controlled test environment are available |
| Other browsers and mobile devices | Testing is limited to the selected Chrome desktop environment |
| Advertisements and external links | They are controlled by third parties and are not part of the Book Store functions |

## 7. Execution risks

The site is public and may be slow or unavailable. Tests will wait for visible page state instead of using fixed delays. Site availability problems will be reported separately from application failures.

Advertisements may cover controls or delay loading. Tests will target Book Store elements directly and will not validate advertisement behaviour.

Catalog content may change. Tests will identify books by title or ISBN instead of row number.

Registration requires manual completion of reCAPTCHA. A unique username will be used so the result is not affected by an existing account.

A pre-existing disposable account may contain data, so only data created by the test will be removed. When automation creates a unique account, the complete account will be removed during teardown.

## 8. Completion

Testing is complete when:

- All planned high-priority scenarios have been executed.
- Negative and edge cases have been checked.
- Failed or blocked tests have been reviewed.
- Test-created collection data has been removed.
- Confirmed defects, observations, untested areas, and remaining risks have been documented.
