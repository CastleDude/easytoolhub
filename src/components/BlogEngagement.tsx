"use client";

import { useState, useEffect, useCallback } from "react";

interface Stats {
  views: number;
  likes: number;
}

function useBlogEngagement(slug: string) {
  const [stats, setStats] = useState<Stats>({ views: 0, likes: 0 });
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const likedKey = `blog_liked_${slug}`;
    if (localStorage.getItem(likedKey)) setLiked(true);

    const viewedKey = `blog_viewed_${slug}`;
    const action = sessionStorage.getItem(viewedKey) ? "get" : "view";

    fetch("/api/blog/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setStats(d.data);
        if (action === "view") sessionStorage.setItem(viewedKey, "1");
      })
      .catch(() => {});
  }, [slug]);

  const handleLike = useCallback(() => {
    if (liked) return;
    fetch("/api/blog/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: "like" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setStats(d.data);
          setLiked(true);
          localStorage.setItem(`blog_liked_${slug}`, "1");
        }
      })
      .catch(() => {});
  }, [slug, liked]);

  return { stats, liked, handleLike };
}

function formatCount(n: number): string {
  if (n >= 10000) return (n / 1000).toFixed(1) + "k";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

/** Top bar: views + likes inline */
export function BlogStatsBar({ slug }: { slug: string }) {
  const { stats } = useBlogEngagement(slug);
  return (
    <div className="flex items-center gap-4 text-sm text-gray-400">
      <span className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {formatCount(stats.views)}
      </span>
      <span className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {formatCount(stats.likes)}
      </span>
    </div>
  );
}

/** Bottom: large like button */
export function BlogLikeButton({ slug }: { slug: string }) {
  const { stats, liked, handleLike } = useBlogEngagement(slug);
  const [animating, setAnimating] = useState(false);

  const onClick = () => {
    if (liked) return;
    handleLike();
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
      <button
        onClick={onClick}
        disabled={liked}
        className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold transition-all ${
          liked
            ? "bg-red-50 dark:bg-red-950 text-red-500 cursor-default"
            : "bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 border border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-800"
        }`}
      >
        <svg
          className={`w-8 h-8 transition-all ${animating ? "scale-125" : ""}`}
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <span className="text-2xl">{formatCount(stats.likes)}</span>
        <span className="text-sm font-normal">{liked ? "已点赞" : "点赞"}</span>
      </button>
    </div>
  );
}
