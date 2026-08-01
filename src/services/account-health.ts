import {
  AccountHealthReviewRequestSchema,
  type AccountHealthReviewReceipt,
  type AccountHealthReviewRequest,
  type EvidenceSystem,
  type HealthFinding,
} from "@/domain/contracts";
import { sha256 } from "@/domain/digest";

const DAY_MS = 86_400_000;

export function runAccountHealthReview(raw: AccountHealthReviewRequest): AccountHealthReviewReceipt {
  const input = AccountHealthReviewRequestSchema.parse(raw);
  const inputDigest = sha256(input);
  const expectedKey = `${input.account.accountId}:review:`;
  if (!input.idempotencyKey.startsWith(expectedKey)) {
    throw new Error("Idempotency key does not match the bounded account operation.");
  }

  const bySystem = new Map<EvidenceSystem, (typeof input.evidence)[number]>();
  for (const evidence of input.evidence) {
    if (evidence.accountId !== input.account.accountId) throw new Error("Cross-account evidence is prohibited.");
    if (bySystem.has(evidence.system)) throw new Error(`Duplicate evidence system: ${evidence.system}`);
    bySystem.set(evidence.system, evidence);
  }

  const missing = input.expectedSystems.filter((system) => !bySystem.has(system));
  const evaluationMs = Date.parse(input.evaluationTime);
  const stale = input.evidence.filter(
    (item) => evaluationMs - Date.parse(item.observedAt) > input.freshnessWindowDays * DAY_MS,
  );
  const findings: HealthFinding[] = [];

  if (missing.length > 0) {
    findings.push({
      code: "EXPECTED_SOURCE_MISSING",
      severity: "HIGH",
      title: "The expected evidence set is incomplete",
      explanation: `Missing systems: ${missing.join(", ")}. A zero or partial read cannot close as healthy.`,
      evidenceIds: [],
    });
  }

  if (stale.length > 0) {
    findings.push({
      code: "STALE_EVIDENCE",
      severity: "HIGH",
      title: "Evidence is outside the freshness contract",
      explanation: "At least one source is too old for the declared review window.",
      evidenceIds: stale.map((item) => item.evidenceId),
    });
  }

  const crm = bySystem.get("CRM");
  const contradictory = input.evidence.filter(
    (item) => ["SUPPORT", "DEPLOYMENT", "CUSTOMER"].includes(item.system) && item.status !== "GREEN",
  );
  if (crm?.status === "GREEN" && contradictory.length > 0) {
    findings.push({
      code: "FALSE_GREEN_ACCOUNT",
      severity: "HIGH",
      title: "CRM is green while customer-operating evidence is not",
      explanation: "The nearby commercial status does not prove the customer-visible outcome. Reconciliation is required before the business review.",
      evidenceIds: [crm.evidenceId, ...contradictory.map((item) => item.evidenceId)],
    });
  }

  const renewal = bySystem.get("RENEWAL");
  if (renewal && renewal.status !== "GREEN") {
    findings.push({
      code: "RENEWAL_RISK",
      severity: "MEDIUM",
      title: "Renewal disposition remains unresolved",
      explanation: "Renewal evidence is held until the account owner accepts a risk disposition.",
      evidenceIds: [renewal.evidenceId],
    });
  }

  const state: AccountHealthReviewReceipt["state"] = missing.length > 0 || stale.length > 0
    ? "HELD_INCOMPLETE"
    : findings.some((finding) => finding.code === "FALSE_GREEN_ACCOUNT")
      ? "ESCALATION_REQUIRED"
      : "READY_FOR_REVIEW";

  const citations = input.evidence
    .map(({ evidenceId, system, status, observedAt, sourceVersion, sha256: digest }) => ({ evidenceId, system, status, observedAt, sourceVersion, sha256: digest }))
    .sort((left, right) => left.system.localeCompare(right.system));
  const base = {
    schemaVersion: "AccountHealthReviewReceipt.v1" as const,
    inputDigest,
    idempotencyKey: input.idempotencyKey,
    rulesVersion: "account-health-rules/1.0.0" as const,
    accountId: input.account.accountId,
    state,
    findings,
    citations,
    stageCounts: {
      expected: input.expectedSystems.length,
      observed: input.evidence.length,
      accepted: input.evidence.length - stale.length,
      missing: missing.length,
      stale: stale.length,
    },
    decisionTrace: [
      "Account boundary and named authorities validated",
      `Expected systems ${input.expectedSystems.length}; observed ${input.evidence.length}`,
      `Stale evidence ${stale.length}; missing systems ${missing.length}`,
      `CRM/customer-operating conflicts ${contradictory.length}`,
      `Terminal review state ${state}`,
    ],
    unresolvedUnknowns: [
      "Customer outcome is not independently verified",
      "Renewal outcome and commercial impact are unknown",
      "No live provider or customer system is connected",
    ],
    humanAuthority: "REVIEW_REQUIRED" as const,
    authoredBy: input.account.reviewAuthorId,
    authorizedExternalAction: false as const,
    nextAction: state === "HELD_INCOMPLETE"
      ? "Restore the missing or stale source receipt, then rerun the exact review."
      : state === "ESCALATION_REQUIRED"
        ? "A named account owner must reconcile support and customer evidence before the business review."
        : "A named account owner must review the exact receipt before any account decision.",
  };
  const receiptDigest = sha256(base);
  return { ...base, receiptId: `review_${receiptDigest.slice(0, 16)}`, receiptDigest };
}
