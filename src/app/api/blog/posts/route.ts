import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/db";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") || "en";

  try {
    const posts = readStore<any>("posts") || [];
    const filtered = posts.filter((p: any) => p.locale === locale);
    const list = filtered.map(({ content, created_at, updated_at, ...rest }: any) => rest);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([]);
  }
}
