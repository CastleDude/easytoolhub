import { NextResponse } from "next/server";
import { getAllSlugs } from "@/lib/blog-admin";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytoolhub.top";

interface PingResult {
  engine: string;
  status: number;
  ok: boolean;
  error?: string;
}

async function pingGoogle(sitemapUrl: string): Promise<PingResult> {
  try {
    const res = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      { method: "GET" }
    );
    return { engine: "Google", status: res.status, ok: res.ok };
  } catch (e: any) {
    return { engine: "Google", status: 0, ok: false, error: e.message };
  }
}

async function pingBing(sitemapUrl: string): Promise<PingResult> {
  try {
    const res = await fetch(
      `https://www.bing.com/indexnow?url=${encodeURIComponent(sitemapUrl)}&key=easytoolhub`,
      { method: "GET" }
    );
    return { engine: "Bing", status: res.status, ok: res.ok };
  } catch (e: any) {
    return { engine: "Bing", status: 0, ok: false, error: e.message };
  }
}

async function indexNowSubmit(urls: string[]): Promise<PingResult> {
  const key = "easytoolhub2026indexnowkey";
  const keyLocation = `${siteUrl}/${key}.txt`;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key,
        keyLocation,
        urlList: urls,
      }),
    });
    return { engine: "IndexNow", status: res.status, ok: res.ok };
  } catch (e: any) {
    return { engine: "IndexNow", status: 0, ok: false, error: e.message };
  }
}

export async function POST() {
  const results: PingResult[] = [];
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  // 1. Ping Google
  const googleResult = await pingGoogle(sitemapUrl);
  results.push(googleResult);

  // 2. Ping Bing
  const bingResult = await pingBing(sitemapUrl);
  results.push(bingResult);

  // 3. IndexNow - submit recent blog posts
  const slugs = getAllSlugs();
  const urls = slugs.slice(-10).map((slug) => `${siteUrl}/en/blog/${slug}`);
  if (urls.length > 0) {
    const indexNowResult = await indexNowSubmit(urls);
    results.push(indexNowResult);
  }

  // 4. Also submit homepage + tools
  const topUrls = [`${siteUrl}/en`, `${siteUrl}/en/tools`, `${siteUrl}/en/blog`];
  const indexNowTop = await indexNowSubmit(topUrls);
  results.push({ ...indexNowTop, engine: "IndexNow (Top)" });

  const allOk = results.every((r) => r.ok);

  return NextResponse.json({
    success: allOk,
    message: allOk ? "All search engines notified" : "Some notifications failed",
    results,
    sitemapUrl,
    urlsSubmitted: urls.length + topUrls.length,
  });
}
