import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("rendered workspace accessibility contract", () => {
  const source = readFileSync("src/components/account-workspace.tsx", "utf8");

  it("uses semantic landmarks and a status live region", () => {
    expect(source).toContain("<main");
    expect(source).toContain("<nav");
    expect(source).toContain('aria-live="polite"');
  });

  it("offers explicit evidence and decision labels", () => {
    expect(source).toContain("Evidence receipt");
    expect(source).toContain("Human authority");
    expect(source).toContain("Record escalation decision");
  });
});
