import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getFeedbackStats } from "@/lib/feedback";

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const stats = getFeedbackStats();
  return NextResponse.json(stats);
}
