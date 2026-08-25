# Testing Strategy for a Non-Deterministic Security Alert Assistant

## Defining "pass"

I would not compare the assistant's response with one exact expected paragraph. Different wording, ordering, or levels of detail can all be acceptable. Instead, I would evaluate the response against a combination of hard requirements and quality criteria.

The hard requirements would cover factual grounding and safety. Every alert-specific factual statement must be supported by the provided alert data, important details such as affected entities and severity must be represented correctly, and the response must not contradict the source. When information is missing, the assistant should acknowledge the uncertainty rather than make an assumption. A violation of one of these requirements would fail that individual response.

The quality criteria would cover completeness, relevance, clarity, prioritization, and whether the recommendations are actionable. These could be scored using a defined rubric, for example from 1 to 5.

Because the output varies, I would run each important scenario several times. A release gate could require zero critical unsupported claims, complete accuracy for fields such as IP addresses, usernames, timestamps, and severity, at least 95% coverage of required facts, and an agreed minimum quality score. I would also examine the worst-performing runs, because a good average could hide an occasional but serious hallucination.

## Building a repeatable test set

I would create a version-controlled evaluation set using anonymized production-like alerts together with synthetic cases designed to cover specific risks. It would include common alert types, different severities, incomplete or conflicting data, multiple affected entities, long and noisy alerts, benign events, confirmed threats, and alert fields containing misleading text or prompt-injection attempts.

Each test case would contain the alert data, the user's question, the facts that must appear, facts that must not be claimed, acceptable recommendation boundaries, and the expected handling of missing information. The objective would be to create a "golden set of facts and constraints," rather than one golden response.

For example, if an alert only reports several failed authentication attempts, the test definition could require the assistant to mention the attempts and the affected account, while explicitly prohibiting claims that the account was compromised or that malware was installed. Recommendations such as investigating the account or temporarily blocking the source IP might be acceptable, provided they are presented as actions rather than as events that have already occurred.

I would keep the model, system prompt, configuration, and evaluation-set versions recorded for every run. If a seed can be controlled, I would use it for basic regression checks, but I would also deliberately run with different seeds or settings to exercise the feature's natural variability. A smaller subset could run on every change, while the full suite with repeated executions could run nightly or before a release. The subset used while tuning prompts would stay separate from the full set used for release decisions, so prompts are not tuned only to known examples.

## Detecting invented information

I would divide each response into individual factual claims and determine whether every claim is supported, contradicted, or not mentioned by the alert data.

Exact values such as IP addresses, usernames, device names, timestamps, event counts, and severity can be checked deterministically. Semantic statements require evidence mapping. For example, "five failed logins were recorded" may be supported, while "the attacker accessed the account" would be unsupported unless the alert contains evidence of a successful login or compromise.

I would also add perturbation checks: removing a field from the alert should remove claims based on that field, and changing one value should change only the related conclusions.

Recommendations need separate treatment because they will not usually appear directly in the alert. A recommendation is not automatically a hallucination. However, it must be relevant to the available evidence and must not imply that an unobserved event occurred. Assumptions should be stated conditionally.

I would automate part of this verification using exact-field comparisons and a claim-to-evidence evaluator. A second model could help identify unsupported semantic claims, but I would not use another model as the only source of truth. Its results would be calibrated against decisions made by QA and security specialists. I would also include negative tests in which important information is deliberately omitted and verify that the assistant says the information is unavailable or requests clarification.

## Automation and manual verification

I would automate stable and measurable checks: input and output contracts, error handling, response time, required fields, exact alert facts, contradictions, forbidden claims, prompt-injection resistance, repeated-run metrics, and regression comparisons between model or prompt versions. Automation is appropriate here because these checks must run frequently and consistently across many responses.

I would manually evaluate whether summaries are understandable, appropriately prioritized, concise, and genuinely useful to a security analyst. Manual exploratory testing would also cover ambiguous alerts, unusual combinations of events, misleading recommendations, and new failure patterns that the existing test set does not anticipate.

Human review remains important because a response can pass keyword-based checks while still being confusing, overly confident, or operationally unsafe. Reviewers would use the same rubric, and their decisions would periodically be used to recalibrate the automated evaluator.

Finally, I would monitor a sample of production responses, user feedback, grounding failures, and changes in response quality. Any confirmed production failure would become a new regression case. This creates a continuously improving test set as the assistant, prompts, alert formats, and user behaviour evolve.
