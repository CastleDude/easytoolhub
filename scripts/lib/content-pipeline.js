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
    const foundTopics = await findTopics(5);
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

    // Step 3: Translate
    console.log("[Step 3/4] Translating to 8 languages...");
    const posts = loadPosts();
    const maxId = Math.max(...posts.map((p) => p.id), 0);
    let nextId = maxId + 1;
    const today = new Date().toISOString().split("T")[0];

    for (const article of articles) {
      try {
        const translations = await translateArticle(article);
        console.log(`  "${article.title.substring(0, 40)}..." -> 8 locales`);

        // Add all locale versions to posts
        for (const [locale, trans] of Object.entries(translations)) {
          posts.push({
            id: nextId++,
            slug: article.slug,
            locale,
            title: trans.title,
            excerpt: trans.excerpt,
            date: today,
            category: trans.category || article.category,
            content: trans.content,
            image: article.image,
            created_at: today,
            updated_at: today,
          });
        }
      } catch (e) {
        console.error(`  Translation failed for "${article.slug}":`, e.message);
        errors.push(`Translate: ${article.slug}: ${e.message}`);
      }
    }

    // Step 4: Generate images
    console.log("\n[Step 4/5] Generating cover images...");
    for (const article of articles) {
      try {
        article.image = await generateArticleImage(article.slug, article.title);
        // Update image path in all locale entries for this article
        if (article.image) {
          for (const post of posts) {
            if (post.slug === article.slug) {
              post.image = article.image;
            }
          }
        }
      } catch (e) {
        console.error(`  Image failed for "${article.slug}":`, e.message);
        errors.push(`Image: ${article.slug}: ${e.message}`);
      }
    }

    // Save all posts
    savePosts(posts);

    // Step 5: Submit new article URLs to search engines
    console.log("\n[Step 5/5] Submitting new URLs to IndexNow...");
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytoolhub.com";

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

module.exports = { runPipeline };
