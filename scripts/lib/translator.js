/**
 * Translator — Translate articles to all 8 locales
 */

const { generateTranslation } = require("./ai-writer");

const TARGET_LOCALES = ["zh", "es", "fr", "de", "ja", "ko", "ru"];

async function translateArticle(enArticle) {
  const translations = { en: enArticle };

  for (const locale of TARGET_LOCALES) {
    try {
      console.log(`  [Translator] Translating to ${locale}...`);

      const translated = await generateTranslation(
        `Title: ${enArticle.title}\n\nExcerpt: ${enArticle.excerpt}\n\nContent:\n${enArticle.content}`,
        locale
      );

      translations[locale] = {
        title: translated.title || `[${locale}] ${enArticle.title}`,
        excerpt: translated.excerpt || `[${locale}] ${enArticle.excerpt}`,
        content: translated.content || `[${locale}]\n\n${enArticle.content}`,
        category: translated.category || enArticle.category,
      };
    } catch (e) {
      console.error(`  [Translator] Failed for ${locale}:`, e.message);
      // Fallback: use English with locale prefix
      translations[locale] = {
        title: `[${locale.toUpperCase()}] ${enArticle.title}`,
        excerpt: `[${locale.toUpperCase()}] ${enArticle.excerpt}`,
        content: `[${locale.toUpperCase()}]\n\n${enArticle.content}`,
        category: enArticle.category,
      };
    }
  }

  return translations;
}

module.exports = { translateArticle, TARGET_LOCALES };
