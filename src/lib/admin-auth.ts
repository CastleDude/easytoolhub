import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, verifyToken, TOKEN_NAME } from "./jwt";

export { signToken, verifyToken };

export function getTokenFromCookies(request: NextRequest): string | undefined {
  return request.cookies.get(TOKEN_NAME)?.value;
}

export function setTokenCookie(response: NextResponse, token: string) {
  response.cookies.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });
}

export function clearTokenCookie(response: NextResponse) {
  response.cookies.set(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function verifyAdmin(request: NextRequest): Promise<NextResponse | null> {
  const token = getTokenFromCookies(request);
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
