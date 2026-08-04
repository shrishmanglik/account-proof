import type { ControlFixture, RequirementId } from "@/domain/detectors";

type FixturePair = { requirementId: RequirementId; issueCode: string; bad: ControlFixture; good: ControlFixture };

function pair(requirementId: RequirementId, issueCode: string, bad: ControlFixture["signals"], good: ControlFixture["signals"]): FixturePair {
  return {
    requirementId,
    issueCode,
    bad: { fixtureId: `${requirementId}-BAD-SYNTHETIC`, requirementId, controlKind: "NEGATIVE", signals: bad },
    good: { fixtureId: `${requirementId}-GOOD-SYNTHETIC`, requirementId, controlKind: "POSITIVE", signals: good },
  };
}

export const controlFixtures: FixturePair[] = [
  pair("CP-R1", "CP_R1_REJECTED", { accountBounded: false, regionNamed: false, ownerNamed: false, stopAuthorityNamed: false }, { accountBounded: true, regionNamed: true, ownerNamed: true, stopAuthorityNamed: true }),
  pair("CP-R2", "CP_R2_REJECTED", { authorized: false, digestVerified: false, accountMatch: false, fresh: false }, { authorized: true, digestVerified: true, accountMatch: true, fresh: true }),
  pair("CP-R3", "CP_R3_REJECTED", { policyResolved: false, secretPresent: true, crossAccountData: true }, { policyResolved: true, secretPresent: false, crossAccountData: false }),
  pair("CP-R4", "CP_R4_REJECTED", { humanOwnerNamed: false, autonomousExternalAction: true }, { humanOwnerNamed: true, autonomousExternalAction: false }),
  pair("CP-R5", "CP_R5_REJECTED", { syntheticLabeled: false, unsupportedClaim: true, hiddenManualStep: true }, { syntheticLabeled: true, unsupportedClaim: false, hiddenManualStep: false }),
  pair("CP-R6", "CP_R6_REJECTED", { correctRegion: false, conflictVisible: false, expectedCount: 5, observedCount: 1 }, { correctRegion: true, conflictVisible: true, expectedCount: 5, observedCount: 5 }),
  pair("CP-R7", "CP_R7_REJECTED", { schemaComplete: false, citationsValid: false, findingSupported: false }, { schemaComplete: true, citationsValid: true, findingSupported: true }),
  pair("CP-R8", "CP_R8_REJECTED", { reviewerIndependent: false, exactVersion: false, evidenceVisible: false }, { reviewerIndependent: true, exactVersion: true, evidenceVisible: true }),
  pair("CP-R9", "CP_R9_REJECTED", { baselineDeclared: false, costComplete: false, expectedCount: 310, observedCount: 10 }, { baselineDeclared: true, costComplete: true, expectedCount: 5, observedCount: 5 }),
  pair("CP-R10", "CP_R10_REJECTED", { competencyPassed: false, workflowUsed: false, ownerAccepted: false }, { competencyPassed: true, workflowUsed: true, ownerAccepted: true }),
  pair("CP-R11", "CP_R11_REJECTED", { inputCount: 0, positiveControlPassed: false, negativeControlPassed: false, reconciled: false, idempotent: false }, { inputCount: 5, positiveControlPassed: true, negativeControlPassed: true, reconciled: true, idempotent: true }),
  pair("CP-R12", "CP_R12_REJECTED", { deidentified: false, syntheticReproductions: 1, productOwnerNamed: false }, { deidentified: true, syntheticReproductions: 2, productOwnerNamed: true }),
];
