import { readStore, writeStore, nextId } from "./db";

interface ClickRecord {
  id: number;
  tool_slug: string;
  locale: string;
  ip_hash: string;
  user_agent: string;
  referrer: string;
  created_at: string;
}

export interface ClickInput {
  toolSlug: string;
  locale?: string;
  ipHash?: string;
  userAgent?: string;
  referrer?: string;
}

const STORE = "tool_clicks";

export async function recordClick(input: ClickInput) {
  const clicks = readStore<ClickRecord>(STORE);
  clicks.push({
    id: nextId(STORE),
    tool_slug: input.toolSlug,
    locale: input.locale || "en",
    ip_hash: input.ipHash || "",
    user_agent: input.userAgent || "",
    referrer: input.referrer || "",
    created_at: new Date().toISOString(),
  });
  await writeStore(STORE, clicks);
}

export function getClickStats(days: number = 30) {
  const clicks = readStore<ClickRecord>(STORE);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const filtered = clicks.filter((c) => new Date(c.created_at) >= cutoff);
  const total = filtered.length;

  const byTool: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const byLocale: Record<string, number> = {};

  for (const c of filtered) {
    byTool[c.tool_slug] = (byTool[c.tool_slug] || 0) + 1;
    const day = c.created_at.split("T")[0];
    byDay[day] = (byDay[day] || 0) + 1;
    byLocale[c.locale] = (byLocale[c.locale] || 0) + 1;
  }

  return {
    total,
    byTool: Object.entries(byTool)
      .map(([tool_slug, count]) => ({ tool_slug, count }))
      .sort((a, b) => b.count - a.count),
    byDay: Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    byLocale: Object.entries(byLocale)
      .map(([locale, count]) => ({ locale, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export function getTotalClicks(): number {
  return readStore<ClickRecord>(STORE).length;
}
