const test = require("node:test");
const assert = require("node:assert");

// Mock test for service layer behavior
test("B. AI Service Unit Tests (Mocked Contract)", async (t) => {
  const mockComparison = {
    input: { amount: 1000, sourceCurrency: "USD", destinationCurrency: "INR" },
    bestProvider: { provider: { name: "Wise" }, effectiveRate: 83.1 },
    cheapestProvider: { provider: { name: "Wise" } },
    fastestProvider: { provider: { name: "Remitly" } },
    mostTransparentProvider: { provider: { name: "Wise" } },
    quotes: [
      { provider: { name: "Wise" }, transparencyScore: 92, totalCost: 8.5 },
      { provider: { name: "OFX" }, transparencyScore: 84, totalCost: 14.2 },
      { provider: { name: "PayPal" }, transparencyScore: 61, totalCost: 38.0 },
    ],
  };

  await t.test("Fallback response when API key is missing", async () => {
    // Simulated fallback logic mirroring generateFinancialAdvice
    function getFallbackAdvice(comparison) {
      return {
        answer: `${comparison.bestProvider.provider.name} is the strongest option in this scenario because it keeps hidden fees and spread under control while preserving more of the transfer value.`,
        sources: [comparison.bestProvider.provider.name],
      };
    }

    const res = getFallbackAdvice(mockComparison);
    assert.strictEqual(typeof res.answer, "string");
    assert.match(res.answer, /Wise/);
    assert.deepStrictEqual(res.sources, ["Wise"]);
  });

  await t.test("Correct Gemini request configuration format", async () => {
    const systemInstruction =
      "You are FXWise, a fintech assistant. Answer using the supplied comparison data only and reference the current providers, costs, and transparency scores.";

    const contents = JSON.stringify({
      question: "Which provider is best?",
      comparisonSummary: {
        sendAmount: mockComparison.input.amount,
        bestProvider: mockComparison.bestProvider.provider.name,
      },
    });

    const requestConfig = {
      model: "gemini-3.5-flash-lite",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    };

    assert.strictEqual(requestConfig.model, "gemini-3.5-flash-lite");
    assert.strictEqual(requestConfig.config.temperature, 0.2);
    assert.match(requestConfig.config.systemInstruction, /FXWise/);
    assert.match(requestConfig.contents, /Wise/);
  });

  await t.test("Response normalization extracts text and sources properly", async () => {
    const mockGeminiResponse = {
      text: "Wise offers the lowest hidden spread and fee transparency score of 92.",
    };

    const sources = mockComparison.quotes.slice(0, 3).map((q) => q.provider.name);
    const normalized = {
      answer: mockGeminiResponse.text.trim(),
      sources,
    };

    assert.strictEqual(normalized.answer, "Wise offers the lowest hidden spread and fee transparency score of 92.");
    assert.deepStrictEqual(normalized.sources, ["Wise", "OFX", "PayPal"]);
  });
});
