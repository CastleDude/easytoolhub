import { NextRequest, NextResponse } from "next/server";
import { recordVisit, getAggregatedVisitors, getVisitorStats, clearVisitors, ipToCountry } from "@/lib/visitor-tracker";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, pageCount, userAgent } = body;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const country = req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") || ipToCountry(ip);
    const referrer = req.headers.get("referer") || null;
    const ua = userAgent || req.headers.get("user-agent") || "";

    recordVisit(ip, body.page || "/", country, referrer, ua);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action");

  if (action === "clear") {
    clearVisitors();
    return NextResponse.json({ success: true, data: [] });
  }

  if (action === "stats") {
    return NextResponse.json({ success: true, data: getVisitorStats() });
  }

  const filters = {
    ip: searchParams.get("ip") || undefined,
    country: searchParams.get("country") || undefined,
    device: searchParams.get("device") || undefined,
    visitType: searchParams.get("visitType") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  };

  const sort = {
    field: searchParams.get("sortField") || "lastVisit",
    order: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
  };

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  const result = getAggregatedVisitors(filters, sort, page, pageSize);
  return NextResponse.json({ success: true, ...result });
}
