"use client";

import { useState, useEffect } from "react";

export default function PHBadge() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem("ph_badge_v2") === "1");
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem("ph_badge_dismissed", "1");
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-1">
      <a
        href="https://www.producthunt.com/products/easytoolhub?launch=easytoolhub"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-orange-200 dark:border-orange-900 shadow-lg hover:shadow-xl hover:border-orange-400 dark:hover:border-orange-600 transition-all group"
      >
        <span className="text-3xl">🏆</span>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            Support us on
          </p>
          <p className="text-lg font-extrabold text-orange-500">
            Product Hunt
          </p>
        </div>
        <svg className="w-5 h-5 text-orange-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M21 12H3" />
        </svg>
      </a>
      <button
        onClick={handleDismiss}
        className="-mt-1 -mr-1 w-7 h-7 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-500 hover:text-white transition-colors text-sm font-bold leading-none"
        title="关闭"
      >
        ✕
      </button>
    </div>
  );
}
