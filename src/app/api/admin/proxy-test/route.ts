import { NextRequest, NextResponse } from "next/server";

// POST - proxy a test request to an external URL from the server side (avoids CORS)
export async function POST(req: NextRequest) {
  const { url, method } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: method || "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "EasyToolHub/1.0 API-Test",
      },
    });
    clearTimeout(timeout);

    const duration = Date.now() - start;
    let body: string | undefined;
    try {
      body = await res.text();
      if (body.length > 500) body = body.slice(0, 500);
    } catch {}

    return NextResponse.json({
      status: res.status,
      ok: res.status >= 200 && res.status < 300,
      duration,
      body,
    });
  } catch (err: unknown) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      status: null,
      ok: false,
      duration,
      error: message,
    });
  }
}
