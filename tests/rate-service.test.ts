import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRateCache, getExchangeRate } from "@/lib/rate-service";

describe("Phase 1: Rate Service & Resilience (B11, V3, V4)", () => {
  beforeEach(() => {
    clearRateCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearRateCache();
    vi.restoreAllMocks();
  });

  it("successfully fetches live rate with valid 'as of' date (B11)", async () => {
    const mockResponse = {
      amount: 1,
      base: "USD",
      date: "2026-10-23",
      rates: { INR: 83.45 },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await getExchangeRate("USD", "INR", { skipCache: true });

    expect(result.rate).toBe(83.45);
    expect(result.date).toBe("2026-10-23");
    expect(result.asOf).toBe("2026-10-23");
    expect(result.isStale).toBe(false);
    expect(result.source).toBe("live");
  });

  it("handles identical currency pair immediately without network call", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await getExchangeRate("USD", "USD");

    expect(result.rate).toBe(1);
    expect(result.isStale).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects unsupported currencies like AED and PKR with typed error (V3)", async () => {
    await expect(getExchangeRate("AED", "INR")).rejects.toMatchObject({
      code: "UNSUPPORTED_CURRENCY",
    });

    await expect(getExchangeRate("USD", "PKR")).rejects.toMatchObject({
      code: "UNSUPPORTED_CURRENCY",
    });
  });

  it("retries on first failure and falls back to cached baseline with isStale: true on total failure (V4)", async () => {
    // Both attempts fail (e.g. network disconnect or timeout)
    vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("Network timeout"))
      .mockRejectedValueOnce(new Error("Network timeout"));

    const result = await getExchangeRate("USD", "INR", {
      skipCache: true,
      timeoutMs: 50,
    });

    // Should return resilient fallback with isStale = true
    expect(result.isStale).toBe(true);
    expect(result.source).toBe("fallback");
    expect(result.rate).toBeGreaterThan(0);
    expect(result.asOf).toBeDefined();
    expect(result.staleReason).toContain("Live ECB rate unavailable after retry");
  });

  it("recovers on the second attempt when the first attempt fails (1 retry mechanism)", async () => {
    const mockResponse = {
      amount: 1,
      base: "EUR",
      date: "2026-10-23",
      rates: { USD: 1.085 },
    };

    vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("Transient connection error"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      );

    const result = await getExchangeRate("EUR", "USD", { skipCache: true });

    expect(result.rate).toBe(1.085);
    expect(result.isStale).toBe(false);
    expect(result.source).toBe("live");
  });

  it("uses in-memory cache on subsequent requests for the same currency pair", async () => {
    const mockResponse = {
      amount: 1,
      base: "USD",
      date: "2026-10-23",
      rates: { INR: 83.5 },
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const first = await getExchangeRate("USD", "INR");
    expect(first.rate).toBe(83.5);
    expect(first.source).toBe("live");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const second = await getExchangeRate("USD", "INR");
    expect(second.rate).toBe(83.5);
    expect(second.source).toBe("cache");
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Cached! No additional network fetch
  });
});
