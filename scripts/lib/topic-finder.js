/**
 * Topic Finder — Search trending tech topics via Web Search
 */

const https = require("https");

const TOPIC_POOL = [
  "best software tools 2026 review",
  "new gadget release 2026 review",
  "productivity app comparison 2026",
  "AI tools for work 2026",
  "cybersecurity best practices 2026",
  "cloud storage comparison 2026",
  "best headphones 2026 review",
  "budget laptop recommendation 2026",
  "smart home automation 2026",
  "VPN privacy comparison 2026",
  "noise canceling earbuds 2026",
  "standing desk ergonomic 2026",
  "password manager review 2026",
  "mechanical keyboard 2026",
  "monitor for programming 2026",
  "online course platform 2026",
  "project management software 2026",
  "video conferencing tools 2026",
  "remote work setup 2026",
  "wireless charger fast 2026",
];

function searchWeb(query) {
  return new Promise((resolve, reject) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const req = https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        // Extract titles from search results
        const titles = [];
        const titleRegex = /<h3[^>]*>([^<]+)<\/h3>/g;
        let match;
        while ((match = titleRegex.exec(data)) !== null) {
          const title = match[1].replace(/<[^>]+>/g, "").trim();
          if (title && title.length > 10) titles.push(title);
        }
        resolve({ query, titles: titles.slice(0, 3) });
      });
    });
    req.on("error", (e) => {
      // If search fails, return the query itself as fallback topic
      resolve({ query, titles: [query] });
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ query, titles: [query] });
    });
  });
}

function loadUsedTopics() {
  try {
    const fs = require("fs");
    const path = require("path");
    const logPath = path.join(process.cwd(), "src/data/fetch-log.json");
    if (fs.existsSync(logPath)) {
      const log = JSON.parse(fs.readFileSync(logPath, "utf-8"));
      const used = new Set();
      (log.entries || []).slice(-30).forEach((e) => {
        (e.topics || []).forEach((t) => used.add(t.toLowerCase()));
      });
      return used;
    }
  } catch {}
  return new Set();
}

async function findTopics(count = 5) {
  const used = loadUsedTopics();

  // Shuffle pool, pick topics not recently used
  const shuffled = [...TOPIC_POOL].sort(() => Math.random() - 0.5);
  const candidates = shuffled.filter((q) => !used.has(q.toLowerCase()));
  const selected = candidates.slice(0, count);

  // If not enough fresh topics, fall back to random from full pool
  while (selected.length < count) {
    const rand = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
    if (!selected.includes(rand)) selected.push(rand);
  }

  console.log(`[TopicFinder] Searching ${selected.length} topics...`);
  const results = await Promise.all(selected.map(searchWeb));

  return results.map((r) => ({
    query: r.query,
    sources: r.titles,
  }));
}

module.exports = { findTopics, TOPIC_POOL };
