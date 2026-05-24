"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

interface RatesData {
  date: string;
  rates: Record<string, number>;
  cached?: boolean;
}

const CURRENCY_CODES = ["USD", "EUR", "GBP", "JPY", "CNY", "KRW", "INR", "CAD", "AUD", "CHF", "MXN", "BRL"];

export default function CurrencyConverterPage() {
  const t = useTranslations("Tools.currencyConverter");
  const [amount, setAmount] = useState("1");
  const [fromCur, setFromCur] = useState("USD");
  const [toCur, setToCur] = useState("CNY");
  const [result, setResult] = useState<number | null>(null);
  const [ratesData, setRatesData] = useState<RatesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/currency-rates")
      .then((r) => r.json())
      .then((data) => setRatesData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const convertCurrency = useCallback((amt: number, from: string, to: string, rates: Record<string, number>) => {
    const fromRate = from === "USD" ? 1 : rates[from];
    const toRate = to === "USD" ? 1 : rates[to];
    if (!fromRate || !toRate) return null;
    return Math.round((amt / fromRate) * toRate * 100) / 100;
  }, []);

  function handleConvert() {
    const a = parseFloat(amount);
    if (isNaN(a) || !ratesData) return;
    setResult(convertCurrency(a, fromCur, toCur, ratesData.rates));
  }

  const currencies = ratesData
    ? Object.keys(ratesData.rates).filter((k) => k !== "USD")
    : CURRENCY_CODES.filter((k) => k !== "USD");

  function currencyName(code: string) {
    return t(`currencies.${code}` as any);
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t("amount")}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("fromCurrency")}</label>
            <select
              value={fromCur}
              onChange={(e) => setFromCur(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="USD">{currencyName("USD")}</option>
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {currencyName(code)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setFromCur(toCur); setToCur(fromCur); setResult(null); }}
            className="shrink-0 w-10 h-[46px] flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={t("swap")}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M21 12H9M7 16l-4-4 4-4M3 12h12" />
            </svg>
          </button>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("toCurrency")}</label>
            <select
              value={toCur}
              onChange={(e) => setToCur(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="USD">{currencyName("USD")}</option>
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {currencyName(code)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleConvert}
        disabled={loading || !ratesData}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : t("convert")}
      </button>

      {result !== null && ratesData && (
        <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-950 rounded-xl">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("result")}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {result.toFixed(2)} {toCur}
            </p>
          </div>
          <div className="pt-4 border-t border-primary-200 dark:border-primary-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 text-center">{t("exchangeRate")}</p>
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="font-mono font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                1 {fromCur} = {(convertCurrency(1, fromCur, toCur, ratesData.rates) ?? 0).toFixed(4)} {toCur}
              </span>
              <span className="text-gray-400">/</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                1 {toCur} = {(convertCurrency(1, toCur, fromCur, ratesData.rates) ?? 0).toFixed(4)} {fromCur}
              </span>
            </div>
          </div>
        </div>
      )}

      {ratesData && (
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          {t("rateDate")}: {formatDate(ratesData.date)}
        </p>
      )}

      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center">{t("disclaimer")}</p>
      <ToolClickTracker toolSlug="currency-converter" />
      <FeedbackWidget toolSlug="currency-converter" />
      <FavoritedTools />
    </div>
  );
}
