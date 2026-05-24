"use client";

import { useState, useCallback } from "react";
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
  tools: Tool[];
  locale: string;
  pinLabel: string;
  unpinLabel: string;
}

export default function ToolsGrid({ tools, locale, pinLabel, unpinLabel }: Props) {
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  const handlePin = useCallback((slug: string) => {
    const updated = toggleFavorite(slug);
    setFavorites([...updated]);
  }, []);

  const orderedTools = (() => {
    if (favorites.length === 0) return tools;
    const favSet = new Set(favorites);
    const pinned: Tool[] = [];
    const rest: Tool[] = [];
    for (const slug of favorites) {
      const t = tools.find((tool) => tool.slug === slug);
      if (t) pinned.push(t);
    }
    for (const t of tools) {
      if (!favSet.has(t.slug)) rest.push(t);
    }
    return [...pinned, ...rest];
  })();

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {orderedTools.map((tool) => (
        <ToolCard
          key={tool.key}
          title={tool.title}
          description={tool.description}
          href={`/${locale}/tools/${tool.slug}`}
          icon={tool.icon}
          favorited={favorites.includes(tool.slug)}
          onFavorite={() => handlePin(tool.slug)}
          favLabel={favorites.includes(tool.slug) ? unpinLabel : pinLabel}
        />
      ))}
    </div>
  );
}
