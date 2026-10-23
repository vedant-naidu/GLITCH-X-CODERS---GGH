import { describe, expect, it } from "vitest";
import { providerCatalog } from "@/data/providers";
import { ProviderCategory } from "@/types/fintech";

describe("Phase 2: Provider Data & Provenance (B12, B9, B7)", () => {
  const validCategories: ProviderCategory[] = [
    "bank",
    "forex_card",
    "wallet",
    "card_network",
    "remittance",
    "institutional",
  ];

  it("ensures every provider has a verifiable public sourceUrl and lastVerifiedAt date (B12)", () => {
    expect(providerCatalog.length).toBeGreaterThanOrEqual(12);

    for (const provider of providerCatalog) {
      // Must have valid HTTPS source URL
      expect(provider.sourceUrl, `Provider ${provider.id} missing sourceUrl`).toBeDefined();
      expect(provider.sourceUrl.startsWith("https://"), `Provider ${provider.id} sourceUrl must start with https://`).toBe(true);

      // Must have ISO date lastVerifiedAt
      expect(provider.lastVerifiedAt, `Provider ${provider.id} missing lastVerifiedAt`).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Must have valid category
      expect(validCategories).toContain(provider.category);

      // Must have notes or description
      expect(provider.notes).toBeDefined();
    }
  });

  it("verifies card networks are properly categorized and not standalone remittance providers (B7)", () => {
    const cardProviders = providerCatalog.filter((p) => p.id === "visa" || p.id === "mastercard");
    expect(cardProviders.length).toBe(2);

    for (const card of cardProviders) {
      expect(card.category).toBe("card_network");
      expect(card.name).toContain("Credit card");
      expect(card.tagline.toLowerCase()).toContain("card");
    }
  });

  it("verifies marketing claims are softened and factual (B9)", () => {
    const flywire = providerCatalog.find((p) => p.id === "flywire");
    expect(flywire).toBeDefined();
    expect(flywire?.tagline).not.toContain("3,500+ universities");
    expect(flywire?.tagline).not.toContain("zero markup");

    const niyo = providerCatalog.find((p) => p.id === "niyo-global");
    expect(niyo).toBeDefined();
    expect(niyo?.notes?.toLowerCase()).toContain("schedule");
  });

  it("has valid numerical pricing ranges across all providers", () => {
    for (const p of providerCatalog) {
      expect(p.pricing.exchangeMarkup).toBeGreaterThanOrEqual(0);
      expect(p.pricing.exchangeMarkup).toBeLessThan(0.10); // Less than 10%
      expect(p.pricing.feeClarity).toBeGreaterThanOrEqual(0);
      expect(p.pricing.feeClarity).toBeLessThanOrEqual(100);
      expect(p.pricing.speedScore).toBeGreaterThanOrEqual(0);
      expect(p.pricing.speedScore).toBeLessThanOrEqual(100);
    }
  });
});
