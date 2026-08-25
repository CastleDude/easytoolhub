#!/usr/bin/env node
/**
 * Remove duplicate posts (same locale + slug) from posts.json.
 * Keeps the first occurrence of each (locale, slug) pair.
 * Usage: node scripts/dedupe-posts.js
 */
const fs = require("fs");
const path = require("path");

const POSTS_PATH = path.join(process.cwd(), "src/data/posts.json");

if (!fs.existsSync(POSTS_PATH)) {
  console.error("posts.json not found at", POSTS_PATH);
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
const seen = new Set();
const deduped = [];
let removed = 0;

for (const p of posts) {
  const key = `${p.locale}:${p.slug}`;
  if (seen.has(key)) {
    removed++;
    continue;
  }
  seen.add(key);
  deduped.push(p);
}

fs.writeFileSync(POSTS_PATH, JSON.stringify(deduped, null, 2), "utf8");
console.log(`Removed ${removed} duplicate posts (${posts.length} → ${deduped.length}).`);
