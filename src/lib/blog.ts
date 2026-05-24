import { listPosts, getPostBySlug, getAllSlugs, getRelatedPosts as dbGetRelated, type BlogPost } from "@/lib/blog-admin";

export type { BlogPost } from "@/lib/blog-admin";

export function getBlogPosts(locale?: string): Omit<BlogPost, "content">[] {
  return listPosts(locale).map(({ content, ...rest }) => rest);
}

export function getBlogPost(slug: string, locale?: string): BlogPost | undefined {
  return getPostBySlug(slug, locale) ?? undefined;
}

export function getAllBlogSlugs(locale?: string): string[] {
  return getAllSlugs(locale);
}

export function getRelatedPosts(currentSlug: string, locale?: string, count: number = 3): Omit<BlogPost, "content">[] {
  return dbGetRelated(currentSlug, locale, count);
}
