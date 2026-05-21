import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getPostById, updatePost, deletePost, slugify } from "@/lib/blog-admin";

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

  const post = await updatePost(Number(id), body);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
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
  const success = await deletePost(Number(id));
  if (!success) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
