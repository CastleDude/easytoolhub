"use client";

import { useState, useEffect } from "react";
import { apiDefs, type ApiDef } from "@/lib/api-defs";

interface TestResult {
  status: number | null;
  duration: number;
  ok: boolean;
  error?: string;
}

type ResultsMap = Record<string, TestResult>;

const STORAGE_KEY = "easytoolhub_api_urls";

function loadCustomUrls(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCustomUrls(urls: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

const METHOD_LABELS: Record<string, string> = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

function statusBadge(status: number | null) {
  if (status === null) return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  if (status >= 200 && status < 300) return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
}

export default function ApiTestPage() {
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [results, setResults] = useState<ResultsMap>({});
  const [testing, setTesting] = useState<Set<string>>(new Set());
  const [testingAll, setTestingAll] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<string | null>(null);

  useEffect(() => {
    setCustomUrls(loadCustomUrls());
    // Load last test time from dashboard data
    fetch("/api/admin/api-test-status")
      .then((r) => r.json())
      .then((d) => {
        if (d.latest?.testedAt) setLastTestTime(d.latest.testedAt);
      })
      .catch(() => {});
  }, []);

  function getUrl(def: ApiDef): string {
    return customUrls[def.key] || def.url;
  }

  function startEdit(def: ApiDef) {
    setEditingKey(def.key);
    setEditValue(getUrl(def));
  }

  function saveEdit() {
    if (!editingKey) return;
    const updated = { ...customUrls, [editingKey]: editValue };
    setCustomUrls(updated);
    saveCustomUrls(updated);
    setEditingKey(null);
    setResults((prev) => {
      const next = { ...prev };
      delete next[editingKey!];
      return next;
    });
  }

  function resetUrl(def: ApiDef) {
    const updated = { ...customUrls };
    delete updated[def.key];
    setCustomUrls(updated);
    saveCustomUrls(updated);
    setResults((prev) => {
      const next = { ...prev };
      delete next[def.key];
      return next;
    });
  }

  function isExternal(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
  }

  async function testOne(def: ApiDef): Promise<TestResult> {
    const url = getUrl(def);
    const start = performance.now();

    // External URLs go through server-side proxy to avoid CORS
    if (isExternal(url)) {
      try {
        const res = await fetch("/api/admin/proxy-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, method: def.method }),
        });
        const data = await res.json();
        const duration = data.duration ?? Math.round((performance.now() - start) * 10) / 10;
        return {
          status: data.status,
          duration,
          ok: data.ok,
          error: data.error,
        };
      } catch (err: unknown) {
        const duration = Math.round((performance.now() - start) * 10) / 10;
        return { status: null, duration, ok: false, error: "代理请求失败" };
      }
    }

    // Internal URLs: direct fetch
    try {
      const res = await fetch(url, { method: def.method });
      const duration = Math.round((performance.now() - start) * 10) / 10;
      const ok = res.status >= 200 && res.status < 300;
      return { status: res.status, duration, ok };
    } catch (err: unknown) {
      const duration = Math.round((performance.now() - start) * 10) / 10;
      const message = err instanceof Error ? err.message : String(err);
      return { status: null, duration, ok: false, error: message };
    }
  }

  const handleTestOne = async (def: ApiDef) => {
    setTesting((prev) => new Set(prev).add(def.key));
    setSaved(false);
    const result = await testOne(def);
    setResults((prev) => {
      const updated = { ...prev, [def.key]: result };
      // Auto-save after each individual test
      saveToDashboard(updated);
      return updated;
    });
    setTesting((prev) => {
      const next = new Set(prev);
      next.delete(def.key);
      return next;
    });
  };

  async function handleTestAll() {
    setTestingAll(true);
    setSaved(false);
    const newResults: ResultsMap = {};

    for (const def of apiDefs) {
      setTesting((prev) => new Set(prev).add(def.key));
      const result = await testOne(def);
      newResults[def.key] = result;
      setResults((prev) => ({ ...prev, [def.key]: result }));
      setTesting((prev) => {
        const next = new Set(prev);
        next.delete(def.key);
        return next;
      });
    }

    setTestingAll(false);
    // Auto-save after test all
    await saveToDashboard(newResults);
  }

  async function saveToDashboard(currentResults?: ResultsMap) {
    const data = currentResults || results;
    const items = apiDefs.map((def) => ({
      key: def.key,
      name: def.name,
      url: getUrl(def),
      status: data[def.key]?.status ?? null,
      duration: data[def.key]?.duration ?? 0,
      ok: data[def.key]?.ok ?? false,
    }));

    try {
      const res = await fetch("/api/admin/api-test-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: items }),
      });
      const data = await res.json();
      if (data.record?.testedAt) {
        setLastTestTime(data.record.testedAt);
      }
      setSaved(true);
    } catch {}
  }

  const okCount = Object.values(results).filter((r) => r.ok).length;
  const failCount = Object.values(results).filter((r) => !r.ok).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">接口测试</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            测试网站引用的所有外部 API 接口，自定义地址后可单独或批量检测连接状态。
          </p>
        </div>
        {lastTestTime && (
          <div className="text-right flex-shrink-0">
            <span className="text-xs text-gray-400 dark:text-gray-500">上次测试</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(lastTestTime).toLocaleString("zh-CN")}
            </p>
          </div>
        )}
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        {Object.keys(results).length > 0 ? (
          <>
            <span className="text-sm text-gray-500 dark:text-gray-400">汇总：</span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">{okCount} 正常</span>
            {failCount > 0 && (
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">{failCount} 异常</span>
            )}
            <span className="text-sm text-gray-400 dark:text-gray-500">
              / {apiDefs.length} 个接口
            </span>
            {saved && (
              <span className="text-xs text-green-600 dark:text-green-400">已同步至仪表盘</span>
            )}
          </>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">点击右侧按钮或单独测试每条接口</span>
        )}
        <div className="flex-1" />
        <button
          onClick={handleTestAll}
          disabled={testingAll}
          className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {testingAll ? "正在逐条测试..." : "一键测试全部接口"}
        </button>
      </div>

      {/* API list */}
      <div className="space-y-3">
        {apiDefs.map((def) => {
          const result = results[def.key];
          const isTesting = testing.has(def.key);
          const url = getUrl(def);
          const isCustom = customUrls[def.key] !== undefined;

          return (
            <div
              key={def.key}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {def.name}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono">
                      {def.method}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                    {def.description}
                  </p>

                  {/* Editable URL */}
                  {editingKey === def.key ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none font-mono"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") setEditingKey(null);
                        }}
                      />
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <code
                        className="flex-1 text-sm text-primary-600 dark:text-primary-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg cursor-pointer hover:underline truncate"
                        onClick={() => startEdit(def)}
                        title="点击修改接口地址"
                      >
                        {url}
                      </code>
                      {isCustom && (
                        <button
                          onClick={() => resetUrl(def)}
                          className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex-shrink-0"
                          title="恢复默认地址"
                        >
                          恢复默认
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action & result */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {result && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(result.status)}`}>
                        {result.status ?? "错误"}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 text-xs">
                        {result.duration}ms
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => handleTestOne(def)}
                    disabled={isTesting}
                    className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {isTesting ? "测试中" : "测试"}
                  </button>
                </div>
              </div>

              {result?.error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {result.error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
