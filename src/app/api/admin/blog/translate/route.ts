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

  const outcome = await translateWithDeepSeek(en.title, en.excerpt, en.content, locale);
  if (!outcome.ok) {
    return NextResponse.json({ error: "翻译失败：" + outcome.reason }, { status: 502 });
  }

  const existing = getPostBySlug(slug, locale);
  if (existing) {
    await updatePost(existing.id, {
      title: outcome.title,
      excerpt: outcome.excerpt,
      content: outcome.content,
    });
  } else {
    await createPost({
      slug,
      locale,
      title: outcome.title,
      excerpt: outcome.excerpt,
      date: en.date,
      category: en.category,
      content: outcome.content,
      image: en.image,
    });
  }

  return NextResponse.json({ ok: true, slug, locale });
}
