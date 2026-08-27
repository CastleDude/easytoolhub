import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getAiConfig, saveAiConfig } from "@/lib/ai-config";

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const key = getAiConfig().deepseekApiKey || "";
  return NextResponse.json({
    hasKey: key.length > 0,
    keyMasked: key ? maskKey(key) : "",
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const body = await request.json().catch(() => ({}));
  const key = typeof body.deepseekApiKey === "string" ? body.deepseekApiKey.trim() : "";
  if (!key) {
    return NextResponse.json({ error: "DeepSeek API Key 不能为空" }, { status: 400 });
  }

  await saveAiConfig({ deepseekApiKey: key });
  return NextResponse.json({ ok: true, keyMasked: maskKey(key) });
}
