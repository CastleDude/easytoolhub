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

  const cfg = getAiConfig();
  const deep = cfg.deepseekApiKey || "";
  const runware = cfg.runwareApiKey || "";
  return NextResponse.json({
    hasKey: deep.length > 0,
    keyMasked: deep ? maskKey(deep) : "",
    runwareHasKey: runware.length > 0,
    runwareKeyMasked: runware ? maskKey(runware) : "",
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const body = await request.json().catch(() => ({}));
  const current = getAiConfig();

  // Only overwrite a key when a non-empty value was submitted; empty/absent keeps the old one
  const deepseek =
    typeof body.deepseekApiKey === "string" ? body.deepseekApiKey.trim() : null;
  const runware =
    typeof body.runwareApiKey === "string" ? body.runwareApiKey.trim() : null;

  if (deepseek === null && runware === null) {
    return NextResponse.json({ error: "请至少填写一个 API Key" }, { status: 400 });
  }

  const cfg = {
    deepseekApiKey: deepseek !== null ? deepseek : current.deepseekApiKey,
    runwareApiKey: runware !== null ? runware : current.runwareApiKey,
  };
  await saveAiConfig(cfg);

  return NextResponse.json({
    ok: true,
    keyMasked: cfg.deepseekApiKey ? maskKey(cfg.deepseekApiKey) : "",
    runwareKeyMasked: cfg.runwareApiKey ? maskKey(cfg.runwareApiKey) : "",
  });
}
