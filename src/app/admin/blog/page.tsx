"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";

const CATEGORY_LABELS: Record<string, string> = {
  Software: "软件",
  Equipment: "设备",
  Guide: "指南",
  Comparison: "对比",
  General: "综合",
};

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
};

const TRANSLATE_LOCALES = ["zh", "es", "fr", "de", "ja", "ko", "ru"];
const TRANSLATE_SHORT: Record<string, string> = {
  zh: "ZH",
  es: "ES",
  fr: "FR",
  de: "DE",
  ja: "JA",
  ko: "KO",
  ru: "RU",
};

interface Post {
  id: number;
  title: string;
  slug: string;
  locale: string;
  category: string;
  date: string;
  created_at: string;
  image?: string;
}

export default function AdminBlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [localeFilter, setLocaleFilter] = useState("zh");
  const [stats, setStats] = useState<{ total: number; zh: number }>({ total: 0, zh: 0 });
  const [translating, setTranslating] = useState<{ slug: string; title: string; done: boolean } | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [translatingKeys, setTranslatingKeys] = useState<Set<string>>(new Set());
  const [translatingAll, setTranslatingAll] = useState<Set<string>>(new Set());

  const router = useRouter();
  const [newSlug, setNewSlug] = useState<string | null>(null);

  // Read ?new= query param from URL on mount (client-side only, avoids SSR useSearchParams issues)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("new");
    if (slug) setNewSlug(slug);
  }, []);

  const ALL_LOCALES = ["en", "zh", "es", "fr", "de", "ja", "ko", "ru"];

  // Load stats once (all posts unfiltered)
  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((all: Post[]) => {
        setStats({
          total: all.length,
          zh: all.filter((p) => p.locale === "zh").length,
        });
      });
  }, []);

  useEffect(() => {
    const url = localeFilter
      ? `/api/admin/blog?locale=${localeFilter}`
      : "/api/admin/blog";
    fetch(url)
      .then((r) => r.json())
      .then(setPosts);
  }, [localeFilter]);

  // In English view, also load ALL posts to build per-slug translation status
  useEffect(() => {
    if (localeFilter !== "en") {
      setAllPosts([]);
      return;
    }
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((all: Post[]) => setAllPosts(all));
  }, [localeFilter]);

  // Detect new post from query param and start tracking translation progress
  useEffect(() => {
    if (!newSlug) return;
    fetch("/api/admin/blog?locale=zh")
      .then((r) => r.json())
      .then((zhPosts: Post[]) => {
        const post = zhPosts.find((p) => p.slug === newSlug);
        if (post) {
          setTranslating({ slug: newSlug, title: post.title, done: false });
        }
      });
  }, [newSlug]);

  // Poll for translation completion
  useEffect(() => {
    if (!translating || translating.done) return;

    const interval = setInterval(async () => {
      const res = await fetch("/api/admin/blog");
      const all: Post[] = await res.json();
      const localesForSlug = new Set(
        all.filter((p) => p.slug === translating.slug).map((p) => p.locale)
      );
      const done = ALL_LOCALES.every((l) => localesForSlug.has(l));

      if (done) {
        clearInterval(interval);
        setTranslating((prev) => (prev ? { ...prev, done: true } : null));
        setStats({
          total: all.length,
          zh: all.filter((p) => p.locale === "zh").length,
        });
        setTimeout(() => {
          setTranslating(null);
          router.replace("/admin/blog");
        }, 4000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [translating, ALL_LOCALES, router]);

  async function handleDelete() {
    if (!deleteId) return;
    const target = posts.find((p) => p.id === deleteId);
    const res = await fetch(`/api/admin/blog/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      if (target) {
        setPosts((prev) => prev.filter((p) => p.slug !== target.slug));
      } else {
        setPosts((prev) => prev.filter((p) => p.id !== deleteId));
      }
      // Refresh stats
      fetch("/api/admin/blog")
        .then((r) => r.json())
        .then((all: Post[]) => {
          setStats({
            total: all.length,
            zh: all.filter((p) => p.locale === "zh").length,
          });
        });
    }
    setDeleteId(null);
  }

  // Build per-slug translation status map from ALL posts
  const localeStatusMap = useMemo(() => {
    const map: Record<string, Record<string, "ok" | "failed" | "missing">> = {};
    for (const p of allPosts) {
      if (p.locale === "en") continue;
      if (!map[p.slug]) {
        map[p.slug] = {
          zh: "missing",
          es: "missing",
          fr: "missing",
          de: "missing",
          ja: "missing",
          ko: "missing",
          ru: "missing",
        };
      }
      const prefix = `[${p.locale.toUpperCase()}]`;
      map[p.slug][p.locale] = p.title.startsWith(prefix) ? "failed" : "ok";
    }
    return map;
  }, [allPosts]);

  // Translate one locale; returns null on success, or an error message on failure
  async function translateOne(slug: string, locale: string): Promise<string | null> {
    const key = `${slug}:${locale}`;
    if (translatingKeys.has(key)) return null;
    setTranslatingKeys((prev) => new Set(prev).add(key));
    try {
      const res = await fetch("/api/admin/blog/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, locale }),
      });
      if (res.ok) return null;
      const data = await res.json().catch(() => ({}));
      return data.error || "翻译失败";
    } catch {
      return "翻译请求失败，请重试";
    } finally {
      setTranslatingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  async function handleTranslate(slug: string, locale: string) {
    const err = await translateOne(slug, locale);
    if (err) {
      alert(err);
      return;
    }
    const all = await fetch("/api/admin/blog").then((r) => r.json());
    setAllPosts(all);
  }

  // Translate every not-yet-successful locale of this article, one by one
  async function handleTranslateAll(slug: string) {
    const statuses = localeStatusMap[slug] || {};
    const todo = TRANSLATE_LOCALES.filter((loc) => statuses[loc] !== "ok");
    if (todo.length === 0) return;

    setTranslatingAll((prev) => new Set(prev).add(slug));
    const failed: { loc: string; err: string }[] = [];
    for (const loc of todo) {
      const err = await translateOne(slug, loc);
      if (err) failed.push({ loc, err });
    }
    const all = await fetch("/api/admin/blog").then((r) => r.json());
    setAllPosts(all);
    setTranslatingAll((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
    if (failed.length > 0) {
      alert(
        `本篇文章有 ${failed.length} 个语言翻译失败：\n` +
          failed.map((f) => `${f.loc.toUpperCase()}: ${f.err}`).join("\n"),
      );
    }
  }

  const columns = [
    {
      key: "title",
      label: "标题",
      sortable: true,
      render: (row: Post) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {row.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-gray-300 dark:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
            )}
          </div>
          <span className="min-w-0 truncate">{row.title}</span>
        </div>
      ),
    },
    {
      key: "locale",
      label: "语言",
      sortable: true,
      render: (row: Post) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {LOCALE_NAMES[row.locale] || row.locale}
        </span>
      ),
    },
    {
      key: "category",
      label: "分类",
      sortable: true,
      render: (row: Post) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
          {CATEGORY_LABELS[row.category] || row.category}
        </span>
      ),
    },
    { key: "date", label: "日期", sortable: true },
    ...(localeFilter === "en"
      ? [
          {
            key: "translations",
            label: "多语言翻译",
            render: (row: Post) => {
              const allLoading = translatingAll.has(row.slug);
              const todoCount = TRANSLATE_LOCALES.filter(
                (loc) => localeStatusMap[row.slug]?.[loc] !== "ok",
              ).length;
              return (
                <div className="flex flex-wrap gap-1.5 max-w-md">
                  <button
                    onClick={() => handleTranslateAll(row.slug)}
                    disabled={allLoading || todoCount === 0}
                    title={
                      todoCount === 0
                        ? "所有语言均已翻译成功"
                        : `一键翻译未成功的 ${todoCount} 个语言`
                    }
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      todoCount === 0
                        ? "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 cursor-default"
                        : "bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {allLoading ? "翻译中…" : `翻译${todoCount > 0 ? ` (${todoCount})` : ""}`}
                  </button>
                  {TRANSLATE_LOCALES.map((loc) => {
                  const status = localeStatusMap[row.slug]?.[loc] ?? "missing";
                  const loading = translatingKeys.has(`${row.slug}:${loc}`);
                  const short = TRANSLATE_SHORT[loc];
                  if (loading) {
                    return (
                      <span
                        key={loc}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                      >
                        <svg className="animate-spin w-2.5 h-2.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {short}
                      </span>
                    );
                  }
                  if (status === "ok") {
                    return (
                      <span
                        key={loc}
                        title={`${LOCALE_NAMES[loc]}：翻译成功`}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      >
                        {short} ✓
                      </span>
                    );
                  }
                  return (
                    <button
                      key={loc}
                      title={
                        status === "failed"
                          ? `${LOCALE_NAMES[loc]}：翻译失败，点击重新翻译`
                          : `${LOCALE_NAMES[loc]}：未翻译，点击翻译`
                      }
                      onClick={() => handleTranslate(row.slug, loc)}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                        status === "failed"
                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {short}
                      {status === "failed" ? " ✗" : " ＋"}
                    </button>
                  );
                })}
                </div>
              );
            },
          },
        ]
      : []),
    {
      key: "actions",
      label: "操作",
      render: (row: Post) => (
        <div className="flex gap-2">
          <a
            href={`/admin/blog/${row.id}/edit`}
            className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            编辑
          </a>
          <button
            onClick={() => setDeleteId(row.id)}
            className="px-3 py-1 text-xs font-medium bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">博客文章</h2>
          <select
            value={localeFilter}
            onChange={(e) => setLocaleFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="">全部语言</option>
            <option value="en">English（英语）</option>
            <option value="zh">中文（Chinese）</option>
            <option value="es">Español（西班牙语）</option>
            <option value="fr">Français（法语）</option>
            <option value="de">Deutsch（德语）</option>
            <option value="ja">日本語（日语）</option>
            <option value="ko">한국어（韩语）</option>
            <option value="ru">Русский（俄语）</option>
          </select>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            中文 {stats.zh} 篇 / 全部 {stats.total} 篇
          </span>
        </div>
        <a
          href="/admin/blog/new"
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          + 新建文章
        </a>
      </div>

      {translating && (
        <div
          className={`mb-6 p-4 rounded-lg border flex items-center gap-3 transition-colors ${
            translating.done
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
              : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
          }`}
        >
          {translating.done ? (
            <>
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-700 dark:text-green-300">
                「{translating.title}」多语言翻译完成
              </span>
            </>
          ) : (
            <>
              <svg
                className="animate-spin w-5 h-5 text-blue-500 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                「{translating.title}」多语言翻译中...
              </span>
            </>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <DataTable columns={columns} data={posts} emptyText="暂无博客文章" />
      </div>

      <DeleteConfirmDialog
        open={deleteId !== null}
        title="删除文章"
        message="确定要删除这篇文章吗？此操作无法撤销。"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
