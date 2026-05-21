import { NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearTokenCookie(response);
  return response;
}
