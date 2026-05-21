import { readStore, writeStore, nextId } from "./db";

export interface FeedbackInput {
  toolSlug: string;
  rating: number;
  comment?: string;
  locale?: string;
  ipHash?: string;
}

export interface FeedbackEntry {
  id: number;
  tool_slug: string;
  locale: string;
  rating: number;
  comment: string;
  ip_hash: string;
  created_at: string;
}

const STORE = "feedback";

export async function submitFeedback(input: FeedbackInput) {
  const items = readStore<FeedbackEntry>(STORE);
  items.push({
    id: nextId(STORE),
    tool_slug: input.toolSlug,
    locale: input.locale || "en",
    rating: input.rating,
    comment: input.comment || "",
    ip_hash: input.ipHash || "",
    created_at: new Date().toISOString(),
  });
  await writeStore(STORE, items);
}

export function listFeedback(opts?: {
  toolSlug?: string;
  rating?: number;
  limit?: number;
  offset?: number;
}): FeedbackEntry[] {
  let items = readStore<FeedbackEntry>(STORE);
  const { toolSlug, rating, limit = 50, offset = 0 } = opts || {};

  if (toolSlug) items = items.filter((f) => f.tool_slug === toolSlug);
  if (rating) items = items.filter((f) => f.rating === rating);

  items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return items.slice(offset, offset + limit);
}

export async function deleteFeedback(id: number): Promise<boolean> {
  const items = readStore<FeedbackEntry>(STORE);
  const filtered = items.filter((f) => f.id !== id);
  if (filtered.length === items.length) return false;
  await writeStore(STORE, filtered);
  return true;
}

export function getFeedbackStats() {
  const items = readStore<FeedbackEntry>(STORE);
  const total = items.length;

  const avg =
    total > 0 ? items.reduce((sum, f) => sum + f.rating, 0) / total : 0;
  const averageRating = Math.round(avg * 10) / 10;

  const byRating: Record<number, number> = {};
  for (const f of items) {
    byRating[f.rating] = (byRating[f.rating] || 0) + 1;
  }

  const byTool: Record<string, number> = {};
  for (const f of items) {
    byTool[f.tool_slug] = (byTool[f.tool_slug] || 0) + 1;
  }

  return {
    total,
    averageRating,
    byRating: Object.entries(byRating).map(([rating, count]) => ({
      rating: Number(rating),
      count,
    })),
    byTool: Object.entries(byTool)
      .map(([tool_slug, count]) => ({ tool_slug, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export function getFeedbackCount(): number {
  return readStore<FeedbackEntry>(STORE).length;
}
