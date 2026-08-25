# DemoQA Book Store Tests

Playwright UI and API tests for the DemoQA Book Store Application.

## Deliverables

- [Test Plan](part-1-test-design/test-plan.md)
- [Test Cases](part-1-test-design/test-cases.md)
- [AI Feature Test Strategy](part-3-ai-test-strategy/test-strategy.md)
- [Full AI Usage Report](ai-usage-report.md)

## Automated coverage

The UI suite contains eight tests covering:

- Catalog records
- Partial case-insensitive title and author search
- Book-detail consistency
- Required fields and invalid login
- Logged-out collection access
- Authenticated add, persistence, and removal of a book
- Duplicate-add prevention
- Delete-confirmation cancellation

Five additional API tests cover catalog data, book details, invalid ISBNs,
invalid authentication, and the authenticated collection lifecycle.

Tests that create users use unique disposable accounts. Each account and its
collection data are removed during teardown.

## Project structure

- `part-1-test-design` — test plan and manual test cases
- `part-2-test-automation/src` — API clients, fixtures, models, and page objects
- `part-2-test-automation/tests` — Playwright API and UI tests
- `part-2-test-automation/playwright.config.ts` — test projects and reporting
- `part-3-ai-test-strategy` — strategy for testing the AI-powered feature

## Requirements

- Node.js 22–26
- npm

## Installation

```bash
cd part-2-test-automation
npm ci
npx playwright install chromium
```

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution policy
prevents the `.ps1` commands from running.

## Running tests

```bash
npm test
npm run test:ui
npm run test:api
npm run typecheck
npm run format
npm run format:check
npm run quality
npm run quality:fix
npm run test:headed
npm run test:debug
npm run report
```

The full suite accesses the public DemoQA environment and creates four isolated
disposable accounts. All accounts are deleted during teardown.

## HTML report

Playwright creates an HTML report after each complete test run. Open it locally
with `npm run report`. GitHub Actions displays totals and a per-test results table
directly in the job summary. A downloadable HTML report is retained for 14 days
when more detail is needed. Failed tests include their traces, screenshots, and
videos in that report.

## HTML report

Playwright creates an HTML report after each complete test run. Open it locally
with `npm run report`. GitHub Actions displays totals and a per-test results table
directly in the job summary. A downloadable HTML report is retained for 14 days
when more detail is needed. Failed tests include their traces, screenshots, and
videos in that report.

## Test design notes

- Selectors use roles, visible names, placeholders, and row-scoped content.
- Books are identified by title or ISBN instead of row position.
- Tests wait for application state, responses, dialogs, and modals instead of
  fixed delays.
- UI login is tested through the browser; API calls are used only for disposable
  setup, cleanup, and API-level checks.
- Traces, screenshots, and videos are retained when a test fails.
- Biome formats and checks the TypeScript and JSON files locally and in CI.

## Known observation

An unknown catalog search displays no rows and disables pagination, but the page
shows `Page 1 of 0`. This is covered by TC-08 as a manual defect check and was
not included in the passing automated suite.

## Latest validation

- TypeScript type-check: passed
- Complete Playwright suite: 13 passed

## AI usage

- I used Codex and Playwright MCP to explore the app, draft tests, and debug failures.
- AI wrote first drafts of the test plan, test cases, API clients, page objects, and the Part 3 strategy.
- I chose the final scope, priorities, expected results, and cleanup rules.
- I rewrote the first test plan because it described the assignment instead of the product.
- I fixed wrong selectors, API field mapping, and account cleanup after running the real suite.
- I rewrote the test plan and strategy to use shorter, simpler wording.
- Every change was reviewed, type-checked, and validated with the complete test suite.
