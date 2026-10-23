/**
 * FXWise Core Calculation Engine
 * 
 * Single source of truth for financial math, effective rates, fees, GST,
 * markup loss, and total delivered amounts.
 * 
 * Formal Definitions & Formulas:
 * -------------------------------------------------------------
 * Let:
 *   A = Transfer amount in source currency
 *   m = Exchange markup as decimal (e.g. 0.028 for 2.8%)
 *   r = Mid-market exchange rate
 *   F = Total upfront fees (fixed + percentage fee + processing + GST)
 * 
 * Mode 1: Outbound remittance from high-denomination to low-denomination currency
 * (e.g. INR -> USD, where r is expressed as source currency units per 1 target unit, e.g. 83.00 INR/USD):
 *   Effective rate = r * (1 + m)   (Markup increases the cost per foreign unit)
 *   Amount received = (A - F) / effectiveRate
 *   Markup loss in source = (A - F) * m / (1 + m)
 * 
 * Gate Fixture:
 *   A = 100,000 INR, F = 0, r = 83.00, m = 0.028 (2.8%)
 *   effectiveRate = 83.00 * (1 + 0.028) = 85.324
 *   amountReceived = 100,000 / 85.324 = 1,172.003 USD (~1,172.0 USD)
 *   markupLoss = 100,000 * 0.028 / 1.028 = 2,723.74 INR (~2,724 INR)
 * 
 * Mode 2: Inbound remittance from major currency to domestic currency
 * (e.g. USD -> INR, where r is expressed as destination units per 1 source unit, e.g. 83.00 INR/USD):
 *   Effective rate = r * (1 - m)   (Markup reduces the foreign units delivered to recipient)
 *   Amount received = (A - F_source) * effectiveRate
 *   Markup loss in destination = (A - F_source) * r * m
 */

export interface CalculationInput {
  amount: number;
  midMarketRate: number;
  exchangeMarkup: number; // decimal, e.g. 0.015 for 1.5%
  fixedFee?: number; // in source currency
  percentageFee?: number; // decimal, e.g. 0.005 for 0.5%
  processingFee?: number; // in source currency
  gstRate?: number; // decimal, e.g. 0.18 for 18% GST on services
  hiddenForexSpread?: number; // decimal, optional extra hidden spread
  isRateSourcePerTarget?: boolean; // true if rate r is SourceCurrency/TargetCurrency (e.g. INR per 1 USD)
}

export interface CalculationResult {
  amount: number;
  midMarketRate: number;
  effectiveRate: number;
  advertisedRate: number;
  fixedFee: number;
  percentageFeeAmount: number;
  processingFee: number;
  gstAmount: number;
  totalFeesSource: number;
  netTransferAmountSource: number;
  amountReceived: number;
  markupLoss: number;
  spreadLoss: number;
  totalCost: number;
  effectiveMarkupPercent: number;
}

export function calculateRemittance(input: CalculationInput): CalculationResult {
  const amount = Math.max(0, input.amount);
  const midMarketRate = input.midMarketRate > 0 ? input.midMarketRate : 1;
  const markup = Math.max(0, input.exchangeMarkup);
  const spread = Math.max(0, input.hiddenForexSpread ?? 0);
  const fixedFee = Math.max(0, input.fixedFee ?? 0);
  const percentageFee = Math.max(0, input.percentageFee ?? 0);
  const processingFee = Math.max(0, input.processingFee ?? 0);
  const gstRate = Math.max(0, input.gstRate ?? 0);

  // Fee calculations in source currency
  const percentageFeeAmount = amount * percentageFee;
  const serviceFees = fixedFee + percentageFeeAmount + processingFee;
  const gstAmount = serviceFees * gstRate;
  const totalFeesSource = serviceFees + gstAmount;

  // Net amount converted after deducting source-side fees
  const netTransferAmountSource = Math.max(0, amount - totalFeesSource);

  const totalMarkup = markup + spread;

  if (input.isRateSourcePerTarget) {
    // Mode 1: Rate is Source Currency per 1 Target Unit (e.g. 83.00 INR per 1 USD)
    // Markup makes the rate higher (worse for buyer): 83 * 1.028 = 85.324
    const advertisedRate = midMarketRate * (1 + markup);
    const effectiveRate = midMarketRate * (1 + totalMarkup);

    const amountReceived = effectiveRate > 0 ? netTransferAmountSource / effectiveRate : 0;
    
    // markupLoss in source currency = netSource * (markup / (1 + markup))
    const markupLoss = totalMarkup > 0 ? (netTransferAmountSource * markup) / (1 + markup) : 0;
    const spreadLoss = spread > 0 ? (netTransferAmountSource * spread) / (1 + totalMarkup) : 0;

    // Total cost in source currency: fees + total hidden markup/spread loss
    const totalCost = totalFeesSource + (netTransferAmountSource * totalMarkup) / (1 + totalMarkup);

    return {
      amount,
      midMarketRate,
      effectiveRate,
      advertisedRate,
      fixedFee,
      percentageFeeAmount,
      processingFee,
      gstAmount,
      totalFeesSource,
      netTransferAmountSource,
      amountReceived,
      markupLoss,
      spreadLoss,
      totalCost,
      effectiveMarkupPercent: totalMarkup * 100,
    };
  } else {
    // Mode 2: Rate is Target Currency per 1 Source Unit (e.g. 83.00 INR per 1 USD when sending USD)
    // Markup makes the rate lower (worse for seller): 83 * (1 - 0.028) = 80.676
    const advertisedRate = midMarketRate * (1 - markup);
    const effectiveRate = midMarketRate * (1 - totalMarkup);

    const amountReceived = netTransferAmountSource * effectiveRate;
    const markupLoss = netTransferAmountSource * midMarketRate * markup;
    const spreadLoss = netTransferAmountSource * midMarketRate * spread;

    // Ideal received amount at zero fees and zero markup
    const idealReceived = amount * midMarketRate;
    const totalCostInTarget = idealReceived - amountReceived;
    const totalCost = midMarketRate > 0 ? totalCostInTarget / midMarketRate : totalCostInTarget;

    return {
      amount,
      midMarketRate,
      effectiveRate,
      advertisedRate,
      fixedFee,
      percentageFeeAmount,
      processingFee,
      gstAmount,
      totalFeesSource,
      netTransferAmountSource,
      amountReceived,
      markupLoss,
      spreadLoss,
      totalCost,
      effectiveMarkupPercent: totalMarkup * 100,
    };
  }
}
