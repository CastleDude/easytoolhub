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
- Category: Choose ONE from [Software, Equipment, Guide, Comparison, General] based on the topic
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
      const res = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          temperature: 0.7,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const json = await res.json();
      const text = json.content?.[0]?.text || json.choices?.[0]?.message?.content || "";

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
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

module.exports = { generateArticle, generateTranslation };
