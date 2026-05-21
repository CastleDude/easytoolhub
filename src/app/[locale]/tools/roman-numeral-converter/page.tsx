"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toRoman, fromRoman } from "@/lib/tools";

export default function RomanNumeralPage() {
  const t = useTranslations("Tools.romanNumeral");
  const [mode, setMode] = useState<"toRoman" | "fromRoman">("toRoman");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleConvert() {
    setError("");
    if (!input.trim()) return;
    if (mode === "toRoman") {
      const num = parseInt(input);
      if (isNaN(num) || num < 1 || num > 3999) {
        setError(t("invalid"));
        return;
      }
      setResult(toRoman(num));
    } else {
      const val = fromRoman(input.toUpperCase());
      if (val === 0 && input.toUpperCase() !== "N" && !input.match(/^[IVXLCDM]+$/i)) {
        setError(t("invalid"));
        return;
      }
      setResult(fromRoman(input.toUpperCase()).toString());
    }
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode("toRoman"); setResult(null); setInput(""); setError(""); }}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
            mode === "toRoman"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          {t("numberToRoman")}
        </button>
        <button
          onClick={() => { setMode("fromRoman"); setResult(null); setInput(""); setError(""); }}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
            mode === "fromRoman"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          {t("romanToNumber")}
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          {mode === "toRoman" ? t("number") : t("roman")}
        </label>
        <input
          type={mode === "toRoman" ? "number" : "text"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "toRoman" ? t("placeholderNumber") : t("placeholderRoman")}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleConvert}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("convert")}
      </button>

      {result !== null && (
        <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("result")}</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{result}</p>
        </div>
      )}
      <ToolClickTracker toolSlug="roman-numeral-converter" />
      <FeedbackWidget toolSlug="roman-numeral-converter" />
    </div>
  );
}
