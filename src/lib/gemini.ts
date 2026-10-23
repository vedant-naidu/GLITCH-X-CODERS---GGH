import { GoogleGenAI } from "@google/genai";
import { env, isConfigured } from "@/lib/env";
import type { ComparisonResult } from "@/types/fintech";

export function createGeminiClient(): GoogleGenAI | null {
  if (!isConfigured(env.geminiApiKey)) {
    return null;
  }

  return new GoogleGenAI({ apiKey: env.geminiApiKey });
}

export interface GenerateAdviceInput {
  question?: string;
  comparison: ComparisonResult;
}

export interface GenerateAdviceOutput {
  answer: string;
  sources: string[];
}

export async function generateFinancialAdvice(
  input: GenerateAdviceInput
): Promise<GenerateAdviceOutput> {
  const { question, comparison } = input;
  const bestProviderName = comparison.bestProvider.provider.name;
  const fallbackSources = comparison.quotes.slice(0, 3).map((q) => q.provider.name);

  const client = createGeminiClient();
  if (!client) {
    return {
      answer: `${bestProviderName} is the strongest option in this scenario because it keeps hidden fees and spread under control while preserving more of the transfer value.`,
      sources: [bestProviderName],
    };
  }

  const model = env.geminiModel || "gemini-3.5-flash-lite";

  const systemInstruction =
    "You are FXWise, a fintech assistant. Answer using the supplied comparison data only and reference the current providers, costs, and transparency scores. Keep your explanation concise, accurate, and actionable.";

  const userPrompt = JSON.stringify({
    question: question || "Which provider should I use for this transfer?",
    comparisonSummary: {
      sendAmount: comparison.input.amount,
      sourceCurrency: comparison.input.sourceCurrency,
      destinationCurrency: comparison.input.destinationCurrency,
      bestProvider: bestProviderName,
      cheapestProvider: comparison.cheapestProvider.provider.name,
      quotes: comparison.quotes.map((q) => ({
        provider: q.provider.name,
        transparencyScore: q.transparencyScore,
        totalCost: q.totalCost,
        hiddenMarkup: q.hiddenExchangeMarkup,
        effectiveRate: q.effectiveRate,
        recipientGets: q.finalAmountReceived,
      })),
    },
  });

  try {
    const response = await client.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const answer = response.text?.trim();

    if (!answer) {
      throw new Error("Empty response received from Gemini API");
    }

    return {
      answer,
      sources: fallbackSources,
    };
  } catch (error) {
    console.error("Gemini API Error during advice generation:", error);
    // Bounded fallback to preserve uninterrupted user experience
    return {
      answer: `${bestProviderName} is currently the strongest recommendation for this comparison (${comparison.input.amount} ${comparison.input.sourceCurrency} to ${comparison.input.destinationCurrency}). It offers the highest net payout with minimal spread markup and clear fee disclosures.`,
      sources: fallbackSources,
    };
  }
}
