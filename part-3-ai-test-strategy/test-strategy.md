# Test Strategy for the Security Alert Assistant

## 1. Objective

The assistant receives security-alert data and produces a summary and
recommendations. Its wording may change between runs, but the security facts and
the safety of its advice must remain dependable.

The main risks are:

- Inventing users, devices, indicators, times, causes, or actions
- Omitting information that changes the meaning or severity of the alert
- Giving unsafe, destructive, or overconfident recommendations
- Treating untrusted text inside an alert as instructions
- Producing answers that are technically correct but not useful to an analyst

## 2. What pass means

A passing response does not need to match one reference paragraph. It must meet
two kinds of checks.

Hard rules must pass on every run:

- Alert facts are not changed.
- Claims are supported by the supplied alert data.
- Important fields such as alert type, severity, affected asset, time, and
  indicators are included when available.
- Missing information is described as unknown rather than guessed.
- Recommendations do not claim that an action was completed.
- Potentially destructive actions include suitable caution or approval steps.
- Text inside the alert cannot override the assistant's task or safety rules.

Quality rules are measured across repeated runs:

- The summary covers the important facts without unnecessary detail.
- Recommendations are relevant to the alert and ordered sensibly.
- The response clearly separates known facts, interpretations, and suggested
  next steps.
- Variation in wording does not create contradictory conclusions.

Release thresholds should be agreed with security analysts and product owners.
For example, unsupported critical facts may have zero tolerance, while wording
and style can use a scored rubric. A test case passes only when all hard rules
pass and its repeated-run quality score meets the agreed threshold.

## 3. Repeatable test set

I would build a versioned benchmark from sanitized real alerts and synthetic
cases. Each case would contain:

- A stable case ID and alert input
- Facts that must appear
- Facts that may appear if clearly marked as interpretation
- Claims that must never appear
- Acceptable recommendation categories
- Known missing information
- Risk level and reason for including the case

The set would cover:

- Common alert types and normal severity levels
- Single-event and correlated multi-event alerts
- Missing, empty, malformed, and conflicting fields
- Similar alerts that differ in one important fact
- Unknown assets or indicators
- Duplicate and noisy events
- Prompt-injection text placed inside alert fields
- High-risk alerts where a poor recommendation could cause damage

The model, prompt, retrieval sources, configuration, and benchmark version must
be recorded with every run. Where deterministic seeding is available it should
be fixed, but each case should also run several times because a single seeded
result does not measure real output variation.

A smaller calibration set can be used while changing prompts. A separate
holdout set should be used for release decisions so that prompts are not tuned
only to known examples.

## 4. Detecting invented information

Each response should be split into individual factual claims. Those claims are
then compared with the alert input and any explicitly permitted reference data.

Deterministic checks can validate exact values such as:

- IP addresses
- Hostnames
- Usernames
- File hashes
- Times
- Severity
- Alert identifiers

A claim that introduces a new value must either point to its source or be marked
as a hypothesis. Unsupported indicators, causes, or completed actions are
failures.

I would also use metamorphic tests:

- Removing a field should remove claims based on that field.
- Changing an IP, user, or time should change only the related parts.
- Reordering equivalent events should not change the conclusion.
- Adding irrelevant text should not change the security recommendation.
- Adding instruction-like text inside the alert should not redirect the
  assistant.

A second model can help label or compare responses, but it cannot be the only
judge because it can repeat the same mistake. Model-based evaluation should be
calibrated against analyst decisions, and disagreements should go to manual
review.

## 5. Automation and manual review

Automate:

- Response schema and required sections
- Exact preservation of structured alert values
- Forbidden or unsupported values
- Missing-field and prompt-injection cases
- Repeated-run pass rates and contradiction checks
- Metamorphic tests
- Regression comparison between model or prompt versions
- Latency, error rate, and token usage

Verify manually:

- Whether the summary gives an analyst the right understanding
- Whether recommendations are useful, proportionate, and safe
- Whether uncertainty is communicated appropriately
- Borderline factual-support decisions
- New failure patterns that the existing rubric does not cover

Automation is appropriate for stable, repeatable rules. Security analysts are
needed for context, usefulness, and risk judgments that cannot be reduced safely
to string matching or one evaluator model.

## 6. Release and monitoring

A release report should separate hard-rule failures, quality scores, variation,
latency, and cost. Results should also be compared with the current production
version so an improvement in style cannot hide a loss in factual accuracy.

After release, privacy-safe samples should be reviewed for unsupported claims,
missed alert types, analyst corrections, and recommendation problems. Confirmed
production failures should become new benchmark cases.
