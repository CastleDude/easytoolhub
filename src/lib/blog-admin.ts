import { readStore, writeStore, nextId } from "./db";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInput {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
}

const STORE = "posts";

const SEED_DATA: Omit<BlogPost, "id" | "created_at" | "updated_at">[] = [
  {
    slug: "best-productivity-apps",
    title: "Best Productivity Apps in 2026: Boost Your Workflow",
    excerpt: "We tested over 20 productivity apps to find the best ones for task management, note-taking, and focus. Here are our top picks.",
    date: "2026-05-15",
    category: "Software",
    content: `## Why Productivity Apps Matter\n\nIn an era of constant distractions, having the right productivity tools can mean the difference between a productive day and a wasted one.\n\n### Best Overall: Notion\n\nNotion combines notes, tasks, databases, and wikis into one flexible workspace.\n\n**Rating: 4.5/5**`,
  },
  {
    slug: "best-note-taking-apps",
    title: "5 Best Note-Taking Apps Compared (2026 Edition)",
    excerpt: "From simple to sophisticated — find the perfect note-taking app for your workflow with our hands-on comparison.",
    date: "2026-05-10",
    category: "Software",
    content: `## The Note-Taking Landscape in 2026\n\nNote-taking apps have evolved dramatically.\n\n### 1. Notion — Best All-Rounder\n\nNotion's block-based editor and database features make it suitable for everything.\n\n**Rating: 4.5/5**`,
  },
  {
    slug: "best-standing-desks",
    title: "Best Standing Desks for Home Offices in 2026",
    excerpt: "We researched and tested the top standing desks to find the best options for every budget and workspace.",
    date: "2026-04-28",
    category: "Equipment",
    content: `## Why Invest in a Standing Desk?\n\nStudies show that alternating between sitting and standing can reduce back pain and improve energy levels.\n\n### Best Overall: Uplift V2\n\nExceptional stability at standing height, a huge range of desktop options, and a 15-year warranty.\n\n**Rating: 4.8/5**`,
  },
];

let seededCache: BlogPost[] | null = null;

function ensureSeeded(): BlogPost[] {
  const existing = readStore<BlogPost>(STORE);
  if (existing.length > 0) return existing;
  if (seededCache) return seededCache;
  const now = new Date().toISOString();
  seededCache = SEED_DATA.map((post, i) => ({
    ...post,
    id: i + 1,
    created_at: now,
    updated_at: now,
  }));
  return seededCache;
}

export function listPosts(): BlogPost[] {
  return ensureSeeded().sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostById(id: number): BlogPost | undefined {
  return ensureSeeded().find((p) => p.id === id);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return ensureSeeded().find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return ensureSeeded().map((p) => p.slug);
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const posts = [...ensureSeeded()];
  const now = new Date().toISOString();
  const maxId = posts.reduce((max, p) => Math.max(max, p.id), 0);
  const post: BlogPost = {
    id: maxId + 1,
    ...input,
    created_at: now,
    updated_at: now,
  };
  posts.push(post);
  await writeStore(STORE, posts);
  seededCache = null;
  return post;
}

export async function updatePost(id: number, input: Partial<BlogPostInput>): Promise<BlogPost | undefined> {
  const posts = [...ensureSeeded()];
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  posts[index] = {
    ...posts[index],
    ...input,
    updated_at: new Date().toISOString(),
  };
  await writeStore(STORE, posts);
  seededCache = null;
  return posts[index];
}

export async function deletePost(id: number): Promise<boolean> {
  const posts = [...ensureSeeded()];
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  await writeStore(STORE, filtered);
  seededCache = null;
  return true;
}

export function getRelatedPosts(currentSlug: string, count: number = 3): Omit<BlogPost, "content">[] {
  const posts = ensureSeeded()
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
  return posts.map(({ content, ...rest }) => rest);
}

export function getPostCount(): number {
  return ensureSeeded().length;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}
