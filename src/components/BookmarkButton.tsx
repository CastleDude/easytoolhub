"use client";

import { useTranslations } from "next-intl";

export default function BookmarkButton() {
  const t = useTranslations("Home");

  function handleBookmark() {
    if (typeof window === "undefined") return;
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    window.alert(isMac ? "⌘+D 添加收藏" : "Ctrl+D 添加收藏");
  }

  return (
    <button
      onClick={handleBookmark}
      className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors shadow-sm flex items-center gap-2"
      title={t("bookmarkTitle")}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      {t("bookmarkTitle")}
    </button>
  );
}
