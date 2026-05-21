import { listPosts, getPostBySlug, getAllSlugs, getRelatedPosts as dbGetRelated, type BlogPost } from "@/lib/blog-admin";

export type { BlogPost } from "@/lib/blog-admin";

export function getBlogPosts(): Omit<BlogPost, "content">[] {
  return listPosts().map(({ content, ...rest }) => rest);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getPostBySlug(slug) ?? undefined;
}

export function getAllBlogSlugs(): string[] {
  return getAllSlugs();
}

export function getRelatedPosts(currentSlug: string, count: number = 3): Omit<BlogPost, "content">[] {
  return dbGetRelated(currentSlug, count);
}
