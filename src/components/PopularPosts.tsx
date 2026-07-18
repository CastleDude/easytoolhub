"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface PostItem {
  slug: string;
  title: string;
  views: number;
  image?: string;
}

export default function PopularPosts() {
  const locale = useLocale();
  const t = useTranslations("Blog");
  const [posts, setPosts] = useState<PostItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then(async (allPosts: any[]) => {
        const enPosts = (allPosts || []).filter((p: any) => p.locale === locale);
        const withStats = await Promise.all(
          enPosts.slice(0, 15).map((p: any) =>
            fetch(`/api/blog/stats?slug=${p.slug}`)
              .then((r) => r.json())
              .then((d) => ({
                slug: p.slug,
                title: p.title,
                views: d.data?.views || 0,
                image: p.image,
              }))
              .catch(() => ({ slug: p.slug, title: p.title, views: 0 }))
          )
        );
        setPosts(withStats.sort((a, b) => b.views - a.views).slice(0, 6));
      })
      .catch(() => {});
  }, [locale]);

  if (posts.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
        🔥 {t("popular")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${locale}/blog/${post.slug}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all group"
          >
            {post.image && (
              <img
                src={post.image}
                alt=""
                className="w-16 h-16 rounded-lg object-cover shrink-0"
                loading="lazy"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {post.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">👁 {post.views} {t("viewsCount")}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
