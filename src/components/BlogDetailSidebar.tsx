"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Post {
  slug: string;
  title: string;
  category: string;
  date: string;
  image?: string;
}

function PostViews({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/blog/stats?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.data) setViews(d.data.views); })
      .catch(() => {});
  }, [slug]);

  if (views === null) return null;
  return (
    <span className="flex items-center gap-0.5 text-xs text-gray-400">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      {views}
    </span>
  );
}

export default function BlogDetailSidebar({
  locale,
  currentSlug,
  posts,
  categoryLabel,
}: {
  locale: string;
  currentSlug: string;
  posts: Post[];
  categoryLabel?: string;
}) {
  const t = useTranslations("Blog");
  const searchParams = useSearchParams();
  const allLabel = categoryLabel || "All";
  const categories = ["Software", "Equipment", "Guide", "Comparison", "General"];
  const activeCat = searchParams?.get("category") || "all";

  // Popular: top 5 posts, exclude current
  const popular = posts.filter((p) => p.slug !== currentSlug).slice(0, 5);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        {/* Category nav */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t("categoriesTitle") || "Categories"}
          </h3>
          <nav className="space-y-1">
            <Link
              href={`/${locale}/blog`}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCat === "all"
                  ? "bg-primary-600 text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {allLabel}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/${locale}/blog?category=${cat}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCat === cat
                    ? "bg-primary-600 text-white font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {t(`categories.${cat}`)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Popular posts */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t("popular") || "Popular Reviews"}
          </h3>
          <div className="space-y-3">
            {popular.map((p) => (
              <Link
                key={p.slug}
                href={`/${locale}/blog/${p.slug}`}
                className="flex gap-3 group"
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-200 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {p.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-between">{p.date}<PostViews slug={p.slug} /></p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
