import { describe, expect, it } from "vitest";
import { formatObservedAt } from "@/domain/time";

describe("evidence timestamp rendering", () => {
  it("renders the same explicit UTC text on server and browser runtimes", () => {
    expect(formatObservedAt("2026-07-31T14:00:00.000Z")).toBe("2026-07-31 14:00 UTC");
  });
});
