import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getPostById, updatePost, deletePostsBySlug, getPostBySlug, createPost, slugify } from "@/lib/blog-admin";
import { translatePost } from "@/lib/translate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const { id } = await params;
  const post = getPostById(Number(id));
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.slug === "") {
    body.slug = body.title ? slugify(body.title) : undefined;
  }

  const original = getPostById(Number(id));
  const post = await updatePost(Number(id), body);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Re-translate if content changed and DeepL is configured
  const contentChanged = body.content && body.content !== original?.content;
  const titleChanged = body.title && body.title !== original?.title;
  const excerptChanged = body.excerpt && body.excerpt !== original?.excerpt;

  if ((contentChanged || titleChanged || excerptChanged) && post.content && post.content.length > 10) {
    const translations = await translatePost(post.title, post.excerpt, post.content, post.locale);

    for (const t of translations) {
      const existing = getPostBySlug(post.slug, t.locale);
      if (existing) {
        await updatePost(existing.id, {
          title: t.title,
          excerpt: t.excerpt || "",
          content: t.content || "",
        });
      } else {
        await createPost({
          slug: post.slug,
          locale: t.locale,
          title: t.title,
          excerpt: t.excerpt || "",
          date: post.date,
          category: post.category,
          content: t.content || "",
        });
      }
    }
  }

  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const { id } = await params;
  const post = getPostById(Number(id));
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const deleted = await deletePostsBySlug(post.slug);
  return NextResponse.json({ success: true, deleted });
}
