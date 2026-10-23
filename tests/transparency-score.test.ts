import { describe, expect, it } from "vitest";
import { quoteProvider, getTransparencyBand } from "@/utils/finance";
import { ProviderDefinition } from "@/types/fintech";

describe("Phase 3: Transparency Score Calibration (V10)", () => {
  it("ensures a provider with zero upfront fees but a 3% hidden markup scores below 'Good' (score < 72)", () => {
    // Artificial provider with 0 fees, high clarity, and high speed, but 3.0% hidden markup
    const zeroFeeHighMarkupProvider: ProviderDefinition = {
      id: "airwallex-style", // placeholder id
      name: "Zero Fee Hidden Markup Bank",
      tagline: "Claims zero fees upfront",
      category: "bank",
      pricing: {
        exchangeMarkup: 0.03, // 3% markup!
        hiddenForexSpread: 0.0,
        fixedFee: 0,
        percentageFee: 0,
        gstRate: 0.18,
        processingFee: 0,
        deliveryTimeDays: [0, 1],
        feeClarity: 100, // even with high clarity
        speedScore: 100, // even with high speed
        personaFit: { student: 50, freelancer: 50, traveler: 50, business: 50 },
      },
      rails: ["Bank transfer"],
      sourceUrl: "https://example.com/pricing",
      lastVerifiedAt: "2026-10-23",
      isMarkupEstimate: false,
    };

    const quote = quoteProvider(
      zeroFeeHighMarkupProvider,
      {
        amount: 1000,
        sourceCurrency: "USD",
        destinationCurrency: "INR",
        sourceCountry: "United States",
        destinationCountry: "India",
        purpose: "education",
        persona: "student",
      },
      83.0,
    );

    // V10 gate condition: Must score below "Good" (threshold for Good is 72)
    expect(quote.transparencyScore).toBeLessThan(72);
    expect(quote.transparencyBand).not.toBe("good");
    expect(quote.transparencyBand).not.toBe("excellent");
  });

  it("assigns 'excellent' band only to highly transparent providers with low markup", () => {
    const excellentBandMin = 86;
    expect(getTransparencyBand(excellentBandMin)).toBe("excellent");
    expect(getTransparencyBand(72)).toBe("good");
    expect(getTransparencyBand(71)).toBe("average");
    expect(getTransparencyBand(55)).toBe("poor");
  });
});
