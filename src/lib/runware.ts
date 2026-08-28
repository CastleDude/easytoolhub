/**
 * Runware image generation for admin cover-image workflow.
 * Mirrors scripts/lib/image-gen.js: Flux model → sharp → WebP (1024×576, 16:9).
 * Uses the admin-configured RUNWARE_API_KEY (settings page) with .env.local fallback.
 */

import https from "https";
import http from "http";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getAiConfig } from "./ai-config";

const STYLE_SUFFIX =
  "Photorealistic photo, professional commercial photography, soft even lighting, sharp focus, high detail, 16:9 landscape. No text, no watermark, no letters, no caption, no logo, no labels. No double exposure, no reflection, no layered composition, no object-on-photo-background effect.";

// Read .env.local explicitly as a fallback (same approach as the daily-fetch scripts)
function readEnvFile(): Record<string, string> {
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

function getRunwareKey(): string {
  const stored = getAiConfig();
  const env = readEnvFile();
  return stored.runwareApiKey || process.env.RUNWARE_API_KEY || env.RUNWARE_API_KEY || "";
}

/** Use the DeepSeek LLM to distill title + content into a short visual prompt. */
async function buildImagePrompt(title: string, content: string): Promise<string | null> {
  const env = readEnvFile();
  const baseUrl =
    process.env.ANTHROPIC_BASE_URL || env.ANTHROPIC_BASE_URL || "https://api.deepseek.com/anthropic";
  const apiKey =
    process.env.ANTHROPIC_AUTH_TOKEN || env.ANTHROPIC_AUTH_TOKEN || getAiConfig().deepseekApiKey || "";
  const model =
    process.env.ANTHROPIC_DEFAULT_SONNET_MODEL || env.ANTHROPIC_DEFAULT_SONNET_MODEL || "deepseek-v4-pro";
  if (!apiKey) return null;

  const excerpt = String(content || "")
    .replace(/[#*`|[\]()>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 300);

  const prompt = `You are an expert image prompt designer. Based on the article title and content below, write ONE image-generation prompt (English, max 60 words) describing a photorealistic image that best represents the article's subject. Describe ONE main subject, its setting/background, and the mood. Do NOT mention text, words, letters, captions, watermarks, or logos. Output ONLY the prompt text — no quotes, no explanation.

Article title: ${title}
Article content excerpt: ${excerpt}`;

  try {
    const res = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: 200, temperature: 0.7, messages: [{ role: "user", content: prompt }] }),
    });
    const json = await res.json();
    const textBlock = (json.content || []).find((c: { type: string }) => c.type === "text");
    const text = (textBlock?.text || json.choices?.[0]?.message?.content || "").trim();
    if (!text) return null;
    return text.replace(/^["']|["']$/g, "").substring(0, 300);
  } catch {
    return null;
  }
}

function generateWithRunware(prompt: string, apiKey: string): Promise<string> {
  const task = {
    taskType: "imageInference",
    taskUUID: crypto.randomUUID(),
    model: "runware:400@1",
    positivePrompt: prompt.substring(0, 1000),
    width: 1024,
    height: 576,
    outputType: "URL",
    outputFormat: "PNG",
  };
  const body = JSON.stringify([task]);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.runware.ai",
        path: "/v1",
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      },
      (res) => {
        let data = "";
        res.on("data", (d) => (data += d));
        res.on("end", () => {
          try {
            const results = JSON.parse(data);
            if (results.errors && results.errors.length > 0) {
              reject(new Error(results.errors[0].message || "Runware API error"));
              return;
            }
            const imageResult = results.data?.[0] || (Array.isArray(results) ? results[0] : results);
            if (imageResult.imageURL) {
              resolve(imageResult.imageURL);
            } else {
              reject(new Error("No imageURL in response: " + JSON.stringify(imageResult).substring(0, 200)));
            }
          } catch (e) {
            reject(new Error("Failed to parse Runware response: " + (e as Error).message));
          }
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function downloadToWebP(url: string, outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const client = url.startsWith("https") ? https : http;

  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadToWebP(res.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const webp = await sharp(buffer)
            .resize(1024, 576, { fit: "cover" })
            .webp({ quality: 80 })
            .toBuffer();
          fs.writeFileSync(outputPath, webp);
          resolve();
        } catch (e) {
          reject(new Error("WebP conversion failed: " + (e as Error).message));
        }
      });
    }).on("error", reject);
  });
}

/**
 * Test a Runware API key with a tiny generation request (cheap schnell model).
 * Returns { ok, status, message } — ok=false on 401/invalid key.
 */
export async function testRunwareKey(
  apiKey: string,
): Promise<{ ok: boolean; status?: number; message: string }> {
  const task = {
    taskType: "imageInference",
    taskUUID: crypto.randomUUID(),
    model: "runware:100@1",
    positivePrompt: "a small red circle",
    width: 256,
    height: 256,
    outputType: "URL",
    outputFormat: "PNG",
  };
  const body = JSON.stringify([task]);

  try {
    const res = await new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
      const req = https.request(
        {
          hostname: "api.runware.ai",
          path: "/v1",
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
        },
        (response) => {
          let data = "";
          response.on("data", (d) => (data += d));
          response.on("end", () =>
            resolve({ statusCode: response.statusCode || 0, body: data }),
          );
        },
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });

    if (res.statusCode === 200 || res.statusCode === 201) {
      return { ok: true, status: res.statusCode, message: "连接成功，Runware API Key 有效" };
    }
    if (res.statusCode === 401) {
      return { ok: false, status: 401, message: "API Key 无效（401），请检查后重试" };
    }
    let detail = "";
    try {
      const j = JSON.parse(res.body);
      detail = j.errors?.[0]?.message || "";
    } catch {}
    return {
      ok: false,
      status: res.statusCode,
      message: detail || `请求失败（HTTP ${res.statusCode}），请检查 Key 是否正确`,
    };
  } catch (e) {
    return { ok: false, message: "网络错误，请重试" };
  }
}

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  webpPath: string;
}

/**
 * Generate a cover image for an article slug and save it as public/images/blog/{slug}.webp.
 * Prompt resolution: explicit promptOverride → LLM distill → title-based fallback.
 */
export async function generateArticleImage(
  slug: string,
  title: string,
  content: string,
  promptOverride?: string,
): Promise<GeneratedImage> {
  const runwareKey = getRunwareKey();
  if (!runwareKey) {
    throw new Error("RUNWARE_API_KEY 未配置，请到后台「设置」页填写生图 API Key");
  }

  let prompt = promptOverride?.trim() || "";
  if (!prompt) {
    const distilled = await buildImagePrompt(title, content);
    prompt = distilled
      ? `${distilled}. ${STYLE_SUFFIX}`
      : `Realistic tech product photo related to: ${title}. ${STYLE_SUFFIX}`;
  }

  const imageUrl = await generateWithRunware(prompt, runwareKey);
  const webpPath = path.join(process.cwd(), "public/images/blog", `${slug}.webp`);
  await downloadToWebP(imageUrl, webpPath);
  return { imageUrl: `/images/blog/${slug}.webp`, prompt, webpPath };
}
