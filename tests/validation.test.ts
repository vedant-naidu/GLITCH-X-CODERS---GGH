import { describe, expect, it } from "vitest";
import { comparisonInputSchema } from "@/lib/validation/calc-schema";

describe("Phase 1: Input Validation & Boundaries (V1, V2, V3)", () => {
  const validBase = {
    amount: 1000,
    sourceCurrency: "USD",
    destinationCurrency: "INR",
    sourceCountry: "United States",
    destinationCountry: "India",
    purpose: "education" as const,
    persona: "student" as const,
  };

  describe("Amount Boundary Tests (V1)", () => {
    it("accepts valid normal amounts", () => {
      const result = comparisonInputSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("rejects amount = 0 with a clear validation error", () => {
      const result = comparisonInputSchema.safeParse({ ...validBase, amount: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.some((i) => i.path.includes("amount"))).toBe(true);
      }
    });

    it("rejects negative amounts", () => {
      const result = comparisonInputSchema.safeParse({ ...validBase, amount: -1500 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("greater than zero"))).toBe(true);
      }
    });

    it("rejects non-numeric NaN and string amounts", () => {
      const resultNaN = comparisonInputSchema.safeParse({ ...validBase, amount: NaN });
      expect(resultNaN.success).toBe(false);

      const resultString = comparisonInputSchema.safeParse({ ...validBase, amount: "invalid" as unknown as number });
      expect(resultString.success).toBe(false);
    });

    it("rejects huge amounts exceeding the ₹10 crore boundary (100,000,001)", () => {
      const hugeAmount = 100_000_001;
      const result = comparisonInputSchema.safeParse({ ...validBase, amount: hugeAmount });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("₹10 crore limit"))).toBe(true);
      }
    });

    it("accepts amount right at the ₹10 crore ceiling (100,000,000)", () => {
      const ceilingAmount = 100_000_000;
      const result = comparisonInputSchema.safeParse({ ...validBase, amount: ceilingAmount });
      expect(result.success).toBe(true);
    });
  });

  describe("Distinct Currency Pair Tests (V2)", () => {
    it("rejects identical source and destination currencies (e.g. USD to USD)", () => {
      const sameCurrency = {
        ...validBase,
        sourceCurrency: "USD",
        destinationCurrency: "USD",
      };
      const result = comparisonInputSchema.safeParse(sameCurrency);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("must be different"))).toBe(true);
      }
    });

    it("accepts distinct valid currency pairs (e.g. EUR to INR)", () => {
      const result = comparisonInputSchema.safeParse({
        ...validBase,
        sourceCurrency: "EUR",
        destinationCurrency: "INR",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Unsupported Currencies (V3)", () => {
    it("rejects currencies unsupported by ECB like AED, NGN, PKR with helpful messages", () => {
      const testCases = ["AED", "NGN", "PKR"];
      for (const curr of testCases) {
        const result = comparisonInputSchema.safeParse({
          ...validBase,
          sourceCurrency: curr,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some((i) => i.message.includes("not supported by the ECB"))).toBe(true);
        }
      }
    });
  });
});
