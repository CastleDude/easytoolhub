"use client";

import { useEffect, useState } from "react";
import FeedbackCard from "@/components/admin/FeedbackCard";
import StatCard from "@/components/admin/StatCard";

interface FeedbackItem {
  id: number;
  tool_slug: string;
  rating: number;
  comment: string;
  locale: string;
  created_at: string;
}

interface FeedbackStats {
  total: number;
  averageRating: number;
  byRating: { rating: number; count: number }[];
}

export default function FeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [toolFilter, setToolFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (toolFilter) params.set("toolSlug", toolFilter);
    if (ratingFilter) params.set("rating", ratingFilter);
    fetch(`/api/admin/feedback?${params.toString()}`)
      .then((r) => r.json())
      .then(setItems);
  }, [toolFilter, ratingFilter]);

  useEffect(() => {
    fetch("/api/admin/feedback/stats")
      .then((r) => r.json())
      .then(setStats);
  }, [items]);

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">用户反馈</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="反馈总数" value={stats?.total ?? "..."} icon="💬" color="blue" />
        <StatCard label="平均评分" value={stats?.averageRating ? `${stats.averageRating}/5` : "..."} icon="⭐" color="amber" />
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          placeholder="按工具筛选..."
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 outline-none flex-1 max-w-xs"
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 outline-none"
        >
          <option value="">全部评分</option>
          <option value="5">5 星</option>
          <option value="4">4 星</option>
          <option value="3">3 星</option>
          <option value="2">2 星</option>
          <option value="1">1 星</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          暂无反馈
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <FeedbackCard key={item.id} {...item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
