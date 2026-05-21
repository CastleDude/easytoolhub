"use client";

import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  favorited?: boolean;
  onFavorite?: () => void;
  favLabel?: string;
}

export default function ToolCard({ title, description, href, icon, favorited, onFavorite, favLabel }: ToolCardProps) {
  return (
    <div className="relative group/card">
      <Link
        href={href}
        className="block p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
      >
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </Link>
      {onFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite();
          }}
          aria-label={favLabel}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
            favorited
              ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-950"
              : "text-gray-300 dark:text-gray-600 hover:text-yellow-400 opacity-0 group-hover/card:opacity-100"
          }`}
          title={favLabel}
        >
          <svg className="w-5 h-5" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      )}
    </div>
  );
}
