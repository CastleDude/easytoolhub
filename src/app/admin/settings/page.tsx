"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [key, setKey] = useState("");
  const [masked, setMasked] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then((r) => r.json())
      .then((d) => {
        setMasked(d.keyMasked || "");
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (!key.trim()) {
      alert("请填写 DeepSeek API Key");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deepseekApiKey: key.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "保存失败");
        return;
      }
      setMasked(data.keyMasked || "");
      setKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/ai-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deepseekApiKey: key.trim() || undefined }),
      });
      const data = await res.json();
      setTestResult({ ok: !!data.ok, message: data.message || data.error || "测试失败" });
    } catch {
      setTestResult({ ok: false, message: "网络错误，请重试" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">设置</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        配置后台使用的 DeepSeek API，用于博客文章的多语言翻译。
      </p>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          DeepSeek API Key
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Key 仅保存在服务器本地文件（git 忽略），不在页面上回显明文。
          {masked
            ? ` 当前已配置：${masked}，留空并使用测试即用已保存的 Key。`
            : " 尚未配置，翻译时将回退使用服务器 .env.local 中的 Key。"}
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={masked ? `已配置 ${masked}，输入新 Key 可替换` : "sk-... 输入 DeepSeek API Key"}
              autoComplete="off"
              spellCheck={false}
              className="w-full px-3 py-2 pr-14 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showKey ? "隐藏" : "显示"}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {testing ? "测试中..." : "测试连接"}
          </button>
        </div>

        {saved && <p className="mt-3 text-xs text-green-600 dark:text-green-400">✓ 已保存</p>}

        {testResult && (
          <div
            className={`mt-3 px-3 py-2 rounded-lg text-sm ${
              testResult.ok
                ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
            }`}
          >
            {testResult.ok ? "✓ " : "✗ "}
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
