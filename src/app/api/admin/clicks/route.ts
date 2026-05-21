import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/clicks";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { toolSlug, locale } = body;

  if (!toolSlug) {
    return NextResponse.json({ error: "toolSlug is required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = hashIp(ip);
  const userAgent = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || "";

  await recordClick({
    toolSlug,
    locale: locale || "en",
    ipHash,
    userAgent,
    referrer,
  });

  return NextResponse.json({ success: true });
}
