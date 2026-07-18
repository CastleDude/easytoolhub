"use client";

import { useState } from "react";

export default function PHBadge() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-2">
      <a
        href="https://www.producthunt.com"
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
        onClick={() => setDismissed(true)}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
