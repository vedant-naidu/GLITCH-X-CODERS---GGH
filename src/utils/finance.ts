import { providerCatalog } from "@/data/providers";
import {
  ComparisonFormValues,
  ComparisonResult,
  HistoricalPoint,
  Persona,
  ProviderDefinition,
  ProviderQuote,
  TransparencyBand,
} from "@/types/fintech";

const liveRates: Record<string, number> = {
  USDINR: 83.12,
  EURINR: 89.75,
  GBPINR: 104.91,
  CADINR: 61.24,
  AUDINR: 54.67,
  SGDINR: 61.88,
  AEDINR: 22.63,
  INRUSD: 0.012,
};

const bandThresholds: Array<{ min: number; label: TransparencyBand }> = [
  { min: 86, label: "excellent" },
  { min: 72, label: "good" },
  { min: 56, label: "average" },
  { min: 0, label: "poor" },
];

export function getLiveRate(sourceCurrency: string, destinationCurrency: string) {
  const key = `${sourceCurrency}${destinationCurrency}`;
  if (liveRates[key]) {
    return liveRates[key];
  }

  const inverseKey = `${destinationCurrency}${sourceCurrency}`;
  if (liveRates[inverseKey]) {
    return 1 / liveRates[inverseKey];
  }

  return 1;
}

export function getTransparencyBand(score: number): TransparencyBand {
  return bandThresholds.find((band) => score >= band.min)?.label ?? "poor";
}

function calculateTransparencyScore(provider: ProviderDefinition, totalCostRatio: number) {
  const { pricing } = provider;
  const base =
    100 -
    pricing.exchangeMarkup * 1900 -
    pricing.hiddenForexSpread * 1500 -
    totalCostRatio * 120 -
    (100 - pricing.feeClarity) * 0.22 +
    pricing.speedScore * 0.12;

  return Math.max(0, Math.min(100, Math.round(base)));
}

export function quoteProvider(
  provider: ProviderDefinition,
  input: ComparisonFormValues,
  liveRate: number,
): ProviderQuote {
  const { amount } = input;
  const pricing = provider.pricing;
  const advertisedRate = liveRate * (1 - pricing.exchangeMarkup);
  const effectiveRate = liveRate * (1 - pricing.exchangeMarkup - pricing.hiddenForexSpread);

  const hiddenExchangeMarkup = amount * liveRate - amount * advertisedRate;
  const hiddenForexSpread = amount * advertisedRate - amount * effectiveRate;
  const fixedFees = pricing.fixedFee;
  const percentageFees = amount * pricing.percentageFee;
  const gst = (fixedFees + percentageFees + pricing.processingFee) * pricing.gstRate;
  const processingCharges = pricing.processingFee;

  const feeTotal = fixedFees + percentageFees + gst + processingCharges;
  const finalAmountReceived = amount * effectiveRate - feeTotal * effectiveRate;
  const totalCost = amount * liveRate - finalAmountReceived;
  const totalHiddenLoss = hiddenExchangeMarkup + hiddenForexSpread + feeTotal * effectiveRate;
  const totalCostRatio = totalCost / Math.max(amount * liveRate, 1);
  const transparencyScore = calculateTransparencyScore(provider, totalCostRatio);

  return {
    provider,
    liveRate,
    advertisedRate,
    effectiveRate,
    hiddenExchangeMarkup,
    hiddenForexSpread,
    totalHiddenLoss,
    fixedFees,
    percentageFees,
    gst,
    processingCharges,
    totalCost,
    finalAmountReceived,
    transparencyScore,
    transparencyBand: getTransparencyBand(transparencyScore),
    savingsVsMedian: 0,
  };
}

function weightedScore(quote: ProviderQuote, persona: Persona, bestAmountReceived: number) {
  const costScore = (quote.finalAmountReceived / Math.max(bestAmountReceived, 1)) * 100;
  const transparencyScore = quote.transparencyScore;
  const speedScore = quote.provider.pricing.speedScore;
  const personaFit = quote.provider.pricing.personaFit[persona];

  return costScore * 0.45 + transparencyScore * 0.25 + speedScore * 0.1 + personaFit * 0.2;
}

export function buildComparisonResult(input: ComparisonFormValues, liveRateOverride?: number): ComparisonResult {
  const liveRate = liveRateOverride ?? getLiveRate(input.sourceCurrency, input.destinationCurrency);
  const quotes = providerCatalog.map((provider) => quoteProvider(provider, input, liveRate));
  const sortedByAmount = [...quotes].sort((left, right) => right.finalAmountReceived - left.finalAmountReceived);
  const medianAmountReceived =
    sortedByAmount[Math.floor(sortedByAmount.length / 2)]?.finalAmountReceived ?? 0;

  quotes.forEach((quote) => {
    quote.savingsVsMedian = quote.finalAmountReceived - medianAmountReceived;
  });

  const bestAmountReceived = sortedByAmount[0]?.finalAmountReceived ?? 0;
  const ranked = [...quotes].sort(
    (left, right) => weightedScore(right, input.persona, bestAmountReceived) - weightedScore(left, input.persona, bestAmountReceived),
  );

  const cheapestProvider = sortedByAmount[0];
  const fastestProvider = [...quotes].sort(
    (left, right) => right.provider.pricing.speedScore - left.provider.pricing.speedScore,
  )[0];
  const mostTransparentProvider = [...quotes].sort(
    (left, right) => right.transparencyScore - left.transparencyScore,
  )[0];

  return {
    input,
    quotes: ranked,
    bestProvider: ranked[0],
    cheapestProvider,
    fastestProvider,
    mostTransparentProvider,
    estimatedSavings: bestAmountReceived - (quotes.find((quote) => quote.provider.id === "paypal")?.finalAmountReceived ?? bestAmountReceived),
    medianAmountReceived,
    liveRateLabel: `${input.sourceCurrency}/${input.destinationCurrency}`,
    updatedAt: new Date().toISOString(),
  };
}

export function buildHistoricalPoints(result: ComparisonResult): HistoricalPoint[] {
  const base = result.bestProvider.finalAmountReceived;

  return [
    { period: "7D", savings: result.bestProvider.totalCost * 0.12, charges: result.bestProvider.totalCost * 0.34, amountReceived: base * 0.96 },
    { period: "30D", savings: result.bestProvider.totalCost * 0.34, charges: result.bestProvider.totalCost * 0.58, amountReceived: base * 0.98 },
    { period: "90D", savings: result.bestProvider.totalCost * 0.62, charges: result.bestProvider.totalCost * 0.82, amountReceived: base },
  ];
}

export function getPersonaRecommendedProvider(persona: Persona) {
  const match = providerCatalog.reduce<ProviderDefinition | null>((best, provider) => {
    if (!best) return provider;
    return provider.pricing.personaFit[persona] > best.pricing.personaFit[persona] ? provider : best;
  }, null);

  return match ?? providerCatalog[0];
}