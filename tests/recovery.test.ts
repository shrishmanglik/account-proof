import { describe, expect, it } from "vitest";
import { recordHumanDecision } from "@/services/human-decision";
import { runAccountHealthReview } from "@/services/account-health";
import { syntheticAccountReviewRequest } from "@/fixtures/synthetic-account";

describe("review and recovery boundary", () => {
  it("denies self-review", () => {
    const review = runAccountHealthReview(syntheticAccountReviewRequest);
    expect(() =>
      recordHumanDecision({
        reviewReceipt: review,
        reviewerId: review.authoredBy,
        reviewerRole: "ACCOUNT_OWNER",
        decision: "ESCALATE",
        rationale: "Customer-visible state remains unresolved.",
        reviewedDigest: review.receiptDigest,
        acknowledgedEvidence: true,
      }),
    ).toThrowError(/independent/i);
  });

  it("records one exact-version escalation decision", () => {
    const review = runAccountHealthReview(syntheticAccountReviewRequest);
    const decision = recordHumanDecision({
      reviewReceipt: review,
      reviewerId: "synthetic-account-owner",
      reviewerRole: "ACCOUNT_OWNER",
      decision: "ESCALATE",
      rationale: "Reconcile support and customer evidence before the business review.",
      reviewedDigest: review.receiptDigest,
      acknowledgedEvidence: true,
    });

    expect(decision.state).toBe("RECORDED");
    expect(decision.reviewReceiptDigest).toBe(review.receiptDigest);
    expect(decision.authorizedExternalAction).toBe(false);
  });

  it("rejects stale receipt decisions", () => {
    const review = runAccountHealthReview(syntheticAccountReviewRequest);
    expect(() =>
      recordHumanDecision({
        reviewReceipt: review,
        reviewerId: "synthetic-account-owner",
        reviewerRole: "ACCOUNT_OWNER",
        decision: "HOLD",
        rationale: "Evidence version must be reconciled.",
        reviewedDigest: "f".repeat(64),
        acknowledgedEvidence: true,
      }),
    ).toThrowError(/version/i);
  });

  it("rejects a tampered receipt even when the submitted digest is unchanged", () => {
    const review = runAccountHealthReview(syntheticAccountReviewRequest);
    expect(() =>
      recordHumanDecision({
        reviewReceipt: { ...review, state: "READY_FOR_REVIEW" },
        reviewerId: "synthetic-account-owner",
        reviewerRole: "ACCOUNT_OWNER",
        decision: "ACCEPT",
        rationale: "The submitted receipt claims the account is ready.",
        reviewedDigest: review.receiptDigest,
        acknowledgedEvidence: true,
      }),
    ).toThrowError(/integrity/i);
  });
});
