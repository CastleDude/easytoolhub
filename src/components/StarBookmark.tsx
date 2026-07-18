"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

export default function StarBookmark() {
  const t = useTranslations("Header");
  const [bookmarked, setBookmarked] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBookmarked(localStorage.getItem("star_bookmarked") === "1");
    }
  }, []);

  useEffect(() => {
    // Close tip on outside click
    if (!showTip) return;
    function handleClick(e: MouseEvent) {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) {
        setShowTip(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showTip]);

  function handleClick() {
    if (bookmarked) {
      localStorage.removeItem("star_bookmarked");
      setBookmarked(false);
      return;
    }
    localStorage.setItem("star_bookmarked", "1");
    setBookmarked(true);
    setShowTip(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowTip(false), 4000);
  }

  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC");

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`p-1.5 rounded-lg transition-colors ${
          bookmarked
            ? "text-yellow-500 hover:text-yellow-600"
            : "text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400"
        }`}
        title={t("starBookmark")}
      >
        <svg className="w-5 h-5" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      </button>

      {showTip && (
        <div
          ref={tipRef}
          className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3 whitespace-nowrap z-50"
        >
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {t("starBookmark")}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isMac ? "⌘+D" : "Ctrl+D"} {t("starBookmarkHint")}
          </p>
        </div>
      )}
    </div>
  );
}
