#!/usr/bin/env node
/**
 * Daily Content Fetcher
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

const { runPipeline } = require("./lib/content-pipeline");

async function main() {
  const args = process.argv.slice(2);
  const isDaemon = args.includes("--daemon");

  if (isDaemon) {
    console.log("[DailyFetch] Starting daemon mode...");
    console.log("[DailyFetch] Will run every day at 08:00 Beijing time (00:00 UTC)\n");

    // Run immediately on start
    await runPipeline();

    // Calculate time until next 00:00 UTC
    function scheduleNext() {
      const now = new Date();
      const next = new Date(now);
      next.setUTCHours(24, 0, 0, 0); // Next midnight UTC

      const msUntilNext = next.getTime() - now.getTime();
      const hours = Math.floor(msUntilNext / 3600000);
      const mins = Math.floor((msUntilNext % 3600000) / 60000);

      console.log(`\n[DailyFetch] Next run in ${hours}h ${mins}m`);

      setTimeout(() => {
        runPipeline().then(() => {
          scheduleNext();
        });
      }, msUntilNext);
    }

    scheduleNext();
  } else {
    console.log("[DailyFetch] Running single fetch...");
    const result = await runPipeline();

    if (result.success) {
      console.log(`\n✅ Success! Generated ${result.articles.length} articles`);
      console.log(result.articles.map((s) => `  - ${s}`).join("\n"));
      process.exit(0);
    } else {
      console.log(`\n⚠️ Completed with ${result.errors.length} errors`);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error("[DailyFetch] Fatal:", e.message);
  process.exit(1);
});
