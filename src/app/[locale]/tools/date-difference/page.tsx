"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { dateDiff } from "@/lib/tools";

export default function DateDifferencePage() {
  const t = useTranslations("Tools.dateDifference");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [result, setResult] = useState<ReturnType<typeof dateDiff> | null>(null);

  function handleCalculate() {
    if (!date1 || !date2) return;
    setResult(dateDiff(new Date(date1), new Date(date2)));
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("dateFrom")}</label>
          <input
            type="date"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("dateTo")}</label>
          <input
            type="date"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("calculate")}
      </button>

      {result !== null && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t("days"), value: result.days },
            { label: t("weeks"), value: result.weeks },
            { label: t("months"), value: result.months },
            { label: t("years"), value: result.years },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{value}</p>
            </div>
          ))}
        </div>
      )}
      <ToolClickTracker toolSlug="date-difference" />
      <FeedbackWidget toolSlug="date-difference" />
    </div>
  );
}
