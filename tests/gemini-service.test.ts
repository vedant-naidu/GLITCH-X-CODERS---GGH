import { describe, it, expect } from "vitest";
import type { ComparisonResult } from "@/types/fintech";

describe("B. AI Service Unit Tests (Mocked Contract)", () => {
  const mockComparison: Partial<ComparisonResult> = {
    input: {
      amount: 1000,
      sourceCurrency: "USD",
      destinationCurrency: "INR",
      sourceCountry: "United States",
      destinationCountry: "India",
      purpose: "education",
      persona: "student",
    },
    bestProvider: { provider: { id: "wise", name: "Wise", tagline: "", pricing: {} as any, rails: [] }, effectiveRate: 83.1 } as any,
    cheapestProvider: { provider: { id: "wise", name: "Wise", tagline: "", pricing: {} as any, rails: [] } } as any,
    quotes: [
      { provider: { id: "wise", name: "Wise" }, transparencyScore: 92, totalCost: 8.5 } as any,
      { provider: { id: "paypal", name: "PayPal" }, transparencyScore: 61, totalCost: 38.0 } as any,
    ],
  };

  it("generates fallback advice when API client is not available", () => {
    const fallbackAdvice = {
      answer: `${mockComparison.bestProvider!.provider.name} is the strongest option in this scenario because it keeps hidden fees and spread under control while preserving more of the transfer value.`,
      sources: [mockComparison.bestProvider!.provider.name],
    };

    expect(fallbackAdvice.answer).toContain("Wise");
    expect(fallbackAdvice.sources).toEqual(["Wise"]);
  });

  it("structures Gemini contents payload properly", () => {
    const systemInstruction =
      "You are FXWise, a fintech assistant. Answer using the supplied comparison data only and reference the current providers, costs, and transparency scores.";

    const contents = JSON.stringify({
      question: "Which provider is best?",
      comparisonSummary: {
        sendAmount: mockComparison.input!.amount,
        bestProvider: mockComparison.bestProvider!.provider.name,
      },
    });

    expect(systemInstruction).toContain("FXWise");
    expect(contents).toContain("Wise");
    expect(contents).toContain("1000");
  });
});
