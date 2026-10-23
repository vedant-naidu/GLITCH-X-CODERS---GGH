import { NextResponse } from "next/server";
import { buildComparisonResult } from "@/utils/finance";

export async function POST(request: Request) {
  const body = await request.json();
  const result = buildComparisonResult(body);
  return NextResponse.json({ result });
}