"use client";

import { useState, useEffect, useCallback } from "react";

interface Visitor {
  id: string;
  ip: string;
  country: string;
  firstVisit: string;
  lastVisit: string;
  duration: number;
  pageCount: number;
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/visitors")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setVisitors(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchVisitors();
    // Auto-refresh every 30s
    const timer = setInterval(fetchVisitors, 30000);
    return () => clearInterval(timer);
  }, [fetchVisitors]);

  function handleClear() {
    if (!confirm("确定要清空所有访客记录？")) return;
    fetch("/api/admin/visitors?action=clear")
      .then((r) => r.json())
      .then(() => setVisitors([]))
      .catch(() => {});
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}小时${m}分`;
  }

  function formatTime(isoStr: string): string {
    try {
      const date = new Date(isoStr.replace("+08:00", "+08:00"));
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Shanghai",
        hour12: false,
      });
    } catch {
      return isoStr;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">访客记录</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            共 {visitors.length} 条记录（北京时间 UTC+8）· 每30秒自动刷新
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchVisitors}
            className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            🔄 刷新
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          >
            🗑 清空
          </button>
        </div>
      </div>

      {loading && visitors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">加载中...</div>
      ) : visitors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">👥</p>
          <p>暂无访客记录</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">IP 地址</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">国家</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">首次访问</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">最后访问</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">停留时长</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">浏览页数</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-gray-700 dark:text-gray-300">{v.ip}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {v.country}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatTime(v.firstVisit)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatTime(v.lastVisit)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      v.duration < 60
                        ? "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400"
                        : v.duration < 300
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                        : "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                    }`}>
                      {formatDuration(v.duration)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    {v.pageCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
