"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { generateLorem } from "@/lib/tools";

export default function LoremIpsumPage() {
  const t = useTranslations("Tools.loremIpsum");
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPer, setWordsPer] = useState(50);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setOutput(generateLorem(paragraphs, wordsPer));
    setCopied(false);
  }

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("paragraphs")}</label>
          <input
            type="number"
            value={paragraphs}
            onChange={(e) => setParagraphs(Number(e.target.value))}
            min={1}
            max={50}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("wordsPerParagraph")}</label>
          <input
            type="number"
            value={wordsPer}
            onChange={(e) => setWordsPer(Number(e.target.value))}
            min={5}
            max={200}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("generate")}
      </button>

      {output && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {paragraphs} paragraphs, ~{paragraphs * wordsPer} words
            </span>
            <button
              onClick={copy}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm leading-relaxed text-gray-700 dark:text-gray-300 max-h-96 overflow-y-auto">
            {output.split("\n\n").map((para, i) => (
              <p key={i} className="mb-4 last:mb-0">{para}</p>
            ))}
          </div>
        </div>
      )}
      <ToolClickTracker toolSlug="lorem-ipsum" />
      <FeedbackWidget toolSlug="lorem-ipsum" />
      <FavoritedTools />
    </div>
  );
}
