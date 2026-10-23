import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent, formatRate } from "@/utils/format";
import { siteCopy } from "@/data/site-copy";

describe("Phase 0 — Baseline Smoke & Environment Verification", () => {
  it("utility formatters work correctly", () => {
    expect(formatCurrency(1000, "USD")).toContain("1,000");
    expect(formatPercent(0.025)).toBe("2.50%");
    expect(formatRate(83.25)).toBe("83.25");
  });

  it("site copy metadata is intact", () => {
    expect(siteCopy.title).toBeDefined();
    expect(siteCopy.subtitle).toBeDefined();
    expect(siteCopy.highlights.length).toBeGreaterThan(0);
  });
});
