"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { generatePassword } from "@/lib/tools";

export default function PasswordGeneratorPage() {
  const t = useTranslations("Tools.passwordGenerator");
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setPassword(generatePassword(length, opts));
    setCopied(false);
  }

  const copy = useCallback(() => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const strengthScore =
    (opts.upper ? 1 : 0) + (opts.lower ? 1 : 0) + (opts.numbers ? 1 : 0) + (opts.symbols ? 1 : 0);
  const strengthLabel =
    length < 8 ? t("weak") :
    strengthScore < 3 ? t("fair") :
    strengthScore < 4 || length < 12 ? t("strong") : t("veryStrong");

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t("length")}: {length}</label>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>4</span><span>64</span>
          </div>
        </div>

        <div className="space-y-2">
          {(["upper", "lower", "numbers", "symbols"] as const).map((key) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={opts[key]}
                onChange={(e) => setOpts({ ...opts, [key]: e.target.checked })}
                className="w-4 h-4 rounded accent-primary-600"
              />
              <span className="text-sm">{t(key === "upper" ? "uppercase" : key === "lower" ? "lowercase" : key)}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("generate")}
      </button>

      {password && (
        <div className="mt-8">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-3">
            <code className="flex-1 text-lg font-mono break-all select-all">{password}</code>
            <button
              onClick={copy}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shrink-0"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            {t("strength")}: <span className="font-semibold">{strengthLabel}</span>
          </p>
        </div>
      )}
      <ToolClickTracker toolSlug="password-generator" />
      <FeedbackWidget toolSlug="password-generator" />
      <FavoritedTools />
    </div>
  );
}
