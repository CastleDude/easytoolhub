import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getPostBySlug } from "@/lib/blog-admin";
import type { BlogPost } from "@/lib/blog-admin";
import { readStore, writeStore } from "@/lib/db";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth) return auth;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const slug = String(formData.get("slug") || "");
  const file = formData.get("file");
  if (!slug || !(file instanceof File)) {
    return NextResponse.json({ error: "slug and file are required" }, { status: 400 });
  }

  const en = getPostBySlug(slug, "en");
  if (!en) {
    return NextResponse.json({ error: "English article not found" }, { status: 404 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "public/images/blog");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const outputPath = path.join(dir, `${slug}.webp`);
    const webp = await sharp(buffer)
      .resize(1024, 576, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
    fs.writeFileSync(outputPath, webp);

    const imageUrl = `/images/blog/${slug}.webp`;
    const posts = readStore<BlogPost>("posts");
    for (const p of posts) {
      if (p.slug === slug) {
        p.image = imageUrl;
        p.updated_at = new Date().toISOString();
      }
    }
    await writeStore("posts", posts);

    return NextResponse.json({ ok: true, imageUrl });
  } catch (e) {
    return NextResponse.json({ error: "上传失败：" + (e as Error).message }, { status: 502 });
  }
}
