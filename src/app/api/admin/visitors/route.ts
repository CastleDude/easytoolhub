import { NextRequest, NextResponse } from "next/server";
import { recordVisit, getVisitors, clearVisitors } from "@/lib/visitor-tracker";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, pageCount } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    // Get real IP from headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const country = req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      null;

    const session = recordVisit(sessionId, ip, country, pageCount || 1);

    return NextResponse.json({ success: true, data: session });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  if (action === "clear") {
    clearVisitors();
    return NextResponse.json({ success: true, data: [] });
  }

  return NextResponse.json({ success: true, data: getVisitors() });
}
