"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calcDiscount } from "@/lib/tools";

export default function DiscountPage() {
  const t = useTranslations("Tools.discount");
  const [price, setPrice] = useState("");
  const [percent, setPercent] = useState("");
  const [result, setResult] = useState<{ discountAmount: number; finalPrice: number } | null>(null);

  function calculate() {
    const p = parseFloat(price);
    const pc = parseFloat(percent);
    if (isNaN(p) || isNaN(pc)) return;
    setResult(calcDiscount(p, pc));
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("originalPrice")}</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("discountPercent")}</label>
          <input
            type="number"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
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
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-6 bg-green-50 dark:bg-green-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("discountAmount")}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${result.discountAmount.toFixed(2)}</p>
          </div>
          <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("finalPrice")}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">${result.finalPrice.toFixed(2)}</p>
          </div>
        </div>
      )}
      <ToolClickTracker toolSlug="discount" />
      <FeedbackWidget toolSlug="discount" />
      <FavoritedTools />
    </div>
  );
}
