import { describe, expect, it } from "vitest";
import { runAccountHealthReview } from "@/services/account-health";
import { syntheticAccountReviewRequest } from "@/fixtures/synthetic-account";

describe("account health review", () => {
  it("finds the false-green join instead of trusting CRM", () => {
    const receipt = runAccountHealthReview(syntheticAccountReviewRequest);

    expect(receipt.state).toBe("ESCALATION_REQUIRED");
    expect(receipt.findings.map((finding) => finding.code)).toContain("FALSE_GREEN_ACCOUNT");
    expect(receipt.humanAuthority).toBe("REVIEW_REQUIRED");
    expect(receipt.citations.length).toBe(5);
  });

  it("is idempotent for the same logical request", () => {
    expect(runAccountHealthReview(syntheticAccountReviewRequest)).toEqual(
      runAccountHealthReview(syntheticAccountReviewRequest),
    );
  });

  it("fails closed when expected evidence is absent", () => {
    const incomplete = {
      ...syntheticAccountReviewRequest,
      evidence: syntheticAccountReviewRequest.evidence.filter((item) => item.system !== "CUSTOMER"),
    };
    const receipt = runAccountHealthReview(incomplete);

    expect(receipt.state).toBe("HELD_INCOMPLETE");
    expect(receipt.findings.map((finding) => finding.code)).toContain("EXPECTED_SOURCE_MISSING");
  });
});
