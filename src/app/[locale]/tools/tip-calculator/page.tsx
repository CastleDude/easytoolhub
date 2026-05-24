"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calcTip } from "@/lib/tools";

export default function TipCalculatorPage() {
  const t = useTranslations("Tools.tipCalculator");
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  const [people, setPeople] = useState("1");
  const [result, setResult] = useState<{ tipAmount: number; total: number; perPerson: number } | null>(null);

  function calculate() {
    const b = parseFloat(bill);
    const tp = parseFloat(tipPercent);
    const p = parseInt(people) || 1;
    if (isNaN(b) || isNaN(tp)) return;
    setResult(calcTip(b, tp, p));
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t("billAmount")}</label>
          <input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("tipPercent")}</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {[10, 15, 18, 20, 25].map((p) => (
              <button
                key={p}
                onClick={() => setTipPercent(p.toString())}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  tipPercent === p.toString()
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
          <input
            type="number"
            value={tipPercent}
            onChange={(e) => setTipPercent(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("numPeople")}</label>
          <input
            type="number"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("tipAmount")}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">${result.tipAmount.toFixed(2)}</p>
          </div>
          <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("totalBill")}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">${result.total.toFixed(2)}</p>
          </div>
          <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("perPerson")}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">${result.perPerson.toFixed(2)}</p>
          </div>
        </div>
      )}
      <ToolClickTracker toolSlug="tip-calculator" />
      <FeedbackWidget toolSlug="tip-calculator" />
      <FavoritedTools />
    </div>
  );
}
