"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { convertTimezone, timezones } from "@/lib/tools";

export default function TimeZoneConverterPage() {
  const t = useTranslations("Tools.timeZoneConverter");
  const [dateTime, setDateTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [fromZone, setFromZone] = useState("UTC+8");
  const [toZone, setToZone] = useState("UTC+0");
  const [result, setResult] = useState<string | null>(null);

  function handleConvert() {
    const date = new Date(dateTime);
    const resultDate = convertTimezone(date, timezones[fromZone].offset, timezones[toZone].offset);
    setResult(resultDate.toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" }));
  }

  function useNow() {
    setDateTime(new Date().toISOString().slice(0, 16));
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t("dateTime")}</label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              onClick={useNow}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {t("now")}
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("fromTimezone")}</label>
            <select
              value={fromZone}
              onChange={(e) => setFromZone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {Object.entries(timezones).map(([key, { name, offset }]) => (
                <option key={key} value={key}>
                  {name} (UTC{offset >= 0 ? "+" : ""}{offset})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("toTimezone")}</label>
            <select
              value={toZone}
              onChange={(e) => setToZone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {Object.entries(timezones).map(([key, { name, offset }]) => (
                <option key={key} value={key}>
                  {name} (UTC{offset >= 0 ? "+" : ""}{offset})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("convert")}
      </button>

      {result !== null && (
        <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("result")}</p>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{result}</p>
        </div>
      )}
      <ToolClickTracker toolSlug="time-zone-converter" />
      <FeedbackWidget toolSlug="time-zone-converter" />
    </div>
  );
}
