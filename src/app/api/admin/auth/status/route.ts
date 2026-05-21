import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const token = getTokenFromCookies(request);
  const authenticated = !!(token && (await verifyToken(token)));
  return NextResponse.json({ authenticated });
}
