import { getTranslations } from "next-intl/server";
import { getBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const posts = getBlogPosts(locale);

  return (
    <div className="container-main py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">{t("title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          {t("subtitle")}
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/${locale}/blog/${post.slug}`}
            className="block p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2 py-1 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-full">
                {t(`categories.${post.category}`)}
              </span>
              <span className="text-xs text-gray-400">{post.date}</span>
            </div>
            <h2 className="font-semibold text-lg mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {post.excerpt}
            </p>
          </a>
        ))}
      </div>
    </div>
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
