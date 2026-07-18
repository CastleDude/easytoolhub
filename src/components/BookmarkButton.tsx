"use client";

import { useTranslations } from "next-intl";

export default function BookmarkButton() {
  const t = useTranslations("Home");

  function handleBookmark() {
    if (typeof window === "undefined") return;
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    window.alert(isMac ? "⌘+D 收藏本站" : "Ctrl+D 收藏本站");
  }

  return (
    <button
      onClick={handleBookmark}
      className="px-5 py-3 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5"
      title={t("bookmarkTitle")}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      {t("bookmarkHint")}
    </button>
  );
}
