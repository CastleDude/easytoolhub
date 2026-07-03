"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image?: string;
}

export default function BlogList({
  locale,
  posts,
}: {
  locale: string;
  posts: Post[];
}) {
  const t = useTranslations("Blog");
  const searchParams = useSearchParams();
  const [active, setActive] = useState("all");
  const [mounted, setMounted] = useState(false);
  const [stuck, setStuck] = useState(false);

  // Sync category from URL on client (avoid SSR hydration mismatch)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActive(cat);
    setMounted(true);
  }, [searchParams]);
  const navRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const categories = ["all", ...Array.from(new Set(posts.map((p) => p.category)))];

  const filtered = active === "all" ? posts : posts.filter((p) => p.category === active);

  // Sticky on scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(!entry.isIntersecting);
      },
      { threshold: 1, rootMargin: "-65px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const categoryLabel = (cat: string) => {
    if (cat === "all") return t("all") || "All";
    return t(`categories.${cat}`);
  };

  return (
    <div className="container-main py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3">{t("title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} className="h-0" />

      {/* Category nav */}
      <div
        ref={navRef}
        className={`z-40 transition-all ${
          stuck
            ? "fixed top-[65px] left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm"
            : ""
        }`}
      >
        <div className={`flex gap-2 overflow-x-auto py-3 ${stuck ? "container-main" : "justify-center"}`}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active === cat
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer when nav is fixed */}
      {stuck && <div style={{ height: navRef.current?.offsetHeight || 52 }} />}

      {/* Post grid: 2 columns */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-8">
        {filtered.map((post) => (
          <a
            key={post.slug}
            href={`/${locale}/blog/${post.slug}`}
            className="block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group overflow-hidden"
          >
            {post.image && (
              <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-1 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-full">
                  {t(`categories.${post.category}`)}
                </span>
                <span className="text-xs text-gray-400">{post.date}</span>
              </div>
              <h2 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
