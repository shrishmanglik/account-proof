import { HumanDecisionRequestSchema, type HumanDecisionReceipt, type HumanDecisionRequest } from "@/domain/contracts";
import { sha256 } from "@/domain/digest";

export function recordHumanDecision(raw: HumanDecisionRequest): HumanDecisionReceipt {
  const input = HumanDecisionRequestSchema.parse(raw);
  const { receiptId, receiptDigest, ...receiptBody } = input.reviewReceipt;
  const recomputedDigest = sha256(receiptBody);
  if (recomputedDigest !== receiptDigest || receiptId !== `review_${receiptDigest.slice(0, 16)}`) {
    throw new Error("The review receipt failed its integrity check; reload the authoritative receipt.");
  }
  if (input.reviewerId === input.reviewReceipt.authoredBy) {
    throw new Error("An independent reviewer is required; the workflow author cannot approve the receipt.");
  }
  if (input.reviewedDigest !== input.reviewReceipt.receiptDigest) {
    throw new Error("The review version is stale; load and inspect the exact current receipt.");
  }

  const base = {
    schemaVersion: "HumanDecisionReceipt.v1" as const,
    reviewReceiptDigest: input.reviewReceipt.receiptDigest,
    reviewerId: input.reviewerId,
    reviewerRole: input.reviewerRole,
    decision: input.decision,
    rationale: input.rationale,
    state: "RECORDED" as const,
    authorizedExternalAction: false as const,
    nextAction: input.decision === "ESCALATE"
      ? "Route the evidence packet to the named support and customer owners; external communication remains manual."
      : input.decision === "HOLD"
        ? "Preserve the receipt and restore the missing authority or evidence before retry."
        : "Record the accepted internal disposition; no external action is authorized.",
  };
  const decisionDigest = sha256(base);
  return { ...base, decisionReceiptId: `decision_${decisionDigest.slice(0, 16)}`, decisionDigest };
}
