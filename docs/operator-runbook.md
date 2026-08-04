# Operator runbook

## Local start

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. No environment secret is required. `.env.example` documents the only current public mode flag.

## Primary journey

1. Confirm the page displays **Synthetic demo** and **no employer affiliation**.
2. Select **Run evidence-bound review**.
3. Confirm five expected and observed receipts, `ESCALATION REQUIRED`, a false-green finding, an evidence receipt, and external action `NOT AUTHORIZED`.
4. Select **Record escalation decision**.
5. Confirm a decision receipt is shown and no external action is authorized.

## Recovery journey

1. Select **Simulate missing source**.
2. Confirm the evidence spine shows `4 / 5 sources` and names the missing customer receipt.
3. Run the review.
4. Confirm `HELD INCOMPLETE`, expected `5`, observed `4`, missing `1`, and a restore-then-rerun next action.
5. Select **Restore complete evidence** and rerun.

## Release gate

Run each command directly and inspect its exit code; do not gate through a pipe.

```bash
npm ci
npm audit
npm test
npm run test:controls
npm run test:controls
npm run test:mutation
npm run typecheck
npm run lint
npm run build
```

The repeated control invocation is intentional. The mutation command must report both `MUTATION_CAUGHT` and `RESTORED_CONTROL_PASSED`.

## Rollback

No provider or database is mutated by this repository. To roll back a code release, redeploy the previously reviewed Git commit. Do not roll back evidence or decision rows in place; preserve their audit chain and issue a superseding receipt.

## Incident rules

- Treat empty reads as an instrument failure until a known-positive receipt is observed.
- Stop a review when account binding, source authority, or expected-set reconciliation fails.
- Never convert `UNKNOWN` to green.
- Never let a retry reuse a changed payload under the same idempotency key.
- A provider-success badge does not prove application steps executed; inspect step logs.
