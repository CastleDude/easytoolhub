"use client";

import { useState, useEffect, useCallback } from "react";

interface Visitor {
  id: number;
  ip: string;
  country: string;
  page: string;
  referrer: string;
  referrerSource: string;
  browser: string;
  device: string;
  visitType: string;
  firstVisit: string;
  lastVisit: string;
  pageCount: number;
  visitCount: number;
  duration: number;
}

interface Stats {
  todayVisits: number;
  todayIPs: number;
  todayCountries: number;
  onlineNow: number;
  totalVisitors: number;
}

const COUNTRY_TZ: Record<string, string> = {
  "US": "America/New_York", "CN": "Asia/Shanghai", "JP": "Asia/Tokyo",
  "KR": "Asia/Seoul", "IN": "Asia/Kolkata", "RU": "Europe/Moscow",
  "GB": "Europe/London", "DE": "Europe/Berlin", "FR": "Europe/Paris",
  "ES": "Europe/Madrid", "IT": "Europe/Rome", "BR": "America/Sao_Paulo",
  "AU": "Australia/Sydney", "CA": "America/Toronto", "MX": "America/Mexico_City",
  "SG": "Asia/Singapore", "TW": "Asia/Taipei", "HK": "Asia/Hong_Kong",
  "TH": "Asia/Bangkok", "VN": "Asia/Ho_Chi_Minh", "MY": "Asia/Kuala_Lumpur",
  "PH": "Asia/Manila", "ID": "Asia/Jakarta", "NZ": "Pacific/Auckland",
  "AE": "Asia/Dubai", "SA": "Asia/Riyadh", "TR": "Europe/Istanbul",
  "ZA": "Africa/Johannesburg", "NG": "Africa/Lagos", "EG": "Africa/Cairo",
  "AR": "America/Argentina/Buenos_Aires", "CL": "America/Santiago",
  "PK": "Asia/Karachi", "BD": "Asia/Dhaka", "UA": "Europe/Kyiv",
  "PL": "Europe/Warsaw", "NL": "Europe/Amsterdam", "SE": "Europe/Stockholm",
  "CH": "Europe/Zurich", "AT": "Europe/Vienna", "BE": "Europe/Brussels",
  "PT": "Europe/Lisbon", "GR": "Europe/Athens", "CZ": "Europe/Prague",
  "RO": "Europe/Bucharest", "HU": "Europe/Budapest", "IE": "Europe/Dublin",
  "DK": "Europe/Copenhagen", "NO": "Europe/Oslo", "FI": "Europe/Helsinki",
  "IL": "Asia/Jerusalem", "IR": "Asia/Tehran", "IQ": "Asia/Baghdad",
  "CO": "America/Bogota", "PE": "America/Lima", "VE": "America/Caracas",
  "Local": "Asia/Shanghai", "Unknown": "UTC",
};

function toLocalTime(iso: string, country: string): string {
  try {
    const d = new Date(iso.replace("+08:00", "Z"));
    const tz = COUNTRY_TZ[country] || "UTC";
    return d.toLocaleString("zh-CN", { timeZone: tz, hour12: false,
      month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso.replace("+08:00", "+08:00"));
    return d.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
  } catch { return iso; }
}

function formatDuration(s: number): string {
  if (s < 60) return `${s}秒`;
  if (s < 3600) return `${Math.floor(s / 60)}分`;
  return `${Math.floor(s / 3600)}时${Math.floor((s % 3600) / 60)}分`;
}

function typeBadge(t: string) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: "新访客", cls: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
    returning: { label: "回头客", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
    bot: { label: "🤖 爬虫", cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  };
  const m = map[t] || { label: t, cls: "bg-gray-100" };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${m.cls}`}>{m.label}</span>;
}

export default function VisitorsPage() {
  const [data, setData] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterIp, setFilterIp] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterDevice, setFilterDevice] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Sort
  const [sortField, setSortField] = useState("lastVisit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterIp) params.set("ip", filterIp);
    if (filterCountry) params.set("country", filterCountry);
    if (filterDevice !== "all") params.set("device", filterDevice);
    if (filterType !== "all") params.set("visitType", filterType);
    if (filterFrom) params.set("from", filterFrom);
    if (filterTo) params.set("to", filterTo);
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    fetch(`/api/admin/visitors?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setData(d.data);
        setTotal(d.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterIp, filterCountry, filterDevice, filterType, filterFrom, filterTo, sortField, sortOrder, page, pageSize]);

  useEffect(() => {
    fetch("/api/admin/visitors?action=stats")
      .then((r) => r.json())
      .then((d) => { if (d.data) setStats(d.data); })
      .catch(() => {});
    fetchData();
    const t = setInterval(fetchData, 30000);
    return () => clearInterval(t);
  }, [fetchData]);

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  }

  function sortArrow(field: string) {
    if (sortField !== field) return " ↕";
    return sortOrder === "desc" ? " ↓" : " ↑";
  }

  const totalPages = Math.ceil(total / pageSize);
  const hasFilter = filterIp || filterCountry || filterDevice !== "all" || filterType !== "all" || filterFrom || filterTo;

  function clearFilters() {
    setFilterIp(""); setFilterCountry(""); setFilterDevice("all");
    setFilterType("all"); setFilterFrom(""); setFilterTo(""); setPage(1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">访客记录</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            北京时间 UTC+8 · 30秒自动刷新
          </p>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.todayVisits}</p>
            <p className="text-xs text-gray-400 mt-1">今日访问</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.todayIPs}</p>
            <p className="text-xs text-gray-400 mt-1">独立 IP</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-bold text-cyan-600">{stats.todayCountries}</p>
            <p className="text-xs text-gray-400 mt-1">国家/地区</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.onlineNow}</p>
            <p className="text-xs text-gray-400 mt-1">当前在线</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.totalVisitors}</p>
            <p className="text-xs text-gray-400 mt-1">累计访客</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          placeholder="IP 搜索"
          value={filterIp}
          onChange={(e) => { setFilterIp(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 w-36"
        />
        <input
          placeholder="国家"
          value={filterCountry}
          onChange={(e) => { setFilterCountry(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 w-24"
        />
        <select
          value={filterDevice}
          onChange={(e) => { setFilterDevice(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
        >
          <option value="all">全部设备</option>
          <option value="Desktop">💻 电脑</option>
          <option value="Mobile">📱 手机</option>
          <option value="Tablet">📋 平板</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
        >
          <option value="all">全部类型</option>
          <option value="new">新访客</option>
          <option value="returning">回头客</option>
          <option value="bot">爬虫</option>
        </select>
        <input
          type="date"
          value={filterFrom}
          onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
        />
        <span className="text-xs text-gray-400">至</span>
        <input
          type="date"
          value={filterTo}
          onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
        />
        {hasFilter && (
          <button onClick={clearFilters} className="px-3 py-1.5 text-xs text-red-500 hover:underline">
            清除过滤
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500">
              <th className="text-left py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("ip")}>IP{sortArrow("ip")}</th>
              <th className="text-left py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("visitType")}>类型{sortArrow("visitType")}</th>
              <th className="text-left py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("country")}>国家{sortArrow("country")}</th>
              <th className="text-left py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("device")}>设备{sortArrow("device")}</th>
              <th className="text-left py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("browser")}>浏览器{sortArrow("browser")}</th>
              <th className="text-left py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("referrerSource")}>来源{sortArrow("referrerSource")}</th>
              <th className="text-right py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("pageCount")}>浏览页{sortArrow("pageCount")}</th>
              <th className="text-right py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("visitCount")}>访问次{sortArrow("visitCount")}</th>
              <th className="text-right py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("duration")}>时长{sortArrow("duration")}</th>
              <th className="text-right py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("lastVisit")}>北京{sortArrow("lastVisit")}</th>
              <th className="text-right py-2 px-2">当地时间</th>
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-16 text-gray-400">加载中...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-16 text-gray-400">暂无数据</td></tr>
            ) : (
              data.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="py-2 px-2 font-mono text-gray-700 dark:text-gray-300">{v.ip}</td>
                  <td className="py-2 px-2">{typeBadge(v.visitType)}</td>
                  <td className="py-2 px-2 text-gray-500">{v.country}</td>
                  <td className="py-2 px-2">
                    {v.device === "Mobile" ? "📱" : v.device === "Tablet" ? "📋" : "💻"}
                  </td>
                  <td className="py-2 px-2 text-gray-500">{v.browser}</td>
                  <td className="py-2 px-2">
                    <span className="text-gray-500">{v.referrerSource}</span>
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{v.pageCount}</td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{v.visitCount}</td>
                  <td className="py-2 px-2 text-right text-gray-500">{formatDuration(v.duration)}</td>
                  <td className="py-2 px-2 text-right text-gray-500 whitespace-nowrap">{formatTime(v.lastVisit)}</td>
                  <td className="py-2 px-2 text-right text-xs text-gray-400 whitespace-nowrap">{toLocalTime(v.lastVisit, v.country)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span>共 {total} 条</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900"
            >
              {[20, 50, 100, 500].map((n) => <option key={n} value={n}>{n}条/页</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-30"
            >上一页</button>
            <span className="px-3 py-1 text-gray-600">{page}/{totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-30"
            >下一页</button>
          </div>
        </div>
      )}
    </div>
  );
}
