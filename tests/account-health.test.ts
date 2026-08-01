import { describe, expect, it } from "vitest";
import { runAccountHealthReview } from "@/services/account-health";
import { syntheticAccountReviewRequest, syntheticIncompleteAccountReviewRequest } from "@/fixtures/synthetic-account";
import { createReviewIdempotencyKey } from "@/domain/idempotency";

describe("account health review", () => {
  it("finds the false-green join instead of trusting CRM", () => {
    const receipt = runAccountHealthReview(syntheticAccountReviewRequest);

    expect(receipt.state).toBe("ESCALATION_REQUIRED");
    expect(receipt.findings.map((finding) => finding.code)).toContain("FALSE_GREEN_ACCOUNT");
    expect(receipt.humanAuthority).toBe("REVIEW_REQUIRED");
    expect(receipt.citations.length).toBe(5);
  });

  it("is idempotent for the same logical request", () => {
    const { idempotencyKey, ...operation } = syntheticAccountReviewRequest;
    expect(idempotencyKey).toBe(createReviewIdempotencyKey(operation));
    expect(runAccountHealthReview(syntheticAccountReviewRequest)).toEqual(
      runAccountHealthReview(syntheticAccountReviewRequest),
    );
  });

  it("rejects a changed payload that reuses an existing idempotency key", () => {
    expect(() => runAccountHealthReview({
      ...syntheticAccountReviewRequest,
      evaluationTime: "2026-08-01T14:01:00.000Z",
    })).toThrowError(/idempotency key/i);
  });

  it("fails closed when expected evidence is absent", () => {
    const { idempotencyKey, ...operation } = syntheticIncompleteAccountReviewRequest;
    expect(idempotencyKey).toBe(createReviewIdempotencyKey(operation));
    const receipt = runAccountHealthReview(syntheticIncompleteAccountReviewRequest);

    expect(receipt.state).toBe("HELD_INCOMPLETE");
    expect(receipt.findings.map((finding) => finding.code)).toContain("EXPECTED_SOURCE_MISSING");
  });

  it("rejects evidence observed after the evaluation time", () => {
    const futureDated = {
      ...syntheticAccountReviewRequest,
      evidence: syntheticAccountReviewRequest.evidence.map((item) => item.system === "SUPPORT"
        ? { ...item, observedAt: "2026-08-01T14:00:01.000Z" }
        : item),
    };
    const operation = Object.fromEntries(
      Object.entries(futureDated).filter(([key]) => key !== "idempotencyKey"),
    ) as Parameters<typeof createReviewIdempotencyKey>[0];

    expect(() => runAccountHealthReview({
      ...futureDated,
      idempotencyKey: createReviewIdempotencyKey(operation),
    })).toThrowError(/future-dated/i);
  });
});
