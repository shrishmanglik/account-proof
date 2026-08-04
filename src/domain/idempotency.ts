import type { AccountHealthReviewRequest } from "@/domain/contracts";
import { sha256 } from "@/domain/digest";

type ReviewOperation = Omit<AccountHealthReviewRequest, "idempotencyKey">;

export function createReviewIdempotencyKey(operation: ReviewOperation): string {
  const digest = sha256(operation);
  return `${operation.account.accountId}:review:${digest.slice(0, 24)}`;
}
