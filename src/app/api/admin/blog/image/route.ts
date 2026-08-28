import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getPostBySlug } from "@/lib/blog-admin";
import type { BlogPost } from "@/lib/blog-admin";
import { readStore, writeStore } from "@/lib/db";
import { generateArticleImage } from "@/lib/runware";

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const body = await request.json().catch(() => ({}));
  const { slug, prompt } = body;
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const en = getPostBySlug(slug, "en");
  if (!en) {
    return NextResponse.json({ error: "English article not found" }, { status: 404 });
  }

  try {
    const result = await generateArticleImage(slug, en.title, en.content, prompt);

    // Update image + imagePrompt for ALL locales of this slug (they share the cover)
    const posts = readStore<BlogPost>("posts");
    let updated = 0;
    for (const p of posts) {
      if (p.slug === slug) {
        p.image = result.imageUrl;
        p.imagePrompt = result.prompt;
        p.updated_at = new Date().toISOString();
        updated++;
      }
    }
    await writeStore("posts", posts);
    if (updated === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, imageUrl: result.imageUrl, prompt: result.prompt });
  } catch (e) {
    return NextResponse.json({ error: "生成失败：" + (e as Error).message }, { status: 502 });
  }
}
