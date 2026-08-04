# Architecture

## Decision flow

AccountProof treats account health as a versioned evidence decision, not a mutable dashboard field.

```text
Bounded account request
  -> request schema and authority validation
  -> evidence account-binding and expected-set reconciliation
  -> freshness and contradiction rules
  -> deterministic review receipt + citations + UNKNOWNs
  -> exact-digest human decision gate
  -> deterministic decision receipt (external action remains false)
```

The critical join is `CRM GREEN` against non-green support, deployment, or customer evidence. The result is `FALSE_GREEN_ACCOUNT`, never a silently healthy account. Missing or stale evidence takes precedence and holds the review incomplete.

## Boundaries

- `src/domain`: Zod contracts, receipt types, canonical digesting, and twelve control detectors.
- `src/services`: deterministic review and human-decision services. These functions are framework-independent.
- `src/app/api`: thin HTTP adapters that validate JSON and return explicit errors.
- `src/fixtures`: synthetic, deterministic demonstration data only.
- `src/components`: responsive operator interface and recovery controls.
- `supabase/migrations`: un-applied persistence contract with tenant-scoped RLS.

## Receipt properties

- SHA-256 digests use stable key ordering.
- Repeating the same request yields the same receipt ID and digest.
- The idempotency key must be bound to the account operation.
- A decision must reference the exact current receipt digest.
- The review author cannot be the reviewer.
- Every terminal response carries `authorizedExternalAction: false`.

## Persistence model

Seven proposed tables separate tenants, membership, accounts, evidence, reviews, decisions, and append-oriented audit events. Every table has RLS enabled, policies require authenticated tenant membership, and composite foreign keys bind account/review parents to the same tenant as each child. This schema has not been applied or tested against a live Supabase project; provider truth is `UNKNOWN`.

## Recovery model

- Missing source: retain the expected denominator, emit `HELD_INCOMPLETE`, name the missing system, and rerun only after restoration.
- Stale source: retain citation and stale count, hold the review, and request a fresh receipt.
- Duplicate or cross-account source: reject the request rather than choose one silently.
- Stale decision: reject a decision against any receipt digest other than the displayed version.
- API/runtime error: keep prior claims cleared and expose a retry of the exact local request.

## AI boundary

No AI dependency exists. A future model may operate only on an approved evidence bundle and return a cited draft; deterministic validation and a named human must still own every consequential state transition.
