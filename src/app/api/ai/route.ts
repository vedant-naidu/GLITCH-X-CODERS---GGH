import { NextResponse } from "next/server";
import { createOpenAIClient } from "@/lib/openai";
import { buildComparisonResult } from "@/utils/finance";

export async function POST(request: Request) {
  const body = await request.json();
  const comparison = buildComparisonResult(body.comparison);
  const client = createOpenAIClient();

  if (!client) {
    return NextResponse.json({
      answer: `${comparison.bestProvider.provider.name} is the strongest option in this scenario because it keeps hidden fees and spread under control while preserving more of the transfer value.`,
      sources: [comparison.bestProvider.provider.name],
    });
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are FXWise, a fintech assistant. Answer using the supplied comparison data only and reference the current providers, costs, and transparency scores.",
      },
      {
        role: "user",
        content: JSON.stringify({ question: body.question, comparison }),
      },
    ],
  });

  return NextResponse.json({ answer: response.output_text, sources: comparison.quotes.slice(0, 3).map((quote) => quote.provider.name) });
}