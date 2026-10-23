import { describe, expect, it } from "vitest";
import { calculateRemittance } from "@/lib/calc-engine";

describe("Phase 1: Calculation Engine (B1 Gate Fixture & Property Tests)", () => {
  it("passes the mandatory plan gate fixture: ₹1,00,000 INR at 83.00 with 2.8% markup", () => {
    // Gate test fixture from Development Plan (line 86):
    // amount ₹1,00,000, fixed fee 0, mid-market 83.00, markup 2.8%
    // must give effective rate 85.324, amount received ≈ 1,172.0 USD, markup loss ≈ ₹2,724 (B1).
    const result = calculateRemittance({
      amount: 100_000,
      midMarketRate: 83.0,
      exchangeMarkup: 0.028, // 2.8%
      fixedFee: 0,
      percentageFee: 0,
      processingFee: 0,
      gstRate: 0,
      isRateSourcePerTarget: true, // INR to USD (source INR per 1 target USD)
    });

    // 1. Effective rate = 83.00 * (1 + 0.028) = 85.324
    expect(result.effectiveRate).toBeCloseTo(85.324, 3);

    // 2. Amount received = 100,000 / 85.324 = 1,172.003 USD (~1,172.0 USD)
    expect(result.amountReceived).toBeCloseTo(1172.0, 1);

    // 3. Markup loss in source currency = 100,000 * 0.028 / (1 + 0.028) = 2,723.74 (~₹2,724)
    expect(result.markupLoss).toBeCloseTo(2723.74, 1);
    expect(Math.round(result.markupLoss)).toBe(2724);
  });

  describe("Property tests (Gate test 87)", () => {
    it("ensures effective rate is strictly worse than mid-market when markup m > 0", () => {
      // Inbound mode (Target per Source e.g. USD -> INR): effective rate is lower (fewer INR per USD)
      const inbound = calculateRemittance({
        amount: 1000,
        midMarketRate: 83.0,
        exchangeMarkup: 0.02,
        isRateSourcePerTarget: false,
      });
      expect(inbound.effectiveRate).toBeLessThan(inbound.midMarketRate);

      // Outbound mode (Source per Target e.g. INR -> USD): effective rate is higher (more INR per USD)
      const outbound = calculateRemittance({
        amount: 50000,
        midMarketRate: 83.0,
        exchangeMarkup: 0.02,
        isRateSourcePerTarget: true,
      });
      expect(outbound.effectiveRate).toBeGreaterThan(outbound.midMarketRate);
    });

    it("ensures markup loss equals exactly zero when markup m = 0", () => {
      const zeroMarkupOutbound = calculateRemittance({
        amount: 100_000,
        midMarketRate: 83.0,
        exchangeMarkup: 0,
        isRateSourcePerTarget: true,
      });
      expect(zeroMarkupOutbound.markupLoss).toBe(0);
      expect(zeroMarkupOutbound.effectiveRate).toBe(83.0);

      const zeroMarkupInbound = calculateRemittance({
        amount: 1000,
        midMarketRate: 83.0,
        exchangeMarkup: 0,
        isRateSourcePerTarget: false,
      });
      expect(zeroMarkupInbound.markupLoss).toBe(0);
      expect(zeroMarkupInbound.effectiveRate).toBe(83.0);
    });

    it("ensures amount received is never negative even with extreme fees", () => {
      const excessiveFees = calculateRemittance({
        amount: 100,
        midMarketRate: 83.0,
        exchangeMarkup: 0.05,
        fixedFee: 500, // fees exceed principal
        isRateSourcePerTarget: true,
      });
      expect(excessiveFees.amountReceived).toBe(0);
      expect(excessiveFees.netTransferAmountSource).toBe(0);
    });

    it("properly accounts for GST on fees and processing charges", () => {
      const withTax = calculateRemittance({
        amount: 10_000,
        midMarketRate: 83.0,
        exchangeMarkup: 0.01,
        fixedFee: 100,
        processingFee: 50,
        gstRate: 0.18, // 18% GST on services
        isRateSourcePerTarget: true,
      });

      // Service fees: 100 + 50 = 150
      // GST: 150 * 0.18 = 27
      // Total source fees = 177
      expect(withTax.gstAmount).toBe(27);
      expect(withTax.totalFeesSource).toBe(177);
      expect(withTax.netTransferAmountSource).toBe(10_000 - 177);
    });
  });
});
