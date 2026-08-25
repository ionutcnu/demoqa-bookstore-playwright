# Test Plan: DemoQA Book Store

## 1. What we test

The Book Store app must let a user:

- find books by title or author
- see correct book details
- log in with valid credentials
- add and remove books from a personal collection

We test the public site at <https://demoqa.com> through the browser and its API.

No requirements document was provided. Expected results come from how the site
actually behaves. When the behavior is unclear, we record it as an observation
instead of guessing.

## 2. Scope

| Area | What we check | How |
|---|---|---|
| Catalog | Books load with title, author, and publisher | Automated (UI + API) |
| Search | Partial title and author search, case-insensitive | Automated (UI) |
| Search edge cases | Empty, whitespace, and unknown searches | Manual (TC-08) |
| Book details | Detail page matches the catalog record | Automated (UI + API) |
| Login | Missing fields and wrong credentials are rejected | Automated (UI + API) |
| Registration | Valid account creation; invalid input rejected | Manual (TC-04) |
| Collection | Logged-in user adds, keeps, and removes a book | Automated (UI + API) |
| Duplicate add | The same book cannot be added twice | Automated (UI) |
| Delete cancellation | Cancelling the delete dialog keeps the book | Automated (UI) |
| Logged-out access | Logged-out user cannot add books | Automated (UI) |
| Navigation | Returning from details keeps catalog state | Manual (TC-09) |
| Sorting | Sort by title in both directions | Manual (TC-10) |
| API errors | Unknown ISBN and invalid login return proper errors | Automated (API) |

Test case details: [test-cases.md](test-cases.md).
Automated suite: `part-2-test-automation/` (8 UI tests, 5 API tests).

## 3. Priorities

DemoQA is a public practice site, so priorities reflect how central a feature is
to the flows we test, not business impact.

| Priority | Area | Reason |
|---|---|---|
| High | Catalog | Search and detail tests depend on it |
| High | Search | Main function of the store |
| High | Book details | Checks data consistency between pages |
| High | Login | Gate for all authenticated features |
| High | Collection | Covers add, reload, remove, and cleanup in one flow |
| High | Duplicate add | Collection integrity: the same book must not appear twice |
| Medium | Delete cancellation | Protects the user from accidental data loss |
| Medium | Logged-out access | Less critical than the full collection flow |
| Medium | Search edge cases | Common inputs, but not blocking |
| Medium | Navigation state | Annoying if wrong, easy to recover from |
| Low | Sorting | Nice to have; browsing works without it |

## 4. How we test

We check the happy path and the failure path for each feature:

- correct input works (catalog, search, login, collection)
- wrong or empty input is rejected
- data stays consistent between pages (catalog vs. details)
- a book survives a page reload and can be removed again
- a book already in the collection cannot be added again
- a delete confirmation can be cancelled without losing the book
- state transitions: logged out → logged in → book added → book removed
- the API returns correct data and useful errors

We also explore the app for behavior not covered above.

## 5. Environment and test data

- App: <https://demoqa.com> (public, shared)
- Browser: Chrome desktop
- Automation: Playwright with TypeScript
- Users: unique disposable accounts created through the API, deleted in teardown
- Books: current catalog; identified by title or ISBN, never by row position

Cleanup rules:

- Tests remove every book they add, even when they fail after adding.
- Tests never delete an account they did not create.
- Accounts created by automation are always deleted in teardown.

## 6. What we don't test

| Area | Reason |
|---|---|
| reCAPTCHA | Third-party service; completed manually during registration |
| Account deletion via UI | Destructive; API deletion is used only for cleanup |
| Delete all books | Overlaps with the safer single-book removal test |
| Pagination | Catalog currently fits on one page |
| Full API coverage | Only endpoints used by our flows |
| Security testing | Public site; no authorization to test beyond visible login behavior |
| Performance and load | Shared environment, no requirements, no controlled setup |
| Other browsers and mobile | Scope limited to Chrome desktop |
| Ads and external links | Third-party content, not part of the store |

## 7. Risks while testing

- The site may be slow or down. We wait for page state, not fixed delays, and
  report availability issues separately from app bugs.
- Ads may cover controls. We target Book Store elements directly.
- The catalog may change between runs. We identify books by title or ISBN.
- A leftover account from an earlier run could affect results. Unique names per
  run prevent collisions; only test-created data is removed.

## 8. Done when

- All high-priority checks pass or are reviewed and documented.
- Edge cases and negative checks have been run.
- Test-created data has been cleaned up.
- Defects and observations are written down.

## Coverage map

| Test case | Automated | Manual |
|---|---|---|
| TC-01 Catalog records | Yes (UI, API) | — |
| TC-02 Search | Yes (UI) | — |
| TC-03 Detail consistency | Yes (UI, API) | — |
| TC-04 Registration | — | Yes |
| TC-05 Invalid login | Yes (UI, API) | — |
| TC-06 Collection lifecycle | Yes (UI, API) | — |
| TC-07 Logged-out access | Yes (UI) | — |
| TC-08 Search edge cases | — | Yes (known defect: "Page 1 of 0") |
| TC-09 Navigation state | — | Yes |
| TC-10 Sorting | — | Yes |
| TC-11 Duplicate add | Yes (UI) | — |
| TC-12 Delete cancellation | Yes (UI) | — |
