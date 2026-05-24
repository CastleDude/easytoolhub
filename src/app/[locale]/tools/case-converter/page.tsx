"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { convertCase, type CaseType } from "@/lib/tools";

const caseTypes: CaseType[] = ["upper", "lower", "title", "sentence", "camel", "kebab", "snake"];

export default function CaseConverterPage() {
  const t = useTranslations("Tools.caseConverter");
  const [input, setInput] = useState("");
  const [caseType, setCaseType] = useState<CaseType>("lower");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleConvert() {
    setOutput(convertCase(input, caseType));
    setCopied(false);
  }

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">{t("inputLabel")}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {caseTypes.map((ct) => (
          <button
            key={ct}
            onClick={() => setCaseType(ct)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              caseType === ct
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            {t(ct)}
          </button>
        ))}
      </div>

      <button
        onClick={handleConvert}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("convert")}
      </button>

      {output && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t("outputLabel")}</span>
            <button
              onClick={copy}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm break-all">
            {output}
          </div>
        </div>
      )}
      <ToolClickTracker toolSlug="case-converter" />
      <FeedbackWidget toolSlug="case-converter" />
      <FavoritedTools />
    </div>
  );
}
