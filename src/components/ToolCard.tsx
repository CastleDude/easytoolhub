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
    <div className="relative group/card h-full">
      <Link
        href={href}
        className="block p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group h-full"
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
              ? "text-red-500 bg-red-50 dark:bg-red-950"
              : "text-gray-300 dark:text-gray-600 hover:text-red-400 opacity-0 group-hover/card:opacity-100"
          }`}
          title={favLabel}
        >
          <svg className="w-5 h-5" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12V4h1a1 1 0 000-2H7a1 1 0 000 2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
