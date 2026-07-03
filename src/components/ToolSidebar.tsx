"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toolDefs } from "@/lib/tool-defs";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { useState, useEffect, useCallback } from "react";

export default function ToolSidebar({ locale }: { locale: string }) {
  const t = useTranslations("Tools");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    setPinned(getFavorites());
  }, []);

  const handleTogglePin = useCallback((slug: string) => {
    const updated = toggleFavorite(slug);
    setPinned(updated);
  }, []);

  const tools = toolDefs.map(({ key, icon, slug }) => ({
    key,
    icon,
    slug,
    title: t(`${key}.title`),
  }));

  // Sort: pinned first, then the rest
  const sortedTools = [...tools].sort((a, b) => {
    const aPinned = pinned.includes(a.slug);
    const bPinned = pinned.includes(b.slug);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  function renderRow(key: string, icon: string, slug: string, title: string) {
    const href = `/${locale}/tools/${slug}`;
    const isActive = pathname === href;
    const isPinned = pinned.includes(slug);
    return (
      <div
        key={key}
        className={`group/tool flex items-center rounded-lg text-sm transition-colors ${
          isActive
            ? "bg-primary-600 text-white font-medium"
            : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      >
        <Link href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 flex-1 min-w-0" title={title}>
          <span className="text-base shrink-0">{icon}</span>
          <span className="truncate">{title}</span>
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTogglePin(slug);
          }}
          className={`shrink-0 w-7 h-7 mr-1 flex items-center justify-center rounded-full transition-all ${
            isPinned
              ? "text-red-500 bg-red-50 dark:bg-red-950"
              : "text-gray-300 dark:text-gray-600 hover:text-red-400 opacity-0 group-hover/tool:opacity-100"
          }`}
          title={isPinned ? t("unpin") : t("pin")}
        >
          <svg className="w-4 h-4" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12V4h1a1 1 0 000-2H7a1 1 0 000 2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
          </svg>
        </button>
      </div>
    );
  }

  const sidebarContent = (
    <nav className="space-y-0.5">
      {sortedTools.map(({ key, icon, slug, title }) => renderRow(key, icon, slug, title))}
    </nav>
  );

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <span>🔧</span>
          <span>{t("title")}</span>
          <span className="ml-auto text-xs text-gray-400">{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <div className="mt-3 p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 max-h-72 overflow-y-auto sidebar-scroll">
            {sidebarContent}
          </div>
        )}
      </div>

      {/* Desktop: sticky sidebar with light background and hidden scrollbar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white text-center px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Link href={`/${locale}/tools`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {t("title")}
            </Link>
          </h2>
          <div className="px-2 py-2 overflow-y-auto sidebar-scroll max-h-[calc(100vh-11rem)]">
            {sidebarContent}
          </div>
        </div>
      </aside>
    </>
  );
}
