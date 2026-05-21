"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState, useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { foodsI18n, getLocalizedDish, type DishI18n, type Dish } from "@/lib/foods";

function getRandomDish(foods: DishI18n[], excludeId?: number): DishI18n {
  const available = excludeId != null ? foods.filter((d) => d.id !== excludeId) : foods;
  return available[Math.floor(Math.random() * available.length)];
}

const LIKES_KEY = "what_to_eat_likes";

function getLikes(): Record<number, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLikes(likes: Record<number, number>) {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  } catch { /* quota exceeded, ignore */ }
}

export default function WhatToEatPage() {
  const t = useTranslations("Tools.whatToEat");
  const locale = useLocale();
  const [dishI18n, setDishI18n] = useState<DishI18n | null>(null);
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setLikes(getLikes());
  }, []);

  const pickRandom = useCallback(() => {
    setAnimating(true);
    const excludeId = dishI18n?.id;
    let count = 0;
    const maxTicks = 10;
    const interval = setInterval(() => {
      setDishI18n(getRandomDish(foodsI18n, count % 3 === 0 ? undefined : dishI18n?.id));
      count++;
      if (count >= maxTicks) {
        clearInterval(interval);
        setDishI18n(getRandomDish(foodsI18n, excludeId));
        setAnimating(false);
      }
    }, 100);
  }, [dishI18n]);

  const handleLike = useCallback(() => {
    if (!dishI18n) return;
    const updated = { ...likes, [dishI18n.id]: (likes[dishI18n.id] || 0) + 1 };
    setLikes(updated);
    saveLikes(updated);
  }, [dishI18n, likes]);

  const dish: Dish | null = dishI18n ? getLocalizedDish(dishI18n, locale) : null;
  const likeCount = dishI18n ? likes[dishI18n.id] || 0 : 0;

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <button
        onClick={pickRandom}
        disabled={animating}
        className="w-full py-4 bg-primary-600 text-white font-bold text-lg rounded-xl hover:bg-primary-700 transition-all disabled:opacity-60 shadow-lg hover:shadow-xl"
      >
        {animating ? t("picking") : t("pickButton")}
      </button>

      {dish && !animating && (
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {dish.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {dish.flag} {dish.country}
              </p>
            </div>
            <button
              onClick={handleLike}
              className="flex items-center gap-1 px-4 py-2 rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            >
              <span className="text-lg">❤️</span>
              <span className="font-semibold text-sm">{likeCount}</span>
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {dish.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{t("taste")}</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">{dish.taste}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{t("method")}</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">{dish.method}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">{t("nutrition")}</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{dish.calories}</p>
                <p className="text-xs text-gray-400">{t("calories")}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{dish.protein}g</p>
                <p className="text-xs text-gray-400">{t("protein")}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{dish.carbs}g</p>
                <p className="text-xs text-gray-400">{t("carbs")}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-red-500 dark:text-red-400">{dish.fat}g</p>
                <p className="text-xs text-gray-400">{t("fat")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!dish && !animating && (
        <div className="mt-8 text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-4xl mb-4">🍽️</p>
          <p className="text-gray-400 dark:text-gray-500">{t("placeholder")}</p>
        </div>
      )}
      <ToolClickTracker toolSlug="what-to-eat" />
      <FeedbackWidget toolSlug="what-to-eat" />
    </div>
  );
}
