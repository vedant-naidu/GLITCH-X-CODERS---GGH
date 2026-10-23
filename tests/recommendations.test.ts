import { describe, expect, it } from "vitest";
import { getBestPersonaMatch, getPersonaNarrative } from "@/utils/recommendations";
import { buildComparisonResult, getPersonaRecommendedProvider } from "@/utils/finance";

describe("Phase 2: Persona Recommendations & Alignment (B4, B6)", () => {
  it("recommends Niyo Global as top traveler match ahead of credit cards (B4)", () => {
    const topTraveler = getPersonaRecommendedProvider("traveler");
    expect(topTraveler.id).toBe("niyo-global");
    expect(topTraveler.category).toBe("forex_card");

    // Credit cards should rank significantly lower than Niyo Global for travel
    const travelerComparison = buildComparisonResult({
      amount: 2000,
      sourceCurrency: "USD",
      destinationCurrency: "INR",
      sourceCountry: "United States",
      destinationCountry: "India",
      purpose: "travel",
      persona: "traveler",
    });

    const quotes = travelerComparison.quotes;
    const niyoIndex = quotes.findIndex((q) => q.provider.id === "niyo-global");
    const visaIndex = quotes.findIndex((q) => q.provider.id === "visa");
    const mastercardIndex = quotes.findIndex((q) => q.provider.id === "mastercard");

    expect(niyoIndex).toBeLessThan(visaIndex);
    expect(niyoIndex).toBeLessThan(mastercardIndex);
  });

  it("does NOT recommend Western Union as first choice for business persona (B6)", () => {
    const topBusiness = getPersonaRecommendedProvider("business");
    expect(topBusiness.id).not.toBe("western-union");
    expect(topBusiness.id).toBe("airwallex-style");

    const businessComparison = buildComparisonResult({
      amount: 15000,
      sourceCurrency: "USD",
      destinationCurrency: "INR",
      sourceCountry: "United States",
      destinationCountry: "India",
      purpose: "business",
      persona: "business",
    });

    // Best provider for business should be commercial/enterprise grade
    expect(businessComparison.bestProvider.provider.id).not.toBe("western-union");

    // Western union should be among the lowest ranked for business
    const wuIndex = businessComparison.quotes.findIndex((q) => q.provider.id === "western-union");
    expect(wuIndex).toBeGreaterThanOrEqual(businessComparison.quotes.length - 3);
  });

  it("recommends Flywire as top choice for student tuition", () => {
    const topStudent = getBestPersonaMatch("student");
    expect(topStudent.id).toBe("flywire");
    expect(topStudent.category).toBe("institutional");
  });

  it("recommends Wise as top choice for freelancer payouts", () => {
    const topFreelancer = getBestPersonaMatch("freelancer");
    expect(topFreelancer.id).toBe("wise");
    expect(topFreelancer.category).toBe("remittance");
  });

  it("provides informative persona narratives", () => {
    expect(getPersonaNarrative("student")).toContain("tuition");
    expect(getPersonaNarrative("freelancer")).toContain("earnings");
    expect(getPersonaNarrative("traveler")).toContain("card rails");
    expect(getPersonaNarrative("business")).toContain("high-value");
  });
});
