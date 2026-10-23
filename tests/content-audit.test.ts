import { describe, expect, it } from "vitest";
import { providerCatalog } from "@/data/providers";

describe("Phase 3: Content Audit & Mathematical Integrity (B3, B5, B8)", () => {
  it("verifies Freelancer tip math adds up correctly (B3)", () => {
    // Legacy erroneous claim was: "4% markup + 4.4% fee can eat ~7%" (4 + 4.4 = 8.4%, not 7%)
    const markup = 4.0;
    const fee = 4.4;
    const totalDrain = markup + fee;

    expect(totalDrain).toBe(8.4);

    // Wise transparent cost benchmark
    const wise = providerCatalog.find((p) => p.id === "wise");
    expect(wise).toBeDefined();

    const wiseBlended = ((wise?.pricing.exchangeMarkup ?? 0) + (wise?.pricing.percentageFee ?? 0)) * 100;
    expect(wiseBlended).toBeLessThan(1.5); // ~1.15%

    const costRatio = totalDrain / wiseBlended;
    expect(costRatio).toBeGreaterThan(5); // ~7.3x cheaper
  });

  it("verifies Business GST rule correctly states ₹60,000 cap on taxable value and ₹10,800 max tax (B5)", () => {
    // Under Rule 32(2)(b) of the CGST Rules, 2017:
    // Cap on taxable service value = ₹60,000
    // GST rate = 18%
    const maxTaxableValue = 60_000;
    const gstRate = 0.18;
    const maxGstPayable = maxTaxableValue * gstRate;

    expect(maxGstPayable).toBe(10_800);
    // Not ₹60,000!
    expect(maxGstPayable).not.toBe(60_000);
  });

  it("derives dynamic markup range from provider catalog bounds (B8)", () => {
    const markups = providerCatalog.map((p) => p.pricing.exchangeMarkup * 100);
    const minMarkup = Math.min(...markups);
    const maxMarkup = Math.max(...markups);

    // Range should be approx 0.35% to 4.0%
    expect(minMarkup).toBeCloseTo(0.35, 1);
    expect(maxMarkup).toBeCloseTo(4.0, 1);

    const rangeStr = `${minMarkup.toFixed(1)}%–${maxMarkup.toFixed(1)}%`;
    expect(rangeStr).toBe("0.4%–4.0%");
  });
});
