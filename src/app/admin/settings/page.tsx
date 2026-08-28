"use client";

import { useEffect, useState } from "react";

type KeyKind = "deepseek" | "runware";

function KeyCard({
  kind,
  title,
  description,
  placeholder,
  masked,
  onMaskedChange,
  onTest,
  testing,
  testResult,
  actionLabel,
}: {
  kind: KeyKind;
  title: string;
  description: string;
  placeholder: string;
  masked: string;
  onMaskedChange: (m: string) => void;
  onTest?: () => void;
  testing?: boolean;
  testResult?: { ok: boolean; message: string } | null;
  actionLabel?: string;
}) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!key.trim()) {
      alert(`请填写 ${title}，留空表示保留当前已保存的 Key`);
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> =
        kind === "deepseek"
          ? { deepseekApiKey: key.trim() }
          : { runwareApiKey: key.trim() };
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "保存失败");
        return;
      }
      onMaskedChange(kind === "deepseek" ? data.keyMasked || "" : data.runwareKeyMasked || "");
      setKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h2>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        {description}
        {masked
          ? ` 当前已配置：${masked}，留空并使用测试/生图即用已保存的 Key。`
          : " 尚未配置。"}
      </p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={masked ? `已配置 ${masked}，输入新 Key 可替换` : placeholder}
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
        {onTest && (
          <button
            onClick={onTest}
            disabled={testing}
            className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {testing ? "测试中..." : actionLabel || "测试连接"}
          </button>
        )}
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
  );
}

export default function AdminSettingsPage() {
  const [deepMasked, setDeepMasked] = useState("");
  const [runwareMasked, setRunwareMasked] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testingRunware, setTestingRunware] = useState(false);
  const [runwareTestResult, setRunwareTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then((r) => r.json())
      .then((d) => {
        setDeepMasked(d.keyMasked || "");
        setRunwareMasked(d.runwareKeyMasked || "");
      })
      .catch(() => {});
  }, []);

  async function handleTestDeep() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/ai-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deepseekApiKey: undefined }),
      });
      const data = await res.json();
      setTestResult({ ok: !!data.ok, message: data.message || data.error || "测试失败" });
    } catch {
      setTestResult({ ok: false, message: "网络错误，请重试" });
    } finally {
      setTesting(false);
    }
  }

  async function handleTestRunware() {
    setTestingRunware(true);
    setRunwareTestResult(null);
    try {
      const res = await fetch("/api/admin/ai-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runwareApiKey: undefined }),
      });
      const data = await res.json();
      setRunwareTestResult({ ok: !!data.ok, message: data.message || data.error || "测试失败" });
    } catch {
      setRunwareTestResult({ ok: false, message: "网络错误，请重试" });
    } finally {
      setTestingRunware(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">设置</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        配置后台使用的 API Key：DeepSeek 用于文章多语言翻译，Runware 用于 AI 生图。
      </p>

      <div className="space-y-6">
        <KeyCard
          kind="deepseek"
          title="DeepSeek API Key"
          description="用于博客文章的多语言翻译。Key 仅保存在服务器本地文件（git 忽略），不在页面上回显明文。"
          placeholder="sk-... 输入 DeepSeek API Key"
          masked={deepMasked}
          onMaskedChange={setDeepMasked}
          onTest={handleTestDeep}
          testing={testing}
          testResult={testResult}
        />

        <KeyCard
          kind="runware"
          title="Runware 生图 API Key"
          description="用于后台文章封面图 AI 生成。Key 仅保存在服务器本地文件（git 忽略），不在页面上回显明文。"
          placeholder="输入 Runware API Key"
          masked={runwareMasked}
          onMaskedChange={setRunwareMasked}
          onTest={handleTestRunware}
          testing={testingRunware}
          testResult={runwareTestResult}
          actionLabel="测试连接"
        />
      </div>
    </div>
  );
}
