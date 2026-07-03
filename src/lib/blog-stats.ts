import fs from "fs";
import path from "path";

const STATS_FILE = path.join(process.cwd(), "src/data/blog-stats.json");

interface BlogStat {
  views: number;
  likes: number;
}

type StatsMap = Record<string, BlogStat>;

function readStats(): StatsMap {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function writeStats(stats: StatsMap): void {
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
}

export function getBlogStats(slug: string): BlogStat {
  const stats = readStats();
  return stats[slug] || { views: 0, likes: 0 };
}

export function incrementBlogView(slug: string): BlogStat {
  const stats = readStats();
  if (!stats[slug]) stats[slug] = { views: 0, likes: 0 };
  stats[slug].views += 1;
  writeStats(stats);
  return stats[slug];
}

export function incrementBlogLike(slug: string): BlogStat {
  const stats = readStats();
  if (!stats[slug]) stats[slug] = { views: 0, likes: 0 };
  stats[slug].likes += 1;
  writeStats(stats);
  return stats[slug];
}
