"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { urlEncode, urlDecode } from "@/lib/tools";

export default function UrlEncoderPage() {
  const t = useTranslations("Tools.urlEncoder");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  function handleProcess() {
    if (!input.trim()) return;
    try {
      setOutput(mode === "encode" ? urlEncode(input) : urlDecode(input));
    } catch {
      setOutput("Invalid input for decoding");
    }
    setCopied(false);
  }

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  function handleSwap() {
    setInput(output);
    setOutput("");
    setMode(mode === "encode" ? "decode" : "encode");
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode("encode"); setOutput(""); }}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
            mode === "encode"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          {t("encode")}
        </button>
        <button
          onClick={() => { setMode("decode"); setOutput(""); }}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
            mode === "decode"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          {t("decode")}
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">{t("inputLabel")}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y font-mono text-sm"
        />
      </div>

      <button
        onClick={handleProcess}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {mode === "encode" ? t("encode") : t("decode")}
      </button>

      {output && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t("outputLabel")}</span>
            <div className="flex gap-2">
              <button
                onClick={handleSwap}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t("swap")}
              </button>
              <button
                onClick={copy}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm break-all">
            {output}
          </div>
        </div>
      )}
      <ToolClickTracker toolSlug="url-encoder" />
      <FeedbackWidget toolSlug="url-encoder" />
      <FavoritedTools />
    </div>
  );
}
