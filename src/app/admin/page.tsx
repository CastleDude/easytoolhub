"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/admin/StatCard";

interface DashboardData {
  posts: number;
  clicks: number;
  feedback: number;
  avgRating: number;
}

interface ApiTestItem {
  key: string;
  name: string;
  url: string;
  status: number | null;
  duration: number;
  ok: boolean;
}

interface ApiTestLatest {
  testedAt: string;
  results: ApiTestItem[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiTestLatest | null>(null);

  useEffect(() => {
    async function load() {
      const [postsRes, clicksRes, fbStatsRes] = await Promise.all([
        fetch("/api/admin/blog"),
        fetch("/api/admin/clicks/stats?days=30"),
        fetch("/api/admin/feedback/stats"),
      ]);

      const posts = await postsRes.json();
      const clicks = await clicksRes.json();
      const fbStats = await fbStatsRes.json();

      setData({
        posts: Array.isArray(posts) ? posts.length : 0,
        clicks: clicks.total || 0,
        feedback: fbStats.total || 0,
        avgRating: fbStats.averageRating || 0,
      });

      // Load API test status
      try {
        const apiRes = await fetch("/api/admin/api-test-status");
        const apiData = await apiRes.json();
        if (apiData.latest) {
          setApiStatus(apiData.latest);
        }
      } catch {}
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">仪表盘</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="博客文章"
          value={data?.posts ?? "..."}
          icon="📝"
          color="blue"
        />
        <StatCard
          label="工具点击 (30天)"
          value={data?.clicks ?? "..."}
          icon="👆"
          color="green"
        />
        <StatCard
          label="用户反馈"
          value={data?.feedback ?? "..."}
          icon="💬"
          color="amber"
        />
        <StatCard
          label="平均评分"
          value={data?.avgRating ? `${data.avgRating}/5` : "..."}
          icon="⭐"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">快速入口</h3>
          <div className="space-y-2">
            <a href="/admin/blog/new" className="block p-3 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
              ✍️ 撰写新文章
            </a>
            <a href="/admin/blog" className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              📋 管理已有文章
            </a>
            <a href="/admin/analytics" className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              📈 查看数据分析
            </a>
            <a href="/admin/feedback" className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              💬 查看用户反馈
            </a>
              <button
                onClick={async () => {
                  const btn = document.getElementById("seo-index-btn") as HTMLButtonElement;
                  if (btn) { btn.disabled = true; btn.textContent = "⏳ 提交中..."; }
                  try {
                    const res = await fetch("/api/admin/index-now", { method: "POST" });
                    const data = await res.json();
                    const msg = data.results?.map((r: any) => `${r.engine}: ${r.ok ? "✅" : "❌"}`).join("\n");
                    alert(data.success ? "✅ 提交成功!\n" + msg : "⚠️ 部分成功\n" + msg);
                  } catch { alert("❌ 提交失败，请稍后重试"); }
                  if (btn) { btn.disabled = false; btn.textContent = "📡 通知搜索引擎"; }
                }}
                id="seo-index-btn"
                className="block w-full text-left p-3 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors font-medium"
              >
                📡 提交搜索引擎索引
              </button>
            </div>
          </div>

          <BlogRanking />
        </div>

      {/* API Health Status */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              外部接口状态
            </h3>
            <a href="/admin/api-test" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              前往接口测试 →
            </a>
          </div>
          {apiStatus ? (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                最近测试：{new Date(apiStatus.testedAt).toLocaleString("zh-CN")}
              </p>
              <div className="space-y-2">
                {apiStatus.results.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        item.ok ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                      {item.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.ok
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {item.status ?? "错误"}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {item.duration}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              暂无接口测试数据，
              <a href="/admin/api-test" className="text-primary-600 dark:text-primary-400 hover:underline">
                前往接口测试
              </a>
              页面进行首次检测。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BlogRanking() {
  const [ranking, setRanking] = useState<{ slug: string; title: string; views: number; likes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then(async (posts: any[]) => {
        const enPosts = (posts || []).filter((p: any) => p.locale === "en");
        const withStats = await Promise.all(
          enPosts.slice(0, 20).map((p: any) =>
            fetch(`/api/blog/stats?slug=${p.slug}`)
              .then((r) => r.json())
              .then((d) => ({ slug: p.slug, title: p.title, views: d.data?.views || 0, likes: d.data?.likes || 0 }))
              .catch(() => ({ slug: p.slug, title: p.title, views: 0, likes: 0 }))
          )
        );
        const sorted = withStats.sort((a, b) => b.views - a.views).slice(0, 10);
        setRanking(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🔥 博客浏览量排行</h3>
      {loading ? (
        <p className="text-sm text-gray-400">加载中...</p>
      ) : ranking.length === 0 ? (
        <p className="text-sm text-gray-400">暂无数据</p>
      ) : (
        <div className="space-y-1.5">
          {ranking.map((item, i) => (
            <div key={item.slug} className="flex items-center gap-2 text-sm">
              <span className={`w-5 text-center font-bold text-xs ${
                i < 3 ? "text-yellow-500" : "text-gray-400"
              }`}>
                {i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}
              </span>
              <span className="flex-1 truncate text-gray-700 dark:text-gray-300" title={item.title}>
                {item.title}
              </span>
              <span className="shrink-0 text-xs text-gray-400">
                👁 {item.views} ❤ {item.likes}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
