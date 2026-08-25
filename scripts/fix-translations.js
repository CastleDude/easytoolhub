#!/usr/bin/env node
/**
 * 修复失败的翻译（标题带 [ZH]/[ES]/[FR]/[DE]/[JA]/[KO]/[RU] 前缀的文章）。
 *
 * 用法（在项目根目录执行）:
 *   全量修复:                 node scripts/fix-translations.js
 *   只修指定文章:             node scripts/fix-translations.js --slug slug-a,slug-b
 *   只修指定语言:             node scripts/fix-translations.js --locale zh,es
 *   组合:                     node scripts/fix-translations.js --slug slug-a --locale zh
 */

const fs = require("fs");
const path = require("path");
const cwd = process.cwd();

// Load env from .env.local
const envPath = path.join(cwd, ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith("#")) {
      const eq = t.indexOf("=");
      if (eq > 0) process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  });
}

const { translateArticle } = require(path.join(cwd, "scripts/lib/translator"));
const { generateTranslation } = require(path.join(cwd, "scripts/lib/ai-writer"));
const LOCALE_PREFIXES = ["[ZH]", "[ES]", "[FR]", "[DE]", "[JA]", "[KO]", "[RU]"];

// --- 参数解析 ---
let slugFilter = null;
let localeFilter = null;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--slug" && args[i + 1]) {
    slugFilter = args[i + 1].split(",").map(s => s.trim()).filter(Boolean);
    i++;
  } else if (args[i] === "--locale" && args[i + 1]) {
    localeFilter = args[i + 1].split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    i++;
  }
}

async function main() {
  const posts = JSON.parse(fs.readFileSync(path.join(cwd, "src/data/posts.json"), "utf-8"));
  const enMap = {};
  posts.forEach(p => { if (p.locale === "en") enMap[p.slug] = p; });

  let broken = posts.filter(p =>
    p.locale !== "en" && LOCALE_PREFIXES.some(pref => p.title.startsWith(pref))
  );

  // 应用 --locale 过滤
  if (localeFilter) {
    broken = broken.filter(b => localeFilter.includes(b.locale));
  }

  if (broken.length === 0) { console.log("没有匹配的失败翻译。"); return; }
  console.log("找到 " + broken.length + " 条翻译失败" + (localeFilter ? " (语言: " + localeFilter.join(",") + ")" : "") + "\n");

  // 按 slug 分组（应用 --slug 过滤）
  const slugMap = {};
  broken.forEach(b => {
    if (slugFilter && !slugFilter.includes(b.slug)) return;
    if (!slugMap[b.slug]) slugMap[b.slug] = [];
    slugMap[b.slug].push(b);
  });

  const slugs = Object.keys(slugMap);
  console.log("待修复 " + slugs.length + " 篇: " + slugs.map(s => s.substring(0, 40)).join(" | ") + "\n");

  for (const [slug, entries] of Object.entries(slugMap)) {
    const en = enMap[slug];
    if (!en) continue;
    console.log("修复: " + slug.substring(0, 50) + " [" + entries.map(e => e.locale).join(",") + "]");

    try {
      if (localeFilter) {
        // 只翻译指定语言，避免全量 7 语言调用（快得多）
        for (const locale of entries.map(e => e.locale)) {
          try {
            const trans = await generateTranslation(
              `Title: ${en.title}\n\nExcerpt: ${en.excerpt}\n\nContent:\n${en.content}`, locale);
            if (trans && !LOCALE_PREFIXES.some(pref => trans.title.startsWith(pref))) {
              const entry = entries.find(e => e.locale === locale);
              entry.title = trans.title; entry.excerpt = trans.excerpt; entry.content = trans.content; entry.category = en.category;
              console.log("  " + locale + " ✓");
            } else {
              console.log("  " + locale + " ✗");
            }
          } catch (e) {
            console.log("  " + locale + " ✗ " + e.message);
          }
        }
      } else {
        const translations = await translateArticle({
          title: en.title, excerpt: en.excerpt, content: en.content, category: en.category,
        });
        entries.forEach(e => {
          const trans = translations[e.locale];
          if (trans && !LOCALE_PREFIXES.some(pref => trans.title.startsWith(pref))) {
            e.title = trans.title; e.excerpt = trans.excerpt; e.content = trans.content; e.category = en.category;
            console.log("  " + e.locale + " ✓");
          } else {
            console.log("  " + e.locale + " ✗");
          }
        });
      }
    } catch (e) {
      console.log("  FAIL: " + e.message);
    }
  }

  fs.writeFileSync(path.join(cwd, "src/data/posts.json"), JSON.stringify(posts, null, 2), "utf-8");
  console.log("\n完成！");
}

main();
