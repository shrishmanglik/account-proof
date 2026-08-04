import { z } from "zod";

export const EvidenceSystemSchema = z.enum([
  "CRM",
  "SUPPORT",
  "DEPLOYMENT",
  "CUSTOMER",
  "RENEWAL",
]);

export const SignalStatusSchema = z.enum(["GREEN", "AMBER", "RED", "UNKNOWN"]);

export const EvidenceItemSchema = z.object({
  evidenceId: z.string().min(1),
  accountId: z.string().min(1),
  system: EvidenceSystemSchema,
  status: SignalStatusSchema,
  observedAt: z.string().datetime(),
  ownerRole: z.string().min(1),
  summary: z.string().min(1),
  sourceVersion: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  synthetic: z.literal(true),
  authorized: z.literal(true),
});

export const AccountHealthReviewRequestSchema = z.object({
  schemaVersion: z.literal("AccountHealthReviewRequest.v1"),
  account: z.object({
    accountId: z.string().min(1),
    displayName: z.string().min(1),
    region: z.string().min(1),
    tamOwnerRole: z.string().min(1),
    businessOwnerRole: z.string().min(1),
    customerOwnerRole: z.string().min(1),
    stopAuthorityRole: z.string().min(1),
    reviewAuthorId: z.string().min(1),
  }),
  expectedSystems: z.array(EvidenceSystemSchema).length(5).refine(
    (systems) => new Set(systems).size === 5,
    "Each expected evidence system must appear exactly once.",
  ),
  evidence: z.array(EvidenceItemSchema).max(25),
  evaluationTime: z.string().datetime(),
  freshnessWindowDays: z.number().int().positive().max(90),
  idempotencyKey: z.string().min(12),
});

export type AccountHealthReviewRequest = z.infer<typeof AccountHealthReviewRequestSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type EvidenceSystem = z.infer<typeof EvidenceSystemSchema>;
export type SignalStatus = z.infer<typeof SignalStatusSchema>;

export const ReviewStateSchema = z.enum(["READY_FOR_REVIEW", "ESCALATION_REQUIRED", "HELD_INCOMPLETE"]);
export type ReviewState = z.infer<typeof ReviewStateSchema>;

export const HealthFindingSchema = z.object({
  code: z.enum(["FALSE_GREEN_ACCOUNT", "EXPECTED_SOURCE_MISSING", "STALE_EVIDENCE", "RENEWAL_RISK"]),
  severity: z.enum(["HIGH", "MEDIUM"]),
  title: z.string().min(1),
  explanation: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)),
});
export type HealthFinding = z.infer<typeof HealthFindingSchema>;

export const AccountHealthReviewReceiptSchema = z.object({
  schemaVersion: z.literal("AccountHealthReviewReceipt.v1"),
  receiptId: z.string().regex(/^review_[a-f0-9]{16}$/),
  receiptDigest: z.string().regex(/^[a-f0-9]{64}$/),
  inputDigest: z.string().regex(/^[a-f0-9]{64}$/),
  idempotencyKey: z.string().min(12),
  rulesVersion: z.literal("account-health-rules/1.0.0"),
  accountId: z.string().min(1),
  state: ReviewStateSchema,
  findings: z.array(HealthFindingSchema),
  citations: z.array(z.object({
    evidenceId: z.string().min(1),
    system: EvidenceSystemSchema,
    status: SignalStatusSchema,
    observedAt: z.string().datetime(),
    sourceVersion: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })),
  stageCounts: z.object({
    expected: z.number().int().nonnegative(),
    observed: z.number().int().nonnegative(),
    accepted: z.number().int().nonnegative(),
    missing: z.number().int().nonnegative(),
    stale: z.number().int().nonnegative(),
  }),
  decisionTrace: z.array(z.string().min(1)),
  unresolvedUnknowns: z.array(z.string().min(1)),
  humanAuthority: z.literal("REVIEW_REQUIRED"),
  authoredBy: z.string().min(1),
  authorizedExternalAction: z.literal(false),
  nextAction: z.string().min(1),
});
export type AccountHealthReviewReceipt = z.infer<typeof AccountHealthReviewReceiptSchema>;

export const HumanDecisionRequestSchema = z.object({
  reviewReceipt: AccountHealthReviewReceiptSchema,
  reviewerId: z.string().min(1),
  reviewerRole: z.enum(["ACCOUNT_OWNER", "SUPPORT_OWNER", "BUSINESS_OWNER"]),
  decision: z.enum(["ACCEPT", "HOLD", "ESCALATE"]),
  rationale: z.string().min(12).max(500),
  reviewedDigest: z.string().length(64),
  acknowledgedEvidence: z.literal(true),
});

export type HumanDecisionRequest = z.infer<typeof HumanDecisionRequestSchema>;

export type HumanDecisionReceipt = {
  schemaVersion: "HumanDecisionReceipt.v1";
  decisionReceiptId: string;
  decisionDigest: string;
  reviewReceiptDigest: string;
  reviewerId: string;
  reviewerRole: HumanDecisionRequest["reviewerRole"];
  decision: HumanDecisionRequest["decision"];
  rationale: string;
  state: "RECORDED";
  authorizedExternalAction: false;
  nextAction: string;
};
