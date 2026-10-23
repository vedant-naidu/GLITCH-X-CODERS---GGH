import { NextResponse } from "next/server";
import { getExchangeRate, RateServiceError } from "@/lib/rate-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? "USD";
  const to = searchParams.get("to") ?? "INR";

  try {
    const rateData = await getExchangeRate(from, to);
    return NextResponse.json(rateData, { status: 200 });
  } catch (err: unknown) {
    const rateError = err as RateServiceError;
    if (rateError?.code === "UNSUPPORTED_CURRENCY") {
      return NextResponse.json(
        {
          error: rateError.error,
          code: rateError.code,
          supportedCurrencies: rateError.supportedCurrencies,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Exchange rate service encountered an unrecoverable failure",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}