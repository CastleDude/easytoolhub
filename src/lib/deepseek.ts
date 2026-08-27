/**
 * DeepSeek translation for admin manual translation.
 * Mirrors the logic in scripts/lib/ai-writer.js generateTranslation
 * (Anthropic-compatible endpoint, thinking-aware max_tokens, 180s timeout).
 */

import fs from "fs";
import path from "path";

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

export interface TranslationResult {
  title: string;
  excerpt: string;
  content: string;
}

function getApiConfig() {
  const env = loadEnvFile();
  return {
    baseUrl:
      process.env.ANTHROPIC_BASE_URL ||
      env.ANTHROPIC_BASE_URL ||
      "https://api.deepseek.com/anthropic",
    apiKey: process.env.ANTHROPIC_AUTH_TOKEN || env.ANTHROPIC_AUTH_TOKEN || "",
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
): Promise<TranslationResult | null> {
  const { baseUrl, apiKey, model } = getApiConfig();
  if (!apiKey) {
    console.error("[DeepSeek] ANTHROPIC_AUTH_TOKEN not set (process.env / .env.local)");
    return null;
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

    const json = await res.json();
    const contentBlocks = json.content || [];
    const textBlock = contentBlocks.find((c: { type: string }) => c.type === "text");
    const text = textBlock?.text || json.choices?.[0]?.message?.content || "";

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");
    const parsed = JSON.parse(match[0]);

    if (!parsed.title || !parsed.content) return null;
    // Treat a fallback-prefixed title as a failed translation
    if (parsed.title.startsWith(fallbackPrefix)) return null;

    return {
      title: parsed.title,
      excerpt: parsed.excerpt || "",
      content: parsed.content,
    };
  } catch (e) {
    console.error("[DeepSeek] Translation failed:", e);
    return null;
  }
}
