# AccountProof evidence manifest

Evidence date: 2026-08-01 (America/Toronto)

This manifest keeps repository behavior, GitHub state, and provider state separate. A local result never proves a hosted or commercial claim.

## Product authority and source boundary

| Status | Evidence | Finding |
| --- | --- | --- |
| VERIFIED | Founder decision and `docs/product-contract.md` | AccountProof is bounded exclusively to security-critical SaaS Technical Account Management. |
| GAP | Original dispatch root | The dispatched `C:\MDS` authority root was stale and absent. Authority was reloaded from the founder-corrected current root `C:\AGI`. No mirror or frozen snapshot was used. |
| VERIFIED | Captured public job source digest `c2fe9874eed4dc7440deaad2bd31e05e760c0925adc4bea4cdfc978c5ce7482c` | The valid recruiter-facing design input is the public CrowdStrike Associate Technical Account Manager posting, R29341, captured 2026-07-31. This is role context, not customer demand, employer affiliation, or internal workflow proof. |
| VERIFIED / REJECTED | Supplied blueprint SHA-256 `a767769f6b21384d20b265b14d74aa9ccc31e99b6f079bb05a987473a1c21412` | The file mixed unrelated prior-target material and is not authoritative. No rejected marker remains in the repository. |
| GAP | Corrected contract | The external application-package blueprint must be regenerated later from the corrected contract. This repository does not modify the application package. |
| VERIFIED | Vedic Astro Studio repository state at reference time | Quality standards were borrowed for deterministic-first design, proof separation, recovery, documentation, and operational completeness. No domain code or product-status claim was copied. |

## Clean start and repository truth

| Truth layer | Status | Evidence |
| --- | --- | --- |
| Local | VERIFIED | Exact isolated clone started clean from `main` at `f4797239c42d9ce99cb0918ccb5e5d05d8c473d0`; work occurred only on `dev/account-proof-initial-build`. |
| GitHub | VERIFIED at pre-publication check | `gh repo view` returned `visibility: PUBLIC`, `isPrivate: false`, default branch `main`, repository `https://github.com/shrishmanglik/account-proof`. |
| GitHub | VERIFIED at pre-publication check | `gh pr list --state all` returned an empty array before this branch was published. The pull request URL is provider-generated after this manifest is frozen and belongs in the task closeout. |
| Provider | NOT USED | No deployment, database, auth, billing, email, CRM, support, or telemetry provider was configured or mutated. |

## Architecture and schema

- Typed boundaries: `AccountHealthReviewRequest.v1`, `AccountHealthReviewReceipt.v1`, and `HumanDecisionReceipt.v1`.
- Deterministic service boundary: account binding, expected-set reconciliation, freshness, false-green detection, renewal risk, stable digests, and one safe next action.
- Human boundary: exact receipt digest, independent reviewer identity, allowed role, acknowledged evidence, and external action fixed to false.
- Proposed Supabase schema: seven tables (`tenants`, `tenant_memberships`, `accounts`, `evidence_items`, `health_reviews`, `review_decisions`, `audit_events`); RLS is enabled and policy presence is tested for all seven.
- Persistence/provider truth: source contract only; unapplied and `UNKNOWN` live behavior.

## Local verification evidence

### Negative-before

Before the implementation modules existed, `npm test` exited `1`: all five test files failed to load their missing application modules/migration. This demonstrated that the tests were attached to the intended implementation boundary rather than passing on an absent dependency.

The first passing-after attempt exposed two real defects instead of being reported green: the suite was `33 passed / 1 failed` because the stale-digest fixture failed at schema validation, and `npm run typecheck` failed on an over-broad string inference. Both were corrected, then the complete gates were rerun.

### Passing-after

| Command | Exact result |
| --- | --- |
| `npm audit` | exit `0`; `0` vulnerabilities across 498 resolved dependencies |
| `npm test` | exit `0`; 5 files, 35/35 tests passed |
| `npm run test:controls` run 1 | exit `0`; 1 file, 24/24 tests passed |
| `npm run test:controls` run 2 | exit `0`; 1 file, 24/24 tests passed |
| `npm run test:mutation` | exit `0`; CP-R11 disabled -> inner control exit `1`; restored -> inner control exit `0` |
| `npm run test:accessibility` | exit `0`; 2/2 tests passed |
| `npm run test:security` | exit `0`; 2/2 tests passed |
| `npm run test:recovery` | exit `0`; 4/4 tests passed |
| `npm run typecheck` | exit `0` |
| `npm run lint` | exit `0`, no warnings |
| `npm run build` | exit `0`; optimized Next.js production build; `/` static plus `/api/reviews` and `/api/decisions` dynamic routes |

Each of the twelve controls has a negative and positive fixture; each fixture is evaluated twice and must produce the same digest. The mutation harness disables the CP-R11 silent-success detector without altering the fixture, requires the suite to fail, restores the detector, and requires a clean pass.

## Browser journey

Playwright CLI exercised the production server at desktop `1440x900` and mobile `390x844` viewports.

| Journey | Verified result |
| --- | --- |
| Initial page | Synthetic-demo, no-affiliation, and no-external-action boundaries visible |
| Primary review | `5/5` receipts -> `ESCALATION REQUIRED`; false-green and renewal findings show exact evidence IDs; review receipt shows human review required and external action not authorized |
| Human decision | Escalation decision receipt recorded; UI explicitly retains no external action authority |
| Recovery | Missing customer source remains `4/5`; review becomes `HELD INCOMPLETE`, expected `5`, observed `4`, missing `1`, with restore-then-rerun instruction |
| Responsive layout | Desktop and mobile screenshots visually inspected; no clipping or hidden workflow controls observed |
| Browser console | Final production build reported 0 errors and 0 warnings; the initial favicon 404 was caught and corrected before the final gate |

Screenshots are local QA artifacts under ignored `output/playwright/`; the README supplies reproducible steps instead of treating a screenshot as runtime proof.

## Remaining UNKNOWNs

- Customer demand, willingness to pay, users, revenue, outcomes, time savings, false-positive rate, and production cost.
- Live authentication, RLS behavior, data retention, backup, observability, incident response, and provider configuration.
- Connector semantics and permissions for any real CRM, support, deployment, customer, or renewal source.
- Production performance, uptime, accessibility audit by assistive-technology users, and penetration-test results.
