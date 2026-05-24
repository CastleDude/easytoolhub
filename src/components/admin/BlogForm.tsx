"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BlogEditor from "./BlogEditor";

interface BlogFormData {
  title: string;
  slug: string;
  locale: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
}

export default function BlogForm({
  initial,
  isNew,
}: {
  initial?: BlogFormData & { id?: number };
  isNew: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<BlogFormData>({
    title: "",
    slug: "",
    locale: "zh",
    excerpt: "",
    date: new Date().toISOString().split("T")[0],
    category: "Software",
    content: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        slug: initial.slug || "",
        locale: initial.locale || "en",
        excerpt: initial.excerpt || "",
        date: initial.date || new Date().toISOString().split("T")[0],
        category: initial.category || "Software",
        content: initial.content || "",
      });
    }
  }, [initial]);

  function updateField(field: keyof BlogFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug from title for new posts
      if (isNew && field === "title" && !prev.slug) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .substring(0, 80);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      setError("标题不能为空");
      return;
    }

    setSaving(true);
    setError("");

    const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${initial!.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const slug = form.slug || (await res.json())?.slug;
      router.push(`/admin/blog?new=${encodeURIComponent(slug)}`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "保存失败");
    }

    setSaving(false);
  }

  const categoryOptions = [
    { value: "Software", label: "软件" },
    { value: "Equipment", label: "设备" },
    { value: "Guide", label: "指南" },
    { value: "Comparison", label: "对比" },
    { value: "General", label: "综合" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="文章标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">别名</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="文章别名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">日期</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">语言 / Locale</label>
          <select
            value={form.locale}
            onChange={(e) => updateField("locale", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="ru">Русский</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">分类</label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">摘要</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => updateField("excerpt", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            placeholder="简要描述..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">内容 (Markdown)</label>
        <BlogEditor value={form.content} onChange={(v) => updateField("content", v)} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "保存中..." : isNew ? "创建文章" : "更新文章"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
