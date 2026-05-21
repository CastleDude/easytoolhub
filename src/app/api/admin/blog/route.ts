import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { listPosts, createPost, getPostCount, slugify } from "@/lib/blog-admin";

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;
  return NextResponse.json(listPosts());
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const body = await request.json().catch(() => ({}));
  const { title, excerpt, date, category, content } = body;
  let { slug } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!slug) {
    slug = slugify(title);
  }

  const input = {
    slug,
    title,
    excerpt: excerpt || "",
    date: date || new Date().toISOString().split("T")[0],
    category: category || "General",
    content: content || "",
  };

  const post = await createPost(input);
  return NextResponse.json(post, { status: 201 });
}
