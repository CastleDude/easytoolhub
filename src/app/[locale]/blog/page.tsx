import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getBlogPosts } from "@/lib/blog";
import BlogList from "@/components/BlogList";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = getBlogPosts(locale);

  return (
    <Suspense>
      <BlogList locale={locale} posts={posts} />
    </Suspense>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return { title: t("title"), description: t("description") };
}
