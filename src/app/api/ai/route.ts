import { NextResponse } from "next/server";
import { generateFinancialAdvice } from "@/lib/gemini";
import { buildComparisonResult } from "@/utils/finance";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const comparison = buildComparisonResult(body.comparison);

    const advice = await generateFinancialAdvice({
      question: body.question,
      comparison,
    });

    return NextResponse.json(advice);
  } catch (error) {
    console.error("Error in /api/ai POST handler:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI financial advice",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}