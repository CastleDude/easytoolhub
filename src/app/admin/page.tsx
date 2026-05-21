"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/admin/StatCard";

interface DashboardData {
  posts: number;
  clicks: number;
  feedback: number;
  avgRating: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

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
    </div>
  );
}
