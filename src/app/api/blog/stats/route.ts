import { NextRequest, NextResponse } from "next/server";
import { getBlogStats, incrementBlogView, incrementBlogLike } from "@/lib/blog-stats";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  return NextResponse.json({ success: true, data: getBlogStats(slug) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, action } = body;

    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    if (action === "view") {
      const stats = incrementBlogView(slug);
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === "like") {
      const stats = incrementBlogLike(slug);
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === "get") {
      return NextResponse.json({ success: true, data: getBlogStats(slug) });
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
