import { describe, expect, it } from "vitest";
import { evaluateControl } from "@/domain/detectors";
import { controlFixtures } from "@/fixtures/control-fixtures";

describe("the 12 deterministic account-proof controls", () => {
  for (const pair of controlFixtures) {
    it(`${pair.requirementId} rejects the bad fixture and passes the clean fixture`, () => {
      const bad = evaluateControl(pair.bad);
      const good = evaluateControl(pair.good);

      expect(bad.decision).toBe("REJECT");
      expect(bad.issueCodes).toContain(pair.issueCode);
      expect(good.decision).toBe("PASS");
      expect(good.issueCodes).toEqual([]);
    });

    it(`${pair.requirementId} is identical on a second run`, () => {
      expect(evaluateControl(pair.bad)).toEqual(evaluateControl(pair.bad));
      expect(evaluateControl(pair.good)).toEqual(evaluateControl(pair.good));
    });
  }
});
