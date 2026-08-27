import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getPostBySlug, createPost, updatePost } from "@/lib/blog-admin";
import { translateWithDeepSeek } from "@/lib/deepseek";

const TARGET_LOCALES = ["zh", "es", "fr", "de", "ja", "ko", "ru"];

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const body = await request.json().catch(() => ({}));
  const { slug, locale } = body;

  if (!slug || !locale) {
    return NextResponse.json({ error: "slug and locale are required" }, { status: 400 });
  }
  if (!TARGET_LOCALES.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const en = getPostBySlug(slug, "en");
  if (!en) {
    return NextResponse.json({ error: "English article not found" }, { status: 404 });
  }

  const translated = await translateWithDeepSeek(en.title, en.excerpt, en.content, locale);
  if (!translated) {
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });
  }

  const existing = getPostBySlug(slug, locale);
  if (existing) {
    await updatePost(existing.id, {
      title: translated.title,
      excerpt: translated.excerpt,
      content: translated.content,
    });
  } else {
    await createPost({
      slug,
      locale,
      title: translated.title,
      excerpt: translated.excerpt,
      date: en.date,
      category: en.category,
      content: translated.content,
      image: en.image,
    });
  }

  return NextResponse.json({ ok: true, slug, locale });
}
