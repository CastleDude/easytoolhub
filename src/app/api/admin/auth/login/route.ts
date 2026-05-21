import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken, setTokenCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const password = body.password;

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  if (!verifyPassword(password, hash)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await signToken();
  const response = NextResponse.json({ success: true });
  setTokenCookie(response, token);
  return response;
}
