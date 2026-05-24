const ALL_TARGET_LOCALES = ["en", "zh", "es", "fr", "de", "ja", "ko", "ru"];

const LANG_MAP: Record<string, string> = {
  en: "en-GB",
  zh: "zh-CN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
};

export interface TranslationResult {
  locale: string;
  title: string;
  excerpt: string;
  content: string;
}

async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const langpair = `${LANG_MAP[sourceLang] || sourceLang}|${LANG_MAP[targetLang] || targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);

  const data = await res.json();
  if (data.responseStatus !== 200) {
    throw new Error(`MyMemory API error: ${data.responseDetails || "unknown"}`);
  }

  return data.responseData.translatedText;
}

export async function translatePost(
  title: string,
  excerpt: string,
  content: string,
  sourceLocale: string,
): Promise<TranslationResult[]> {
  const targets = ALL_TARGET_LOCALES.filter((l) => l !== sourceLocale);

  const results = await Promise.all(
    targets.map(async (target) => {
      try {
        const [titleTrans, excerptTrans, contentTrans] = await Promise.all([
          translateText(title, sourceLocale, target),
          translateText(excerpt, sourceLocale, target),
          translateText(content, sourceLocale, target),
        ]);
        return {
          locale: target,
          title: titleTrans,
          excerpt: excerptTrans,
          content: contentTrans,
        };
      } catch (err) {
        console.error(`Translation to ${target} failed:`, err);
        return null;
      }
    }),
  );

  return results.filter((r): r is TranslationResult => r !== null);
}
