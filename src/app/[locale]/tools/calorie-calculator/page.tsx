"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calcCalories, type ActivityLevel } from "@/lib/tools";

const activityKeys: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "veryActive"];

export default function CalorieCalculatorPage() {
  const t = useTranslations("Tools.calorieCalculator");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [result, setResult] = useState<{ bmr: number; tdee: number } | null>(null);

  function handleCalculate() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (isNaN(w) || isNaN(h) || isNaN(a)) return;
    setResult(calcCalories(w, h, a, gender, activity));
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t("gender")}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setGender("male")}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                gender === "male"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              {t("male")}
            </button>
            <button
              onClick={() => setGender("female")}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                gender === "female"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              {t("female")}
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("weight")}</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("height")}</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("age")}</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("activity")}</label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {activityKeys.map((ak) => (
              <option key={ak} value={ak}>{t(ak)}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("calculate")}
      </button>

      {result !== null && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("bmr")}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{result.bmr} kcal</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t("bmrDesc")}</p>
          </div>
          <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("tdee")}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{result.tdee} kcal</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t("tdeeDesc")}</p>
          </div>
        </div>
      )}
      <ToolClickTracker toolSlug="calorie-calculator" />
      <FeedbackWidget toolSlug="calorie-calculator" />
      <FavoritedTools />
    </div>
  );
}
