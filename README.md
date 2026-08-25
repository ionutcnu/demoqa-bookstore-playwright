# DemoQA Book Store Tests

Playwright UI and API tests for the DemoQA Book Store Application.

## Deliverables

- [Test Plan](part-1-test-design/test-plan.md)
- [Test Cases](part-1-test-design/test-cases.md)
- [AI Feature Test Strategy](part-3-ai-test-strategy/test-strategy.md)

## Automated coverage

The UI suite contains six tests covering:

- Catalog records
- Partial case-insensitive title and author search
- Book-detail consistency
- Required fields and invalid login
- Logged-out collection access
- Authenticated add, persistence, and removal of a book

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

The full suite accesses the public DemoQA environment and creates two isolated
disposable accounts. Both accounts are deleted during teardown.

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
- Complete Playwright suite: 11 passed

## AI usage

- I used Codex for requirement extraction, test-design review, browser exploration, Playwright drafting, and debugging.
- Playwright MCP was used to inspect current UI behavior and selectors.
- AI produced initial drafts of the test plan, test cases, page objects, API clients, and written strategy.
- I chose the final scope, priorities, expected results, and cleanup rules.
- I rewrote an early test plan that focused too heavily on assignment wording instead of product behavior.
- I rejected outdated selectors and unsupported assumptions after checking the live application.
- I corrected API field mapping and token-cleanup problems found during real test execution.
- Every final change was reviewed, type-checked, and validated with the complete test suite.
