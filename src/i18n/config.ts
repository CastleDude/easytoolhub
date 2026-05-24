export const locales = ["en", "zh", "es", "fr", "de", "ja", "ko", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
};

// Country code to default locale mapping (for Vercel geo-IP)
export const countryLocaleMap: Record<string, Locale> = {
  US: "en", GB: "en", CA: "en", AU: "en", NZ: "en", IE: "en", IN: "en", PH: "en", SG: "en",
  CN: "zh", TW: "zh", HK: "zh", MO: "zh",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  FR: "fr", BE: "fr", LU: "fr",
  DE: "de", AT: "de", LI: "de",
  JP: "ja",
  KR: "ko",
  RU: "ru", BY: "ru", KZ: "ru", UA: "ru",
};

export const localesWithHreflang: Record<Locale, string> = {
  en: "en",
  zh: "zh-Hans",
  es: "es",
  fr: "fr",
  de: "de",
  ja: "ja",
  ko: "ko",
  ru: "ru",
};
