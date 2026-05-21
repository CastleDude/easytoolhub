"use client";

import { useState, useMemo, useCallback } from "react";
import ToolCard from "@/components/ToolCard";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

interface Tool {
  key: string;
  icon: string;
  slug: string;
  title: string;
  description: string;
}

interface Props {
  topTools: Tool[];
  restTools: Tool[];
  locale: string;
  buttonText: string;
  favAddLabel: string;
  favRemoveLabel: string;
}

export default function ExpandableToolsGrid({ topTools, restTools, locale, buttonText, favAddLabel, favRemoveLabel }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  const allTools = useMemo(() => [...topTools, ...restTools], [topTools, restTools]);

  const reorderByFavorites = useCallback((tools: Tool[]) => {
    if (favorites.length === 0) return tools;
    const favSet = new Set(favorites);
    const favTools: Tool[] = [];
    const otherTools: Tool[] = [];
    // Preserve favorite order from cookie
    for (const slug of favorites) {
      const t = tools.find((tool) => tool.slug === slug);
      if (t) favTools.push(t);
    }
    for (const t of tools) {
      if (!favSet.has(t.slug)) otherTools.push(t);
    }
    return [...favTools, ...otherTools];
  }, [favorites]);

  const orderedTopTools = useMemo(() => reorderByFavorites(topTools), [topTools, reorderByFavorites]);
  const orderedAllTools = useMemo(() => reorderByFavorites(allTools), [allTools, reorderByFavorites]);

  const handleFavorite = useCallback((slug: string) => {
    const updated = toggleFavorite(slug);
    setFavorites([...updated]);
  }, []);

  const visibleTools = expanded ? orderedAllTools : orderedTopTools;

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTools.map((tool) => (
          <ToolCard
            key={tool.key}
            title={tool.title}
            description={tool.description}
            href={`/${locale}/tools/${tool.slug}`}
            icon={tool.icon}
            favorited={favorites.includes(tool.slug)}
            onFavorite={() => handleFavorite(tool.slug)}
            favLabel={favorites.includes(tool.slug) ? favRemoveLabel : favAddLabel}
          />
        ))}
      </div>

      {!expanded && (
        <div className="text-center mt-8">
          <button
            onClick={() => setExpanded(true)}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
}
