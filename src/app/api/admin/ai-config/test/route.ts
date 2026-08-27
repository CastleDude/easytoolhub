import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getAiConfig } from "@/lib/ai-config";
import { testDeepSeekKey } from "@/lib/deepseek";

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const body = await request.json().catch(() => ({}));
  const submitted = typeof body.deepseekApiKey === "string" ? body.deepseekApiKey.trim() : "";
  const key = submitted || getAiConfig().deepseekApiKey;

  if (!key) {
    return NextResponse.json(
      { error: "请先填写并保存 DeepSeek API Key" },
      { status: 400 },
    );
  }

  return NextResponse.json(await testDeepSeekKey(key));
}
