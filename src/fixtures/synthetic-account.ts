import type { AccountHealthReviewRequest, EvidenceItem } from "@/domain/contracts";

const digest = (character: string) => character.repeat(64);

export const syntheticEvidence: EvidenceItem[] = [
  { evidenceId: "EV-SYN-CRM-01", accountId: "acct-synthetic-0042", system: "CRM", status: "GREEN", observedAt: "2026-07-31T14:00:00.000Z", ownerRole: "Account executive", summary: "Renewal confidence is recorded as green; no linked exception is present.", sourceVersion: "crm-export/synthetic-v3", sha256: digest("a"), synthetic: true, authorized: true },
  { evidenceId: "EV-SYN-SUP-02", accountId: "acct-synthetic-0042", system: "SUPPORT", status: "RED", observedAt: "2026-08-01T12:00:00.000Z", ownerRole: "Support escalation manager", summary: "A severity-one synthetic case remains open with an unresolved customer-visible symptom.", sourceVersion: "support-export/synthetic-v5", sha256: digest("b"), synthetic: true, authorized: true },
  { evidenceId: "EV-SYN-DEP-03", accountId: "acct-synthetic-0042", system: "DEPLOYMENT", status: "AMBER", observedAt: "2026-08-01T10:30:00.000Z", ownerRole: "Deployment engineer", summary: "Three of four synthetic environment checks reconcile; one target readback is held.", sourceVersion: "deployment-receipt/synthetic-v2", sha256: digest("c"), synthetic: true, authorized: true },
  { evidenceId: "EV-SYN-CUS-04", accountId: "acct-synthetic-0042", system: "CUSTOMER", status: "RED", observedAt: "2026-08-01T13:20:00.000Z", ownerRole: "Customer technical owner", summary: "The synthetic customer confirms that the affected workflow is not restored.", sourceVersion: "customer-attestation/synthetic-v1", sha256: digest("d"), synthetic: true, authorized: true },
  { evidenceId: "EV-SYN-REN-05", accountId: "acct-synthetic-0042", system: "RENEWAL", status: "AMBER", observedAt: "2026-07-30T16:00:00.000Z", ownerRole: "Renewal owner", summary: "Renewal review is approaching; accepted risk disposition is not yet recorded.", sourceVersion: "renewal-register/synthetic-v4", sha256: digest("e"), synthetic: true, authorized: true },
];

export const syntheticAccountReviewRequest: AccountHealthReviewRequest = {
  schemaVersion: "AccountHealthReviewRequest.v1",
  account: {
    accountId: "acct-synthetic-0042",
    displayName: "Synthetic Account 0042",
    region: "Canada",
    tamOwnerRole: "Technical account manager",
    businessOwnerRole: "Customer success leader",
    customerOwnerRole: "Customer technical owner",
    stopAuthorityRole: "Head of technical account management",
    reviewAuthorId: "tam-workflow-author",
  },
  expectedSystems: ["CRM", "SUPPORT", "DEPLOYMENT", "CUSTOMER", "RENEWAL"],
  evidence: syntheticEvidence,
  evaluationTime: "2026-08-01T14:00:00.000Z",
  freshnessWindowDays: 14,
  idempotencyKey: "acct-synthetic-0042:review:2026-08-01:v1",
};
