import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { listPosts, createPost, getPostBySlug, slugify } from "@/lib/blog-admin";
import { translatePost } from "@/lib/translate";

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;
  const locale = request.nextUrl.searchParams.get("locale") || undefined;
  return NextResponse.json(listPosts(locale));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const body = await request.json().catch(() => ({}));
  const { title, excerpt, date, category, content, locale } = body;
  let { slug } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!slug) {
    slug = slugify(title);
  }

  const sourceLocale = locale || "zh";

  const input = {
    slug,
    locale: sourceLocale,
    title,
    excerpt: excerpt || "",
    date: date || new Date().toISOString().split("T")[0],
    category: category || "General",
    content: content || "",
  };

  const post = await createPost(input);

  // Auto-translate to other languages
  if (content && content.length > 10) {
    const translations = await translatePost(title, input.excerpt, content, sourceLocale);

    for (const t of translations) {
      // Check if a translation with this slug+locale already exists
      const existing = getPostBySlug(slug, t.locale);
      if (!existing) {
        await createPost({
          slug,
          locale: t.locale,
          title: t.title,
          excerpt: t.excerpt || "",
          date: input.date,
          category: input.category,
          content: t.content || "",
        });
      }
    }
  }

  return NextResponse.json(post, { status: 201 });
}
