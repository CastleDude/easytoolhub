"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { countWords } from "@/lib/tools";

export default function WordCounterPage() {
  const t = useTranslations("Tools.wordCounter");
  const [text, setText] = useState("");
  const stats = countWords(text);

  return (
    <div className="container-main py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        rows={10}
        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y transition-all"
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
        <StatCard label={t("words")} value={stats.words} />
        <StatCard label={t("characters")} value={stats.chars} />
        <StatCard label={t("charsNoSpaces")} value={stats.charsNoSpaces} />
        <StatCard label={t("sentences")} value={stats.sentences} />
        <StatCard label={t("paragraphs")} value={stats.paragraphs} />
      </div>

      <div className="mt-16 prose dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-3">{t("whyTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t("whyDesc")}</p>
        <h3 className="font-semibold mt-4 mb-2">{t("featuresTitle")}</h3>
        <ul className="text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
          <li>{t("feature1")}</li>
          <li>{t("feature2")}</li>
          <li>{t("feature3")}</li>
          <li>{t("feature4")}</li>
        </ul>
      </div>
      <ToolClickTracker toolSlug="word-counter" />
      <FeedbackWidget toolSlug="word-counter" />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-center border border-gray-200 dark:border-gray-800">
      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}
