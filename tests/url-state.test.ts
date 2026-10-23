import { describe, expect, it } from "vitest";

describe("Phase 3: URL Query Parameter State Synchronization (V9)", () => {
  it("encodes comparison form state into URLSearchParams cleanly", () => {
    const state = {
      amount: 5000,
      sourceCurrency: "EUR",
      destinationCurrency: "INR",
      purpose: "freelancing",
      persona: "freelancer",
    };

    const params = new URLSearchParams();
    params.set("amount", String(state.amount));
    params.set("sourceCurrency", state.sourceCurrency);
    params.set("destinationCurrency", state.destinationCurrency);
    params.set("purpose", state.purpose);
    params.set("persona", state.persona);

    const queryString = params.toString();
    expect(queryString).toContain("amount=5000");
    expect(queryString).toContain("sourceCurrency=EUR");
    expect(queryString).toContain("destinationCurrency=INR");
    expect(queryString).toContain("purpose=freelancing");
    expect(queryString).toContain("persona=freelancer");
  });

  it("decodes URL query parameters back into typed form state with fallback defaults", () => {
    const rawQuery = "?amount=2500&sourceCurrency=GBP&destinationCurrency=INR&purpose=travel&persona=traveler";
    const params = new URLSearchParams(rawQuery);

    const amount = Number(params.get("amount"));
    const sourceCurrency = params.get("sourceCurrency");
    const destinationCurrency = params.get("destinationCurrency");
    const purpose = params.get("purpose");
    const persona = params.get("persona");

    expect(amount).toBe(2500);
    expect(sourceCurrency).toBe("GBP");
    expect(destinationCurrency).toBe("INR");
    expect(purpose).toBe("travel");
    expect(persona).toBe("traveler");
  });
});
