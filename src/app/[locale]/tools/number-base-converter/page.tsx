"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { convertBase, type Base } from "@/lib/tools";

const baseNames: Record<Base, string> = { 2: "Binary", 8: "Octal", 10: "Decimal", 16: "Hexadecimal" };

export default function NumberBasePage() {
  const t = useTranslations("Tools.numberBase");
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState<Base>(10);
  const [toBase, setToBase] = useState<Base>(2);
  const [result, setResult] = useState("");

  function handleConvert() {
    setResult(convertBase(input, fromBase, toBase));
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t("inputValue")}</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("fromBase")}</label>
            <select
              value={fromBase}
              onChange={(e) => setFromBase(Number(e.target.value) as Base)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {([2, 8, 10, 16] as Base[]).map((b) => (
                <option key={b} value={b}>{baseNames[b]} (base {b})</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("toBase")}</label>
            <select
              value={toBase}
              onChange={(e) => setToBase(Number(e.target.value) as Base)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {([2, 8, 10, 16] as Base[]).map((b) => (
                <option key={b} value={b}>{baseNames[b]} (base {b})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("convert")}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("result")}</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-mono break-all">{result}</p>
        </div>
      )}
      <ToolClickTracker toolSlug="number-base-converter" />
      <FeedbackWidget toolSlug="number-base-converter" />
      <FavoritedTools />
    </div>
  );
}
