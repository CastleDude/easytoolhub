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

export function listPosts(): BlogPost[] {
  return readStore<BlogPost>(STORE).sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostById(id: number): BlogPost | undefined {
  return readStore<BlogPost>(STORE).find((p) => p.id === id);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return readStore<BlogPost>(STORE).find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return readStore<BlogPost>(STORE).map((p) => p.slug);
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const posts = readStore<BlogPost>(STORE);
  const now = new Date().toISOString();
  const post: BlogPost = {
    id: nextId(STORE),
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

export function getRelatedPosts(currentSlug: string, count: number = 3): Omit<BlogPost, "content">[] {
  const posts = readStore<BlogPost>(STORE)
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
  return posts.map(({ content, ...rest }) => rest);
}

export function getPostCount(): number {
  return readStore<BlogPost>(STORE).length;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}
