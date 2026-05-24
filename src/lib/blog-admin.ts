import { readStore, writeStore, nextId } from "./db";

export interface BlogPost {
  id: number;
  slug: string;
  locale: string;
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
  locale?: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
}

const STORE = "posts";

export function listPosts(locale?: string): BlogPost[] {
  const posts = readStore<BlogPost>(STORE);
  const filtered = locale ? posts.filter((p) => p.locale === locale) : posts;
  return filtered.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostById(id: number): BlogPost | undefined {
  return readStore<BlogPost>(STORE).find((p) => p.id === id);
}

export function getPostBySlug(slug: string, locale?: string): BlogPost | undefined {
  const posts = readStore<BlogPost>(STORE);
  if (locale) {
    return posts.find((p) => p.slug === slug && p.locale === locale);
  }
  return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(locale?: string): string[] {
  const posts = readStore<BlogPost>(STORE);
  const filtered = locale ? posts.filter((p) => p.locale === locale) : posts;
  return filtered.map((p) => p.slug);
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const posts = readStore<BlogPost>(STORE);
  const now = new Date().toISOString();
  const post: BlogPost = {
    id: nextId(STORE),
    locale: input.locale || "en",
    ...input,
    created_at: now,
    updated_at: now,
  };
  posts.push(post);
  await writeStore(STORE, posts);
  return post;
}

export async function updatePost(id: number, input: Partial<BlogPostInput>): Promise<BlogPost | undefined> {
  const posts = readStore<BlogPost>(STORE);
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  posts[index] = {
    ...posts[index],
    ...input,
    updated_at: new Date().toISOString(),
  };
  await writeStore(STORE, posts);
  return posts[index];
}

export async function deletePost(id: number): Promise<boolean> {
  const posts = readStore<BlogPost>(STORE);
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  await writeStore(STORE, filtered);
  return true;
}

export async function deletePostsBySlug(slug: string): Promise<number> {
  const posts = readStore<BlogPost>(STORE);
  const matched = posts.filter((p) => p.slug === slug);
  if (matched.length === 0) return 0;
  const filtered = posts.filter((p) => p.slug !== slug);
  await writeStore(STORE, filtered);
  return matched.length;
}

export function getRelatedPosts(currentSlug: string, locale?: string, count: number = 3): Omit<BlogPost, "content">[] {
  const posts = readStore<BlogPost>(STORE)
    .filter((p) => p.slug !== currentSlug && (!locale || p.locale === locale))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
  return posts.map(({ content, ...rest }) => rest);
}

export function getPostCount(locale?: string): number {
  const posts = readStore<BlogPost>(STORE);
  return locale ? posts.filter((p) => p.locale === locale).length : posts.length;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}
