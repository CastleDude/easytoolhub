import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { listFeedback, submitFeedback } from "@/lib/feedback";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const url = new URL(request.url);
  const toolSlug = url.searchParams.get("toolSlug") || undefined;
  const rating = url.searchParams.get("rating") ? Number(url.searchParams.get("rating")) : undefined;
  const limit = Number(url.searchParams.get("limit")) || 50;
  const offset = Number(url.searchParams.get("offset")) || 0;

  const items = listFeedback({ toolSlug, rating, limit, offset });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { toolSlug, rating, comment, locale } = body;

  if (!toolSlug || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "toolSlug and rating (1-5) are required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = hashIp(ip);

  await submitFeedback({
    toolSlug,
    rating,
    comment: comment || "",
    locale: locale || "en",
    ipHash,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
