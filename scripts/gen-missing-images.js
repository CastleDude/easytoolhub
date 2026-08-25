#!/usr/bin/env node
/**
 * Generate missing article cover images.
 * Scans posts.json for English articles without a cover image and generates one
 * (Runware → WebP 252×142), updating the `image` field.
 * Usage: cd /www/easytoolhub && node scripts/gen-missing-images.js
 */

// Load env from .env.local
const fs = require("fs");
const path = require("path");
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const { generateArticleImage } = require("./lib/image-gen");

const POSTS_PATH = path.join(process.cwd(), "src/data/posts.json");

async function main() {
  if (!process.env.RUNWARE_API_KEY) {
    console.error("RUNWARE_API_KEY not found in .env.local");
    process.exit(1);
  }

  const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
  const enArticles = posts.filter((p) => p.locale === "en");
  const blogDir = path.join(process.cwd(), "public/images/blog");

  let done = 0;
  let failed = 0;
  let skipped = 0;

  for (const a of enArticles) {
    const webp = path.join(blogDir, `${a.slug}.webp`);
    const png = path.join(blogDir, `${a.slug}.png`);
    if (fs.existsSync(webp) || fs.existsSync(png)) {
      skipped++;
      continue;
    }
    try {
      const img = await generateArticleImage(a.slug, a.title);
      if (img) {
        posts.forEach((p) => {
          if (p.slug === a.slug) p.image = img;
        });
        done++;
      } else {
        failed++;
      }
    } catch (e) {
      failed++;
      console.log("  ERR:", e.message);
    }
  }

  if (done > 0) {
    fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2), "utf8");
    console.log(`Updated ${done} posts' image paths.`);
  }

  console.log(`Done: generated ${done}, failed ${failed}, already-have-image ${skipped}.`);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
