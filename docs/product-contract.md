# AccountProof product contract

Status: `IMPLEMENTATION CONTRACT — CROWDSTRIKE/TAM BOUNDARY`

## Authority correction

AccountProof is exclusively an evidence-bound account-reliability workspace for security-critical SaaS Technical Account Management teams. Its recruiter-facing design input is the publicly captured CrowdStrike Associate Technical Account Manager posting, requisition R29341, captured on 2026-07-31. It is not a CrowdStrike product, implementation, customer result, internal workflow, endorsement, or roadmap proposal.

The mixed application-package blueprint is not authoritative. Content concerning prior targets or unrelated domain and requisition material is deliberately excluded from this repository.

`GAP`: the application-package blueprint must be regenerated from this corrected contract. This repository does not mutate the application package.

## Problem and buyer hypothesis

A CRM can be green while support is red. A support case can be marked resolved while the customer-visible state is still wrong. A quarterly review can be polished while renewal risk lives in private notes. AccountProof joins those adjacent checks into one evidence-bound customer-account decision.

- Primary user hypothesis: Head of Technical Account Management and individual TAMs.
- Buyer hypothesis: Chief Customer Officer, VP Customer Success, or VP Support.
- Commercial wedge hypothesis: one paid Account Reliability Diagnostic for a security-critical SaaS account where CRM status, support state, deployment evidence, customer evidence, and renewal confidence disagree.
- Demand, price acceptance, delivery cost, margin, users, revenue, customer outcomes, and repeat use: `UNKNOWN`.

## Implemented vertical

1. Register one bounded synthetic account, region, TAM owner, business owner, customer owner, and stop authority.
2. Load synthetic evidence receipts from CRM, support, deployment, customer, and renewal systems.
3. Validate source identity, account binding, freshness, expected-set completeness, and conflicts.
4. Detect false-green health when adjacent system states disagree.
5. Produce a deterministic review receipt with rule version, trace, citations, unresolved unknowns, and one safe next action.
6. Require a different human reviewer to accept, hold, or escalate the exact receipt version.
7. Record a deterministic decision receipt. No external communication or provider mutation exists.

## Deterministic / AI / human boundary

- Deterministic software owns scope admission, evidence completeness, freshness, contradiction detection, source citations, idempotency, receipt identity, decision authority, and reconciliation.
- AI is not required at runtime. A future bounded AI layer may propose a summary or next-best question from approved evidence, but may not change account truth, health state, priority, approval, communication, or external systems.
- Named humans own consequential customer health, escalation, support, renewal, and communication decisions.

## P0 controls

The implementation carries twelve fail-closed controls: account authority, source provenance, restricted-data classification, human authority, demo truth, evidence completeness, supported findings, independent review, denominator/cost integrity, adoption truth, silent-success/reconciliation, and de-identified product learning.

Each control has one bad synthetic fixture and one clean synthetic fixture. The suite runs twice, normalized evidence digests must match, and disabling the critical silent-success detector must make the control suite fail.

## Persistence boundary

The public demo is stateless and synthetic. A production-shaped Supabase migration is included as an un-applied contract; every table enables RLS and scopes access through tenant membership. Live database, auth, RLS, provider configuration, deployment, and production reliability remain `UNKNOWN`.

## Public claim boundary

Implemented source and locally executed tests may prove only repository and local behavior. They do not prove employer adoption, customer demand, commercial viability, provider state, production security, live reliability, users, revenue, or outcomes.
