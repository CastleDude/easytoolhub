#!/usr/bin/env node
/**
 * Migrate legacy blog post categories to the 5 canonical ones:
 * Software, Equipment, Guide, Comparison, General.
 * Usage: node scripts/migrate-categories.js
 */
const fs = require("fs");
const path = require("path");
const { normalizeCategory } = require("./lib/content-pipeline");

const POSTS_PATH = path.join(process.cwd(), "src/data/posts.json");

if (!fs.existsSync(POSTS_PATH)) {
  console.error("posts.json not found at", POSTS_PATH);
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
let changed = 0;

for (const p of posts) {
  const old = p.category;
  const next = normalizeCategory(old);
  if (old !== next) {
    p.category = next;
    changed++;
  }
}

fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2), "utf8");
console.log(`Migrated ${changed}/${posts.length} posts to 5 canonical categories.`);
