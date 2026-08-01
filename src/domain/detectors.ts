import { sha256 } from "@/domain/digest";

export type RequirementId = `CP-R${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

export type ControlFixture = {
  fixtureId: string;
  requirementId: RequirementId;
  controlKind: "NEGATIVE" | "POSITIVE";
  signals: Record<string, boolean | number | string>;
};

export type DetectorResult = {
  schemaVersion: "DetectorResult.v1";
  detectorId: `DET-${RequirementId}`;
  requirementId: RequirementId;
  fixtureId: string;
  decision: "PASS" | "REJECT";
  issueCodes: string[];
  trace: string[];
  evidenceDigest: string;
};

type Detector = {
  issueCode: string;
  valid: (signals: ControlFixture["signals"]) => boolean;
  trace: string;
};

const detectors: Record<RequirementId, Detector> = {
  "CP-R1": { issueCode: "CP_R1_REJECTED", trace: "bounded account authority", valid: (s) => s.accountBounded === true && s.regionNamed === true && s.ownerNamed === true && s.stopAuthorityNamed === true },
  "CP-R2": { issueCode: "CP_R2_REJECTED", trace: "source provenance and account binding", valid: (s) => s.authorized === true && s.digestVerified === true && s.accountMatch === true && s.fresh === true },
  "CP-R3": { issueCode: "CP_R3_REJECTED", trace: "restricted data classification", valid: (s) => s.policyResolved === true && s.secretPresent !== true && s.crossAccountData !== true },
  "CP-R4": { issueCode: "CP_R4_REJECTED", trace: "human decision authority", valid: (s) => s.humanOwnerNamed === true && s.autonomousExternalAction !== true },
  "CP-R5": { issueCode: "CP_R5_REJECTED", trace: "demo truth and manual-step disclosure", valid: (s) => s.syntheticLabeled === true && s.unsupportedClaim !== true && s.hiddenManualStep !== true },
  "CP-R6": { issueCode: "CP_R6_REJECTED", trace: "expected-set and conflict visibility", valid: (s) => s.correctRegion === true && s.conflictVisible === true && s.expectedCount === s.observedCount },
  "CP-R7": { issueCode: "CP_R7_REJECTED", trace: "supported account finding", valid: (s) => s.schemaComplete === true && s.citationsValid === true && s.findingSupported === true },
  "CP-R8": { issueCode: "CP_R8_REJECTED", trace: "independent exact-version review", valid: (s) => s.reviewerIndependent === true && s.exactVersion === true && s.evidenceVisible === true },
  "CP-R9": { issueCode: "CP_R9_REJECTED", trace: "baseline denominator and cost integrity", valid: (s) => s.baselineDeclared === true && s.costComplete === true && s.expectedCount === s.observedCount },
  "CP-R10": { issueCode: "CP_R10_REJECTED", trace: "adoption requires competent workflow use", valid: (s) => s.competencyPassed === true && s.workflowUsed === true && s.ownerAccepted === true },
  "CP-R11": { issueCode: "CP_R11_REJECTED", trace: "silent-success and reconciliation guard", valid: (s) => Number(s.inputCount) > 0 && s.positiveControlPassed === true && s.negativeControlPassed === true && s.reconciled === true && s.idempotent === true },
  "CP-R12": { issueCode: "CP_R12_REJECTED", trace: "de-identified reproduced product learning", valid: (s) => s.deidentified === true && Number(s.syntheticReproductions) >= 2 && s.productOwnerNamed === true },
};

export function evaluateControl(fixture: ControlFixture): DetectorResult {
  const detector = detectors[fixture.requirementId];
  const detectorId = `DET-${fixture.requirementId}` as const;
  const valid = detector.valid(fixture.signals);
  const base = {
    schemaVersion: "DetectorResult.v1" as const,
    detectorId,
    requirementId: fixture.requirementId,
    fixtureId: fixture.fixtureId,
    decision: valid ? ("PASS" as const) : ("REJECT" as const),
    issueCodes: valid ? [] : [detector.issueCode],
    trace: [detector.trace, valid ? "CONTROL_PASSED" : "FAIL_CLOSED"],
  };
  return { ...base, evidenceDigest: sha256(base) };
}
