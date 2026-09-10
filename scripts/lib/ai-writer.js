/**
 * AI Writer — Generate original review articles using LLM
 */

function getApiConfig() {
  // Read from environment or settings
  const baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.deepseek.com/anthropic";
  const apiKey = process.env.ANTHROPIC_AUTH_TOKEN || "";
  const model = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL || "deepseek-v4-pro";
  return { baseUrl, apiKey, model };
}

function generateArticle(topic, retries = 3) {
  const { baseUrl, apiKey, model } = getApiConfig();

  if (!apiKey) {
    throw new Error("ANTHROPIC_AUTH_TOKEN not set. Cannot generate articles.");
  }

  const prompt = `You are a professional tech reviewer for EasyToolHub. Write a detailed, original product review article in English based on the following topic and search context.

Topic: ${topic.query}
Search context (for factual grounding only — rewrite in your own words):
${topic.sources.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Requirements:
- Title: Engaging, SEO-friendly, under 80 characters
- Excerpt: Compelling 1-2 sentence summary under 160 characters
- Content: 350-500 words with ## sections, comparison points, and a verdict
- Category: Choose ONE from these 5 only — Software (软件), Equipment (设备), Guide (指南), Comparison (对比), General (综合). Never invent other categories.
- Format: JSON only, no markdown wrapping

Output this exact JSON structure:
{
  "title": "...",
  "excerpt": "...",
  "content": "...",
  "category": "..."
}`;

  return fetchWithRetry(baseUrl, apiKey, model, prompt, retries);
}

function generateTranslation(content, targetLang, retries = 2) {
  const { baseUrl, apiKey, model } = getApiConfig();
  if (!apiKey) throw new Error("ANTHROPIC_AUTH_TOKEN not set");

  const langNames = {
    zh: "Simplified Chinese (简体中文)", es: "Spanish (Español)",
    fr: "French (Français)", de: "German (Deutsch)",
    ja: "Japanese (日本語)", ko: "Korean (한국어)", ru: "Russian (Русский)",
  };

  const prompt = `Translate the following tech review article into ${langNames[targetLang] || targetLang}.
Keep all markdown formatting (##, **, |) intact. Return ONLY JSON:

Input content:
${content}

Output this JSON structure:
{
  "title": "... (translated)",
  "excerpt": "... (translated)",
  "content": "... (translated, keep all markdown)",
  "category": "... (keep original)"
}`;

  return fetchWithRetry(baseUrl, apiKey, model, prompt, retries);
}

async function fetchWithRetry(baseUrl, apiKey, model, prompt, retries) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // 180s timeout so a hung upstream call can't block the script forever
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
          thinking: { type: "disabled" },
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      // Non-2xx → surface the upstream error (balance, invalid key, rate limit...)
      if (!res.ok) {
        let detail = "";
        try {
          const j = await res.json();
          detail = j?.error?.message || "";
        } catch {}
        throw new Error(`HTTP ${res.status}${detail ? ": " + detail : ""}`);
      }

      const json = await res.json();

      // DeepSeek: text is in content[].text; reasoning models may prepend thinking blocks.
      // Join ALL text blocks (defensive) and ignore any thinking blocks.
      const contentBlocks = json.content || [];
      const text =
        contentBlocks
          .filter((c) => c.type === "text")
          .map((c) => c.text || "")
          .join("") || json.choices?.[0]?.message?.content || "";

      // DeepSeek occasionally ignores thinking:disabled and returns a thinking block
      // that eats the token budget, leaving text empty. Detect it and retry.
      const thinkingLen = contentBlocks
        .filter((c) => c.type === "thinking")
        .map((c) => c.thinking || c.text || "")
        .join("").length;
      if (!text && thinkingLen > 0) {
        throw new Error(`Thinking block returned with empty text (${thinkingLen} chars) — thinking:disabled was ignored`);
      }

      // Extract JSON from response (may have markdown wrapping)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.title || !parsed.content) {
        throw new Error("Missing required fields in AI response");
      }

      return parsed;
    } catch (e) {
      console.error(`[AIWriter] Attempt ${attempt + 1}/${retries} failed:`, e.message);
      if (attempt === retries - 1) throw e;
      // Exponential backoff: 2s → 4s → 8s → 16s (capped) to ride out transient upstream jitter
      const delay = Math.min(2000 * Math.pow(2, attempt), 15000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

module.exports = { generateArticle, generateTranslation };
