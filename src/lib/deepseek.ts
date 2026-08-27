/**
 * DeepSeek translation for admin manual translation.
 * Mirrors the logic in scripts/lib/ai-writer.js generateTranslation
 * (Anthropic-compatible endpoint, thinking-aware max_tokens, 180s timeout).
 */

import fs from "fs";
import path from "path";
import { getAiConfig } from "./ai-config";

// Read .env.local explicitly (same approach as the daily-fetch scripts),
// as a fallback in case the Next.js process didn't auto-load it.
function loadEnvFile(): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
        env[key] = val;
      }
    }
  } catch {}
  return env;
}

const LANG_NAMES: Record<string, string> = {
  zh: "Simplified Chinese (简体中文)",
  es: "Spanish (Español)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  ja: "Japanese (日本語)",
  ko: "Korean (한국어)",
  ru: "Russian (Русский)",
};

export type TranslationOutcome =
  | { ok: true; title: string; excerpt: string; content: string }
  | { ok: false; reason: string };

function getApiConfig() {
  const env = loadEnvFile();
  const stored = getAiConfig();
  return {
    baseUrl:
      process.env.ANTHROPIC_BASE_URL ||
      env.ANTHROPIC_BASE_URL ||
      "https://api.deepseek.com/anthropic",
    // Admin-configured key (settings page) wins; fall back to env
    apiKey:
      stored.deepseekApiKey ||
      process.env.ANTHROPIC_AUTH_TOKEN ||
      env.ANTHROPIC_AUTH_TOKEN ||
      "",
    model:
      process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ||
      env.ANTHROPIC_DEFAULT_SONNET_MODEL ||
      "deepseek-v4-pro",
  };
}

export async function translateWithDeepSeek(
  title: string,
  excerpt: string,
  content: string,
  targetLocale: string,
): Promise<TranslationOutcome> {
  const { baseUrl, apiKey, model } = getApiConfig();
  if (!apiKey) {
    console.error("[DeepSeek] ANTHROPIC_AUTH_TOKEN not set (admin config / .env.local)");
    return { ok: false, reason: "未配置 DeepSeek API Key，请到后台「设置」页填写并保存" };
  }

  const langName = LANG_NAMES[targetLocale] || targetLocale;
  const fallbackPrefix = `[${targetLocale.toUpperCase()}]`;

  const prompt = `Translate the following tech review article into ${langName}.
Keep all markdown formatting (##, **, |) intact. Return ONLY JSON:

Input content:
Title: ${title}

Excerpt: ${excerpt}

Content:
${content}

Output this JSON structure:
{
  "title": "... (translated)",
  "excerpt": "... (translated)",
  "content": "... (translated, keep all markdown)",
  "category": "... (keep original)"
}`;

  // DeepSeek intermittently returns without usable JSON — retry a few times
  let lastReason = "未知错误";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 180000);
      const res = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 8192,
          temperature: 0.7,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      // Non-2xx → surface the upstream error to the user (balance, invalid key, rate limit...)
      if (!res.ok) {
        let detail = "";
        try {
          const j = await res.json();
          detail = j?.error?.message || "";
        } catch {}
        lastReason = deepSeekStatusMessage(res.status, detail);
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const contentBlocks = json.content || [];
      const textBlock = contentBlocks.find((c: { type: string }) => c.type === "text");
      const text = textBlock?.text || json.choices?.[0]?.message?.content || "";

      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        lastReason = "模型响应为空或未返回 JSON，请稍后重试";
        console.error(`[DeepSeek] No JSON (attempt ${attempt}/3). Raw sample: ${text.substring(0, 200)}`);
        throw new Error("No JSON found in response");
      }
      const parsed = JSON.parse(match[0]);

      if (!parsed.title || !parsed.content) {
        lastReason = "翻译结果缺少必需字段";
        throw new Error("Missing required fields");
      }
      // Treat a fallback-prefixed title as a failed translation
      if (parsed.title.startsWith(fallbackPrefix)) {
        lastReason = "翻译结果被截断（标题带占位前缀）";
        throw new Error("Fallback-prefixed title");
      }

      return {
        ok: true,
        title: parsed.title,
        excerpt: parsed.excerpt || "",
        content: parsed.content,
      };
    } catch (e) {
      const msg = (e as Error).message;
      const reason = /abort/i.test(msg)
        ? "DeepSeek 请求超时（文章过长或服务繁忙）"
        : lastReason || msg;
      console.error(`[DeepSeek] Attempt ${attempt}/3 failed:`, msg);
      if (attempt === 3) return { ok: false, reason };
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return { ok: false, reason: lastReason };
}

/** Send a tiny request to verify an API key works (checks balance, permissions, network). */
export async function testDeepSeekKey(
  key: string,
): Promise<{ ok: boolean; status: number; message: string }> {
  const { baseUrl, model } = getApiConfig();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        temperature: 0,
        messages: [{ role: "user", content: "Reply with just: OK" }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) return { ok: true, status: res.status, message: "连接成功，Key 有效" };

    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message || "";
    } catch {}
    return { ok: false, status: res.status, message: deepSeekStatusMessage(res.status, detail) };
  } catch (e) {
    return { ok: false, status: 0, message: "网络请求失败：" + (e as Error).message };
  }
}

function deepSeekStatusMessage(status: number, detail: string): string {
  switch (status) {
    case 401:
      return "API Key 无效或已过期，请检查后重新填写";
    case 402:
      return "账户余额不足，请到 DeepSeek 开放平台充值";
    case 403:
      return "当前 Key 无权限调用此接口";
    case 429:
      return "请求频率超限，请稍后再试";
    case 400:
      return "请求参数有误" + (detail ? `：${detail}` : "");
    case 404:
      return "接口地址不存在，请检查 ANTHROPIC_BASE_URL";
    default:
      return `请求失败（HTTP ${status}）${detail ? `：${detail}` : ""}`;
  }
}
