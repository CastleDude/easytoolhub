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
  image?: string;
  imagePrompt?: string;
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
    image: "",
    imagePrompt: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        image: initial.image || "",
        imagePrompt:
          initial.imagePrompt ||
          (initial.title ? `Realistic tech product photo related to: ${initial.title}` : ""),
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

  // AI-generate a new cover image (regenerates & replaces on each click)
  async function handleGenerate() {
    if (!form.slug) {
      setError("请先填写别名（slug）再生成主图");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: form.slug, prompt: form.imagePrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成失败");
        return;
      }
      setForm((prev) => ({ ...prev, image: data.imageUrl, imagePrompt: data.prompt }));
    } catch {
      setError("生成请求失败，请重试");
    } finally {
      setGenerating(false);
    }
  }

  // Upload a local image to replace the cover
  async function handleUpload(file: File) {
    if (!form.slug) {
      setError("请先填写别名（slug）再上传图片");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("slug", form.slug);
      fd.append("file", file);
      const res = await fetch("/api/admin/blog/image/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "上传失败");
        return;
      }
      setForm((prev) => ({ ...prev, image: data.imageUrl }));
    } catch {
      setError("上传请求失败，请重试");
    } finally {
      setUploading(false);
    }
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

      {/* Cover image block */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">封面图</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0">
            <div className="w-52 aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image} alt="封面预览" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500">暂无主图</span>
              )}
            </div>
            <label className="inline-block mt-2 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              {uploading ? "上传中..." : "上传图片"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              生图提示词
            </label>
            <textarea
              value={form.imagePrompt}
              onChange={(e) => updateField("imagePrompt", e.target.value)}
              rows={3}
              placeholder="描述想要生成的封面图... 留空则自动根据文章内容提炼"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {generating ? "AI 生成中..." : "AI 生图"}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              点击按提示词生成一张新主图替换当前图，可多次点击生成不同效果；留空提示词会先根据文章内容自动提炼。
            </p>
          </div>
        </div>
      </div>

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
