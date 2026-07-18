"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function StarBookmark() {
  const t = useTranslations("Header");
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBookmarked(localStorage.getItem("star_bookmarked") === "1");
    }
  }, []);

  function handleClick() {
    if (bookmarked) {
      localStorage.removeItem("star_bookmarked");
      setBookmarked(false);
    } else {
      localStorage.setItem("star_bookmarked", "1");
      setBookmarked(true);
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      window.alert(isMac ? "⌘+D 收藏本站" : "Ctrl+D 收藏本站");
    }
  }

  return (
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
  );
}
