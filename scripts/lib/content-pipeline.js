/**
 * Content Pipeline — Orchestrate article generation, translation, image gen, and data writing
 */

const { findTopics } = require("./topic-finder");
const { generateArticle } = require("./ai-writer");
const { translateArticle } = require("./translator");
const { generateArticleImage } = require("./image-gen");

const fs = require("fs");
const path = require("path");

const POSTS_PATH = path.join(process.cwd(), "src/data/posts.json");
const LOG_PATH = path.join(process.cwd(), "src/data/fetch-log.json");
const MAX_POSTS = 500; // Keep total posts manageable

const KNOWN_CATEGORIES = ["Software", "Equipment", "Guide", "Comparison", "General"];

function normalizeCategory(cat) {
  if (!cat) return "General";
  const c = String(cat).trim();
  const lower = c.toLowerCase();

  // Canonical match
  for (const k of KNOWN_CATEGORIES) {
    if (k.toLowerCase() === lower) return k;
  }

  // Map legacy & freeform values onto the 5 canonical categories
  // Software: apps, tools, productivity, platforms, security software
  if (
    lower.includes("softwar") || lower.includes("app") || lower.includes("tool")
    || lower.includes("productiv") || lower.includes("platform") || lower.includes("secur")
  ) return "Software";
  // Equipment: hardware, gadgets, laptops, audio, accessories, smart home, AR glasses, peripherals
  if (
    lower.includes("hardwar") || lower.includes("gadget") || lower.includes("gear")
    || lower.includes("device") || lower.includes("laptop") || lower.includes("notebook")
    || lower.includes("audio") || lower.includes("sound") || lower.includes("headphone")
    || lower.includes("earbud") || lower.includes("accessor") || lower.includes("smart")
    || lower.includes("glass") || lower.includes("monitor") || lower.includes("keyboard")
    || lower.includes("charger") || lower.includes("speaker") || lower.includes("camera")
    || lower.includes("router") || lower.includes("webcam")
  ) return "Equipment";
  // Guide: tutorials, how-tos, tips
  if (
    lower.includes("guide") || lower.includes("tutorial") || lower.includes("how")
    || lower.includes("tips")
  ) return "Guide";
  // Comparison: reviews, best-of, vs, rankings
  if (
    lower.includes("compar") || lower.includes("versus") || lower.includes(" vs")
    || lower.includes("review") || lower.includes("best") || lower.includes("top")
    || lower.includes("tested") || lower.includes("rank")
  ) return "Comparison";
  return "General";
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

function loadPosts() {
  try {
    if (fs.existsSync(POSTS_PATH)) {
      return JSON.parse(fs.readFileSync(POSTS_PATH, "utf-8"));
    }
  } catch {}
  return [];
}

function savePosts(posts) {
  // Keep max posts
  if (posts.length > MAX_POSTS) {
    posts = posts.slice(posts.length - MAX_POSTS);
  }
  const dir = path.dirname(POSTS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2), "utf-8");
}

function logRun(success, topics, articleSlugs, errors) {
  try {
    const dir = path.dirname(LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let log = { entries: [] };
    if (fs.existsSync(LOG_PATH)) {
      log = JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"));
    }

    log.entries.push({
      timestamp: new Date().toISOString(),
      success,
      topics,
      articleSlugs,
      errors,
    });

    // Keep last 100 log entries
    if (log.entries.length > 100) {
      log.entries = log.entries.slice(-100);
    }

    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf-8");
  } catch {}
}

async function runPipeline() {
  const startTime = Date.now();
  const errors = [];
  const articleSlugs = [];
  const topics = [];

  console.log("\n========================================");
  console.log("[Pipeline] Starting daily content fetch");
  console.log("========================================\n");

  try {
    // Step 1: Find topics
    console.log("[Step 1/4] Finding trending topics...");
    const foundTopics = await findTopics(2);
    topics.push(...foundTopics.map((t) => t.query));
    console.log(`  Found ${foundTopics.length} topics\n`);

    // Step 2: Generate articles
    console.log("[Step 2/4] Generating articles...");
    const articles = [];
    for (const topic of foundTopics) {
      try {
        console.log(`  Generating: "${topic.query.substring(0, 60)}..."`);
        const article = await generateArticle(topic);
        article.slug = slugify(article.title);
        article.date = new Date().toISOString().split("T")[0];
        // Normalize category to known values
        article.category = normalizeCategory(article.category);
        article.image = `/images/blog/${article.slug}.png`;
        articles.push(article);
        articleSlugs.push(article.slug);
        console.log(`  -> OK: "${article.title.substring(0, 50)}..." [${article.category}]`);
      } catch (e) {
        console.error(`  -> FAILED: ${e.message}`);
        errors.push(`Generate: ${topic.query}: ${e.message}`);
      }
    }
    console.log(`  Generated ${articles.length}/${foundTopics.length} articles\n`);

    // Save immediately so data isn't lost if translation crashes
    const posts = loadPosts();
    const maxId = Math.max(...posts.map((p) => p.id), 0);
    let nextId = maxId + 1;
    const today = new Date().toISOString().split("T")[0];

    // Save English versions first
    for (const article of articles) {
      posts.push({
        id: nextId++, slug: article.slug, locale: "en",
        title: article.title, excerpt: article.excerpt, date: today,
        category: article.category, content: article.content,
        image: article.image, created_at: today, updated_at: today,
      });
    }
    savePosts(posts);
    console.log("  Saved", articles.length, "English articles (safe)\n");

    // Step 3 & 4: Run translation and image generation in PARALLEL
    console.log("[Step 3+4] Translating & generating images in parallel...\n");

    const translateAll = (async () => {
      console.log("  [Translate] Starting...");
      for (const article of articles) {
        try {
          const translations = await translateArticle(article);
          console.log(`    "${article.title.substring(0, 40)}..." -> 8 locales`);
          for (const [locale, trans] of Object.entries(translations)) {
            posts.push({
              id: nextId++, slug: article.slug, locale,
              title: trans.title, excerpt: trans.excerpt, date: today,
              category: normalizeCategory(trans.category || article.category),
              content: trans.content, image: article.image,
              created_at: today, updated_at: today,
            });
          }
        } catch (e) {
          console.error(`    Translation failed for "${article.slug}":`, e.message);
          errors.push(`Translate: ${article.slug}: ${e.message}`);
        }
      }
      console.log("  [Translate] Done");
    })();

    const imagesAll = (async () => {
      console.log("  [Images] Starting...");
      for (const article of articles) {
        try {
          const generatedImage = await generateArticleImage(article.slug, article.title);
          // Update article ref so parallel translate picks up correct path
          article.image = generatedImage || null;
          for (const post of posts) {
            if (post.slug === article.slug) post.image = article.image;
          }
          if (!generatedImage) console.log(`    No image for "${article.slug}" — clearing`);
        } catch (e) {
          console.error(`    Image failed for "${article.slug}":`, e.message);
          errors.push(`Image: ${article.slug}: ${e.message}`);
          article.image = null;
          for (const post of posts) {
            if (post.slug === article.slug) post.image = null;
          }
        }
      }
      console.log("  [Images] Done");
    })();

    // Wait for both to complete
    await Promise.all([translateAll, imagesAll]);
    console.log("  Translation & images complete\n");

    // Save all posts
    savePosts(posts);

    // Step 5: Submit new article URLs to search engines
    console.log("\n[Step 5/5] Submitting new URLs to IndexNow...");
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytoolhub.top";

      // Only submit the NEW articles to IndexNow (not full sitemap every day)
      const newUrls = articleSlugs.map((s) => `${siteUrl}/en/blog/${s}`);
      const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: new URL(siteUrl).hostname,
          key: "easytoolhub2026indexnowkey",
          keyLocation: `${siteUrl}/easytoolhub2026indexnowkey.txt`,
          urlList: newUrls,
        }),
      });
      console.log(`  IndexNow: ${indexNowRes.ok ? "OK" : indexNowRes.status} — submitted ${newUrls.length} new URLs`);
    } catch (e) {
      console.error(`  IndexNow submission failed: ${e.message}`);
      errors.push(`SEO: ${e.message}`);
    }

    // Step 6: Auto-fix any failed translations (locale-prefixed titles)
    console.log("\n[Step 6/6] Checking for translation failures...");
    const LOCALE_PREFIXES = ["[ZH]", "[ES]", "[FR]", "[DE]", "[JA]", "[KO]", "[RU]"];
    let failedTranslations = posts.filter(p =>
      p.locale !== "en" && LOCALE_PREFIXES.some(pref => p.title.startsWith(pref))
    );
    if (failedTranslations.length > 0) {
      console.log(`  Found ${failedTranslations.length} failed translations, retrying...`);
      const { translateArticle } = require("./translator");
      const enMap = {};
      posts.forEach(p => { if (p.locale === "en") enMap[p.slug] = p; });
      const brokenSlugs = [...new Set(failedTranslations.map(p => p.slug))];
      for (const slug of brokenSlugs) {
        const en = enMap[slug];
        if (!en) continue;
        try {
          const translations = await translateArticle({
            title: en.title, excerpt: en.excerpt, content: en.content, category: en.category,
          });
          const broken = failedTranslations.filter(p => p.slug === slug);
          broken.forEach(p => {
            const trans = translations[p.locale];
            if (trans && !LOCALE_PREFIXES.some(pref => trans.title.startsWith(pref))) {
              p.title = trans.title;
              p.excerpt = trans.excerpt;
              p.content = trans.content;
              p.category = en.category;
            }
          });
          console.log(`    ${slug.substring(0,30)}... ✓`);
        } catch (e) {
          console.error(`    ${slug.substring(0,30)}... ✗`);
        }
      }
      savePosts(posts);
    } else {
      console.log("  All translations OK");
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n[Pipeline] Complete! ${articles.length} articles, ${errors.length} errors, ${elapsed}s (auto-submitted to IndexNow)`);

    logRun(errors.length === 0, topics, articleSlugs, errors);
    return { success: true, articles: articleSlugs, errors };
  } catch (e) {
    console.error("[Pipeline] Fatal error:", e.message);
    logRun(false, topics, articleSlugs, [...errors, e.message]);
    return { success: false, articles: articleSlugs, errors };
  }
}

module.exports = { runPipeline, normalizeCategory };
