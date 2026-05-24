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
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">使用指南</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
            <li>在博客板块中创建或编辑文章</li>
            <li>用户访问工具页面时自动记录点击数据</li>
            <li>通过工具页面上的小部件收集用户反馈</li>
            <li>使用数据分析页面查看详细的点击统计</li>
          </ul>
        </div>
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
