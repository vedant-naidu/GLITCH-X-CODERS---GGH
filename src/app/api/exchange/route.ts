import { NextResponse } from "next/server";
import { env } from "@/lib/env";

type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? "USD";
  const to = searchParams.get("to") ?? "INR";

  try {
    const frankfurter = await fetch(`${env.frankfurterBaseUrl}/latest?amount=1&from=${from}&to=${to}`, {
      cache: "no-store",
    });

    if (!frankfurter.ok) {
      throw new Error("Frankfurter request failed");
    }

    const data = (await frankfurter.json()) as FrankfurterResponse;
    const rate = data.rates[to] ?? 1;

    return NextResponse.json({
      provider: "Frankfurter",
      from,
      to,
      rate,
      date: data.date,
    });
  } catch {
    return NextResponse.json(
      {
        provider: "FXWise fallback",
        from,
        to,
        rate: 1,
        error: "Live exchange rate service unavailable",
      },
      { status: 503 },
    );
  }
}