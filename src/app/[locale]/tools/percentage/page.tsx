"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calcPercentage, calcPercentageOf, calcPercentageChange } from "@/lib/tools";

export default function PercentagePage() {
  const t = useTranslations("Tools.percentage");
  const [mode, setMode] = useState<"find" | "of" | "change">("find");
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const a = parseFloat(val1);
    const b = parseFloat(val2);
    if (isNaN(a) || isNaN(b)) return;
    switch (mode) {
      case "find":
        setResult(`${calcPercentage(a, b).toFixed(2)}%`);
        break;
      case "of":
        setResult(calcPercentageOf(a, b).toFixed(2));
        break;
      case "change":
        setResult(`${calcPercentageChange(a, b).toFixed(2)}%`);
        break;
    }
  }

  const labels = {
    find: { label1: t("labelPart"), label2: t("labelWhole"), hint: t("hintFind") },
    of: { label1: t("labelPercent"), label2: t("labelNumber"), hint: t("hintOf") },
    change: { label1: t("labelFrom"), label2: t("labelTo"), hint: t("hintChange") },
  };

  const current = labels[mode];

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex gap-2 mb-6">
        {(["find", "of", "change"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setResult(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {m === "find" ? t("findPercent") : m === "of" ? t("percentOf") : t("percentChange")}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">{current.hint}</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{current.label1}</label>
          <input
            type="number"
            value={val1}
            onChange={(e) => setVal1(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{current.label2}</label>
          <input
            type="number"
            value={val2}
            onChange={(e) => setVal2(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("calculate")}
      </button>

      {result !== null && (
        <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("result")}</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{result}</p>
        </div>
      )}

      <div className="mt-16 prose dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-3">{t("howToTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t("howToDesc")}</p>
        <ul className="text-gray-600 dark:text-gray-400 space-y-2 mt-3 list-disc pl-5">
          <li><strong>{t("findItem")}</strong> {t("findDesc")}</li>
          <li><strong>{t("ofItem")}</strong> {t("ofDesc")}</li>
          <li><strong>{t("changeItem")}</strong> {t("changeDesc")}</li>
        </ul>
      </div>
      <ToolClickTracker toolSlug="percentage" />
      <FeedbackWidget toolSlug="percentage" />
    </div>
  );
}
