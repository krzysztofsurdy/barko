import { NextResponse } from "next/server";
import { calculateCosts } from "@/lib/cost-calculator";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  const summary = calculateCosts(days);
  return NextResponse.json(summary);
}
