import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getBlogPost, getAllBlogSlugs, getRelatedPosts } from "@/lib/blog";
import AdBanner from "@/components/AdBanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const { locales } = await import("@/i18n/config");
  const allPosts = await import("@/lib/blog-admin");
  const paths: { slug: string; locale: string }[] = [];
  for (const locale of locales) {
    const slugs = allPosts.getAllSlugs(locale);
    for (const slug of slugs) {
      paths.push({ locale, slug });
    }
  }
  return paths;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getBlogPost(slug, locale);
  const t = await getTranslations({ locale, namespace: "Blog" });
  if (!post) return { title: t("notFound") };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, locale } = await params;
  const post = getBlogPost(slug, locale);
  const t = await getTranslations({ locale, namespace: "Blog" });

  if (!post) notFound();

  const related = getRelatedPosts(slug, locale, 3);

  return (
    <div className="container-main py-16">
      <div className="max-w-3xl mx-auto">
        <a
          href={`/${locale}/blog`}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-6 inline-block"
        >
          {t("back")}
        </a>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium px-2 py-1 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-full">
            {t(`categories.${post.category}`)}
          </span>
          <span className="text-sm text-gray-400">{post.date}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

        <AdBanner slot="blog-header" className="mb-8" />

        <article className="prose dark:prose-invert max-w-none">
          {post.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
                  {line.replace("## ", "")}
                </h2>
              );
            }
            if (line.startsWith("### ")) {
              return (
                <h3 key={i} className="text-lg font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
                  {line.replace("### ", "")}
                </h3>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <li key={i} className="text-gray-600 dark:text-gray-400 ml-4">
                  {line.replace("- ", "")}
                </li>
              );
            }
            if (line.startsWith("|")) {
              return (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-pre">
                  {line}
                </p>
              );
            }
            if (line.trim() === "") {
              return <br key={i} />;
            }
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={i} className="font-semibold text-gray-900 dark:text-white mt-4">
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.startsWith("*Disclosure:")) {
              return (
                <p key={i} className="text-sm text-gray-400 dark:text-gray-500 italic mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {line.replace(/^\*/, "").replace(/\*$/, "")}
                </p>
              );
            }
            return (
              <p key={i} className="text-gray-600 dark:text-gray-400 mb-3">
                {line}
              </p>
            );
          })}
        </article>

        <AdBanner slot="blog-footer" className="mt-12 mb-8" />

        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-6">{t("related")}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((p) => (
                <a
                  key={p.slug}
                  href={`/${locale}/blog/${p.slug}`}
                  className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">
                    {p.category}
                  </p>
                  <p className="text-sm font-medium line-clamp-2">{p.title}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
