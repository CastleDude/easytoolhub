import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getClickStats } from "@/lib/clicks";

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days")) || 30;
  const stats = getClickStats(days);
  return NextResponse.json(stats);
}
