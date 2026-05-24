"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calcBMI, type BMICategory } from "@/lib/tools";

export default function BMIPage() {
  const t = useTranslations("Tools.bmi");
  const tb = useTranslations("BMI");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [result, setResult] = useState<{ bmi: number; category: BMICategory } | null>(null);

  function calculate() {
    if (unit === "metric") {
      const w = parseFloat(weight);
      const h = parseFloat(height);
      if (isNaN(w) || isNaN(h) || h <= 0) return;
      setResult(calcBMI(w, h));
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      const lbs = parseFloat(weight);
      const totalInches = ft * 12 + inch;
      const kg = lbs * 0.453592;
      const cm = totalInches * 2.54;
      if (isNaN(kg) || isNaN(cm) || cm <= 0) return;
      setResult(calcBMI(kg, cm));
    }
  }

  function categoryColor(cat: BMICategory): string {
    switch (cat) {
      case "underweight": return "text-yellow-600 dark:text-yellow-400";
      case "normal": return "text-green-600 dark:text-green-400";
      case "overweight": return "text-orange-600 dark:text-orange-400";
      case "obese": return "text-red-600 dark:text-red-400";
    }
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setUnit("metric"); setResult(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            unit === "metric" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          {t("metric")}
        </button>
        <button
          onClick={() => { setUnit("imperial"); setResult(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            unit === "imperial" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          {t("imperial")}
        </button>
      </div>

      {unit === "metric" ? (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("weightKg")}</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 70"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("heightCm")}</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 170"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("weightLbs")}</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 154"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("heightFt")}</label>
            <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="e.g. 5"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("heightIn")}</label>
            <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="e.g. 7"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
        </div>
      )}

      <button onClick={calculate}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
        {t("calculate")}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("yourBmi")}</p>
          <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">{result.bmi}</p>
          <p className={`text-lg font-semibold ${categoryColor(result.category)}`}>
            {tb(result.category)}
          </p>
        </div>
      )}

      <div className="mt-16 prose dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-3">{t("understandingTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t("understandingDesc")}</p>
        <h3 className="font-semibold mt-4 mb-2">{t("categoriesTitle")}</h3>
        <ul className="text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
          <li>{t("categoryUnderweight")}</li>
          <li>{t("categoryNormal")}</li>
          <li>{t("categoryOverweight")}</li>
          <li>{t("categoryObese")}</li>
        </ul>
      </div>
      <ToolClickTracker toolSlug="bmi" />
      <FeedbackWidget toolSlug="bmi" />
      <FavoritedTools />
    </div>
  );
}
