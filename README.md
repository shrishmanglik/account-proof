# AccountProof

AccountProof is an evidence-bound account reliability workspace for security-critical SaaS Technical Account Management teams. It catches the expensive join failure a green CRM badge cannot: support, deployment, customer, or renewal evidence may still show unresolved risk.

This repository is a public work sample. It is not affiliated with or endorsed by CrowdStrike, does not represent an employer workflow, and contains no customer data, live integrations, or claimed commercial outcomes.

## Who it is for

The implemented workflow is designed for a technical account manager preparing an account review and for the named account, support, or business owner who must accept, hold, or escalate the exact evidence receipt.

The commercial hypothesis is that a Head of Technical Account Management or customer-operations leader would pay for an Account Reliability Diagnostic when account status disagrees across systems. Demand, willingness to pay, users, revenue, delivery cost, and customer outcomes are all `UNKNOWN`.

## The real workflow

The local application executes one complete synthetic journey:

1. Load five account-bound receipts: CRM, support, deployment, customer, and renewal.
2. Validate authorization, account identity, completeness, freshness, and replay identity.
3. Detect a false-green account when CRM is green but customer-operating evidence is not.
4. Emit a deterministic review receipt with rule version, counts, findings, citations, unknowns, and one safe next action.
5. Require a different human authority to record the escalation against the exact receipt digest.
6. Preserve `authorizedExternalAction: false`; the application cannot contact a customer or mutate an external provider.

Use **Simulate missing source** to exercise the recovery path. The expected denominator remains five, the workflow closes as `HELD_INCOMPLETE`, and the operator is told what must be restored before retry.

## Architecture

```text
Synthetic fixture -> typed POST /api/reviews -> deterministic rule service
                                             -> immutable review receipt
Review receipt   -> typed POST /api/decisions -> independent human gate
                                               -> decision receipt
```

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Zod request boundaries and explicit domain receipt types
- Deterministic SHA-256 receipt and input digests
- Stateless synthetic runtime; no credentials required
- Production-shaped Supabase migration with RLS enabled on every table, not applied to a provider
- Vitest controls, service/recovery tests, accessibility contract checks, security boundary checks, and a detector mutation harness

See [architecture](docs/architecture.md), [product contract](docs/product-contract.md), and [operator runbook](docs/operator-runbook.md).

## Deterministic, AI, and human authority

| Layer | Authority | Status |
| --- | --- | --- |
| Deterministic software | Scope, provenance, expected sets, freshness, conflict detection, receipt identity, reconciliation | Implemented |
| Bounded AI | May later propose a cited summary or next-best question; cannot alter truth, priority, approval, communication, or external systems | Proposed, absent at runtime |
| Named human | Owns health, escalation, support, renewal, and customer communication decisions | Implemented as an explicit gate |

AccountProof requires no AI call to run. The runtime cost of the implemented local workflow is therefore provider-free; production operating cost is `UNKNOWN`.

## Reproduce the demo

Requirements: Node.js 20.9 or newer and npm.

```bash
git clone https://github.com/shrishmanglik/account-proof.git
cd account-proof
git switch dev/account-proof-initial-build
npm ci
npm run dev
```

Open `http://localhost:3000`, choose **Inspect the workflow**, then:

1. Run **Run evidence-bound review** and inspect `ESCALATION REQUIRED`, its cited evidence IDs, and the review receipt.
2. Record the explicit human escalation decision and confirm the UI says no external action is authorized.
3. Choose **Simulate missing source**, rerun, and confirm the state becomes `HELD INCOMPLETE` with observed `4`, missing `1`.

## Verification

```bash
npm test
npm run test:controls
npm run test:mutation
npm run test:accessibility
npm run test:security
npm run test:recovery
npm run typecheck
npm run lint
npm run build
npm audit
```

The critical mutation command disables the CP-R11 silent-success detector, requires the control suite to fail, restores the detector, and requires the suite to pass. The control suite also evaluates every bad and good fixture twice to expose non-idempotent output.

Exact results for the published commit are recorded in [the evidence manifest](docs/evidence/manifest.md).

## Security and privacy

- All committed fixtures are conspicuously synthetic and account-bound.
- No secrets, customer identifiers, tokens, provider calls, telemetry, or external mutations are present.
- API boundaries parse requests with Zod and fail closed on cross-account evidence, duplicate sources, missing evidence, stale evidence, and stale decision digests.
- The included Supabase schema enables RLS on all seven tables. It is source-only design evidence: live database, authentication, policy behavior, backup, and provider configuration remain `UNKNOWN`.
- Dependency versions are locked. Patched transitive versions are overridden where required by current advisories.

See [SECURITY.md](SECURITY.md) for reporting and the implemented threat boundary.

## Evidence boundaries

| Claim class | What this repository can prove |
| --- | --- |
| Local | Install, tests, static checks, build, and browser journey run against this commit |
| GitHub | Public repository, branch, commit, pull request, and hosted check state after publication |
| Provider | No deployment, database, authentication, billing, or monitoring provider was configured; these remain `UNKNOWN` |
| Commercial | Buyer, wedge, and pricing are hypotheses only; demand, adoption, revenue, and outcomes remain `UNKNOWN` |

## Implemented vs proposed

Implemented: responsive workflow UI; five-source synthetic evidence spine; typed review and decision APIs; deterministic false-green, missing-source, stale-source, and renewal-risk rules; audit/evidence receipts; retry/recovery paths; explicit human authority; full test and build surface; production-shaped RLS schema.

Proposed: authentication, live connectors, durable persistence, tenant administration, deployment, observability, data-retention controls, exports, bounded AI summaries, paid diagnostic packaging, and measured customer validation.

## Roadmap

1. Regenerate the external application-package blueprint from the corrected TAM-only product contract; the previous mixed source is not authoritative.
2. Validate the diagnostic workflow with consented design partners before selecting pricing or integrations.
3. Apply and adversarially test the Supabase schema in an authorized provider project.
4. Add connector adapters behind the existing evidence boundary, beginning with read-only receipts.
5. Measure false-positive rate, operator time, and replay reliability before any bounded AI summary layer is considered.

## License and use

No open-source license has been granted. Public visibility permits inspection of this work sample but does not grant reuse rights.
