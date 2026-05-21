"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calcDueDate } from "@/lib/tools";

export default function DueDateCalculatorPage() {
  const t = useTranslations("Tools.dueDateCalculator");
  const [lmp, setLmp] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcDueDate> | null>(null);

  function handleCalculate() {
    if (!lmp) return;
    setResult(calcDueDate(new Date(lmp)));
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">{t("lmpDate")}</label>
        <input
          type="date"
          value={lmp}
          onChange={(e) => setLmp(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("calculate")}
      </button>

      {result !== null && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("dueDate")}</p>
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {result.dueDate.toLocaleDateString()}
            </p>
          </div>
          <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("currentWeek")}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{result.weeks}</p>
          </div>
          <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("trimester")}</p>
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {t(result.trimester)}
            </p>
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-gray-400 dark:text-gray-500 text-center">{t("disclaimer")}</p>
      <ToolClickTracker toolSlug="due-date-calculator" />
      <FeedbackWidget toolSlug="due-date-calculator" />
    </div>
  );
}
