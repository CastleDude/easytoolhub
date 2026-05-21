"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/admin/StatCard";
import ClickChart from "@/components/admin/ClickChart";

interface Stats {
  total: number;
  byTool: { tool_slug: string; count: number }[];
  byDay: { date: string; count: number }[];
  byLocale: { locale: string; count: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch(`/api/admin/clicks/stats?days=${days}`)
      .then((r) => r.json())
      .then(setStats);
  }, [days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">数据分析</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 outline-none"
        >
          <option value={7}>最近 7 天</option>
          <option value={30}>最近 30 天</option>
          <option value={90}>最近 90 天</option>
        </select>
      </div>

      <div className="mb-6">
        <StatCard label="工具总点击量" value={stats?.total ?? "..."} icon="👆" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">各工具点击量</h3>
          <ClickChart type="bar" data={stats?.byTool || []} dataKey="count" nameKey="tool_slug" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">点击量趋势</h3>
          <ClickChart type="line" data={stats?.byDay || []} dataKey="count" nameKey="date" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">各语言点击量</h3>
          <ClickChart type="pie" data={stats?.byLocale || []} dataKey="count" nameKey="locale" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">热门工具</h3>
          {stats?.byTool ? (
            <div className="space-y-2">
              {stats.byTool.slice(0, 10).map((item, i) => (
                <div key={item.tool_slug} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 dark:text-gray-500 w-5">{i + 1}.</span>
                    <span className="text-gray-700 dark:text-gray-300">{item.tool_slug}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
}
