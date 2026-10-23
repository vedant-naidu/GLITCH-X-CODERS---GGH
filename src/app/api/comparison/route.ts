import { NextResponse } from "next/server";
import { comparisonInputSchema } from "@/lib/validation/calc-schema";
import { buildComparisonResult } from "@/utils/finance";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = comparisonInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid comparison input parameters",
          issues: parseResult.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    const result = buildComparisonResult(parseResult.data as unknown as import("@/types/fintech").ComparisonFormValues);
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Malformed comparison request payload",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 400 },
    );
  }
}