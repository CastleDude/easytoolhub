"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { getFavorites } from "@/lib/favorites";
import { toolDefs } from "@/lib/tool-defs";

export default function FavoritedTools() {
  const locale = useLocale();
  const t = useTranslations("Tools");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  if (favorites.length === 0) return null;

  const favTools = favorites
    .map((slug) => toolDefs.find((d) => d.slug === slug))
    .filter(Boolean) as typeof toolDefs;

  if (favTools.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
        {t("pinnedShortcuts")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-3xl mx-auto">
        {favTools.map((tool) => (
          <Link
            key={tool.key}
            href={`/${locale}/tools/${tool.slug}`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all"
          >
            <span className="text-2xl">{tool.icon}</span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">
              {t(`${tool.key}.title`)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
