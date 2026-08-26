# DemoQA Book Store Tests

Playwright UI and API tests for the DemoQA Book Store Application.

## Deliverables

- [Test Plan](part-1-test-design/test-plan.md)
- [Test Cases](part-1-test-design/test-cases.md)
- [AI Feature Test Strategy](part-3-ai-test-strategy/test-strategy.md)
- [Full AI Usage Report](ai-usage-report.md)

## Automated coverage

The UI suite contains ten tests covering:

- Catalog records
- Partial case-insensitive title and author search
- Book-detail consistency
- Required fields and invalid login
- Required registration fields and weak-password validation
- Valid registration followed by login
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
- `part-2-test-automation/docs` — reCAPTCHA automation notes
- `part-2-test-automation/playwright.config.ts` — test projects and reporting
- `part-3-ai-test-strategy` — strategy for testing the AI-powered feature
- `ai-usage-report.md` — full record of AI tool usage

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
npm test               # full suite
npm run test:ui        # UI only
npm run test:api       # API only
npm run test:headed    # watch in a browser
npm run report         # open the HTML report
```

Run one spec: `npm run test:ui -- tests/ui/collection.ui.spec.ts` (same pattern
with `test:api`). Quality checks: `npm run typecheck` and `npm run quality`.

The full suite accesses the public DemoQA environment and creates five isolated
disposable accounts. All accounts are deleted during teardown.

## HTML report

Playwright writes an HTML report after each run — open it with `npm run report`.
In CI, totals and failures show up in the job summary; the full report is kept
as a downloadable artifact for 14 days, with traces, screenshots, and videos
for failed tests.

## Test design notes

- Selectors use roles, visible names, placeholders, and row-scoped content.
- Books are identified by title or ISBN instead of row position.
- Tests wait for application state, responses, dialogs, and modals instead of
  fixed delays.
- UI login is tested through the browser; API calls are used only for disposable
  setup, cleanup, and API-level checks.
- The registration test replaces the reCAPTCHA script with a stubbed token; the
  real Google service is not exercised. See
  [the full explanation](part-2-test-automation/docs/recaptcha-stub.md).

## Known observation

An unknown catalog search displays no rows and disables pagination, but the page
shows `Page 1 of 0`. This is covered by TC-08 as a manual defect check and was
not included in the passing automated suite.

## Latest validation

- TypeScript type-check: passed
- Complete Playwright suite: 15 passed

## AI usage

- i used ai for all 3 parts: codex + playwright mcp for the automation, chatgpt for the part 3 strategy and decision tree, deepseek for the rechapcha work.
- the ai generated first drafts of the test plan, test cases, the strategy, and most of the test code.
- i did the exploratory testing and the analysis first, then let the ai expand it.
- i kept pushing back on the ai drafts — the plan talked about the asigment insted of the product, was full of buzzwords like "failure impact: critical" and had wrong priorities.
- i made it redo it in plain words, after discovery of the actual app, and split clearly what we test from what we automate.
- i rejected the first part 3 output too: it was vague and basically ai slop, so i analyzed the requirements myself and built the strategy and the decision tree from my own analysis.
- when ai said the rechapcha cannot be automated i trusted my own exploratory testing over it and pushed further with deepseek until we had a ui e2e test (details in [recaptcha-stub.md](part-2-test-automation/docs/recaptcha-stub.md)).
- every final change was reviewed by me, type-checked, and validated with the full suite (15 passing).
- the full story in my own words: [thoughts.md](thoughts.md)
