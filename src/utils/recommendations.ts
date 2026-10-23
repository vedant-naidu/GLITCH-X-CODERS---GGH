import { Persona } from "@/types/fintech";
import { buildComparisonResult, getPersonaRecommendedProvider } from "@/utils/finance";

export function getRecommendationBadge(index: number) {
  if (index === 0) return "Best Overall";
  if (index === 1) return "Cheapest";
  if (index === 2) return "Fastest";
  return "Most Transparent";
}

export function getPersonaNarrative(persona: Persona) {
  switch (persona) {
    case "student":
      return "Optimized for tuition, predictable transfer costs, and easy institutional payouts.";
    case "freelancer":
      return "Maximizes take-home earnings with low spread and strong settlement transparency.";
    case "traveler":
      return "Focuses on fast card rails, low cash-out friction, and strong everyday FX rates.";
    case "business":
      return "Prioritizes high-value transfers, clean reconciliation, and lower blended FX cost.";
  }
}

export function getBestPersonaMatch(persona: Persona) {
  return getPersonaRecommendedProvider(persona);
}

export function explainBestChoice(persona: Persona, comparison = null as ReturnType<typeof buildComparisonResult> | null) {
  const provider = comparison ? comparison.bestProvider.provider : getPersonaRecommendedProvider(persona);
  return `${provider.name} fits this ${persona} workflow because it balances hidden spread, delivered amount, and fee clarity better than the alternatives.`;
}