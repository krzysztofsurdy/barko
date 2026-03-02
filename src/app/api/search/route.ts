import { NextResponse } from "next/server";
import { searchConversations } from "@/lib/conversation-search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const results = searchConversations(q, limit);
  return NextResponse.json(results);
}
