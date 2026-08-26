# AI Usage Report — Bitdefender QA Take-Home Assignment

Full record of how AI tools were used, what they produced, and what was
corrected, rejected, or rewritten — and why.

## Tools used

- **Codex** (OpenAI CLI, 3 local sessions in `A:\Projects\Bitdefender`)
- **Playwright MCP** — live browser exploration of the DemoQA site
- **opencode** (DeepSeek) — final document rewrites and coverage review
- **GitHub Actions** — CI feedback loop on every push

## Timeline and thought process

### Session 1 — Aug 24: false start, abandoned

Codex read the assignment and the workflow file. We discussed which DemoQA
area to test and settled on the Book Store.

Codex started implementing, but in the wrong way: it patched files manually
instead of using proper write tools, and it suggested Java before I corrected
it to TypeScript. The output was a mess of incomplete flows.

I deleted everything and asked for a debrief of what went wrong, so the
failure itself could be documented in the AI-usage statement.

Mistake: I let the agent run before agreeing on the approach. Lesson taken:
agree on scope and method first, then implement.

### Session 2 — Aug 24: discovery, test design, first drafts

New start, same workspace. Key decisions made with AI as a discussion
partner:

1. I wanted a **discovery phase before the test plan**: understand what the
   site actually does (pages, flows, auth, reCAPTCHA) before writing
   "expected results" for it. We used Playwright MCP to explore the live
   site and inspect selectors and dialogs.
2. Codex drafted a test plan and GWT test cases. **I rejected the plan
   twice**: first because it described the assignment instead of the
   product, then because it was full of AI-flavored filler ("Failure impact:
   Critical" tables, wrong priorities). I pushed the registration-vs-login
   priority debate until the ordering matched how the product actually works.
3. I decided which cases to automate, chose API tests and a GitHub runner as
   extras beyond the minimum, and kept the reCAPTCHA flow manual.

I also benchmarked a public DemoQA test repo to extract good practices
(structure, selectors, cleanup), then removed it — it was reference only.

### Session 3 — Aug 25: build, CI, polish

Codex built the Playwright project, ran the suite (11 passing), initialized
git, split deliverables into `part-1/2/3` folders, and set up the GitHub
Actions workflow.

CI work: first push, PR runs, a job-summary results table (so I don't have
to download the HTML report), Node 20 deprecation fix, and a runtime review
(41s felt slow).

I added Biome for formatting. Then I compared the test plan against
best-practice articles and flagged it again: "this whole plan is too AI
generated and uses only buzzwords."

### opencode session — Aug 26: tone-down and coverage gaps

Final pass with opencode (Claude):

- Rewrote the test plan: shorter sentences, tables, no technique jargon,
  plus a TC-to-automation coverage map
- Cleaned jargon ("equivalence partitioning", "decision table", "state
  transition") out of the test-case Type fields
- Compared our coverage against a reference solution: found **duplicate
  book addition** and **delete cancellation** missing — added TC-11 and
  TC-12, automated both (suite now 13 passing)
- Replaced the Part 3 strategy with a tighter version that fits the 2-page
  limit and kept the perturbation-test idea from the old draft
- Automated the registration UI end to end by stubbing the reCAPTCHA script
  with Playwright route interception; fixed the weak-password assertion to
  match real app behavior (the app shows a server message, not a field flag)
- Fixed stale README facts (account count) and compressed the AI-usage
  section to fit the 10-line limit
- Moved and linked the interactive decision tree into the Part 3 folder

### Codex follow-up — decision tree

For the Part 3 companion artifact, I wrote my own in-depth analysis of the
scenario and the clarifying questions that matter. Codex expanded each topic
into the full interactive decision-tree HTML (questions, assumptions,
expectations, strategies, example oracles). The structure and the thinking
are mine; the expansion and the visualization are Codex's.

## What AI generated

- First drafts of the test plan, test cases, and Part 3 strategy
- Page objects, API clients, fixtures, and models
- All UI and API test code, including the GitHub-summary reporter
- GitHub Actions workflow
- Initial repo structure and Biome setup
- Debugging of real run failures (API field mapping, token cleanup)
- The interactive decision-tree HTML, expanded from my analysis

## What I corrected, rejected, or rewrote — and why

| What | Why |
|---|---|
| Rewrote the first test plan | It described the assignment wording instead of product behavior |
| Rewrote it again | AI buzzwords, wrong priorities, "Failure impact: Critical" filler |
| Set scope, priorities, and cleanup rules myself | These are judgment calls, not drafting work |
| Stubbed reCAPTCHA for UI registration testing | Google's service can't be exercised by E2E; the form logic can |
| Rejected outdated selectors and assumptions | They failed against the live site; MCP inspection replaced guesses |
| Fixed API field mapping and token cleanup | Found only by running the real suite |
| Rewrote plan and strategy for plain words | Shorter, simpler text reads better and shows the thinking |
| Added duplicate-add and cancel-delete coverage | Coverage-map review exposed real gaps |
| Wrote the decision-tree analysis myself | Codex expanded it, but the structure and reasoning are mine |

## Mistakes made and learned from

1. Letting the agent implement before agreeing on approach (Session 1) —
   cost one full restart.
2. A workflow rule about running commands was unclear — I added it, then
   had to adjust it when it blocked normal work.
3. Git init at the end caused a "dubious ownership" error; running it early
   would have avoided the detour.
4. Trusting first AI drafts for docs — every document needed at least two
   human passes before it read like mine.

## What AI did not do

- Decide the scope, priorities, or what gets tested
- Choose the cleanup and data-isolation rules
- Write the final wording of any deliverable
- Decide what ships

Every final change was reviewed by me, type-checked, and validated with the
complete test suite (15 passing).
