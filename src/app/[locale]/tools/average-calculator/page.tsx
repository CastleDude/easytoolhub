"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calcAverage } from "@/lib/tools";

export default function AverageCalculatorPage() {
  const t = useTranslations("Tools.averageCalculator");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcAverage> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    setError("");
    const nums = input
      .split(/[,\s\n]+/)
      .map(Number)
      .filter((n) => !isNaN(n));
    if (nums.length === 0) {
      setError(t("invalid"));
      setResult(null);
      return;
    }
    setResult(calcAverage(nums));
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">{t("inputLabel")}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={calculate}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("calculate")}
      </button>

      {result !== null && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: t("sum"), value: result.sum.toFixed(2) },
            { label: t("count"), value: result.count },
            { label: t("mean"), value: result.mean.toFixed(2) },
            { label: t("median"), value: result.median.toFixed(2) },
            { label: t("min"), value: result.min },
            { label: t("max"), value: result.max },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{value}</p>
            </div>
          ))}
        </div>
      )}
      <ToolClickTracker toolSlug="average-calculator" />
      <FeedbackWidget toolSlug="average-calculator" />
    </div>
  );
}
