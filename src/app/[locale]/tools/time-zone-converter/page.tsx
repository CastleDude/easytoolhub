"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import FavoritedTools from "@/components/FavoritedTools";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { convertTimezone, timezones } from "@/lib/tools";

const DATE_LOCALE: Record<string, string> = {
  en: "en-US",
  zh: "zh-CN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
};

const MONTHS: Record<string, string[]> = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  zh: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
  es: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
  fr: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
  de: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
  ja: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
  ko: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
  ru: ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"],
};

const WEEKDAYS: Record<string, string[]> = {
  en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  zh: ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],
  es: ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
  fr: ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],
  de: ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],
  ja: ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],
  ko: ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],
  ru: ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"],
};

function manualFormat(date: Date, locale: string): string {
  const months = MONTHS[locale] || MONTHS.en;
  const weekdays = WEEKDAYS[locale] || WEEKDAYS.en;
  const wd = weekdays[date.getDay()];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const time = `${hh}:${mm}:${ss}`;

  if (locale === "zh" || locale === "ja") return `${y}年${m}${d}日 ${wd} ${time}`;
  if (locale === "ko") return `${y}년 ${m} ${d}일 ${wd} ${time}`;
  if (locale === "es") return `${wd}, ${d} de ${m} de ${y}, ${time}`;
  if (locale === "fr") return `${wd} ${d} ${m} ${y} à ${time}`;
  if (locale === "de") return `${wd}, ${d}. ${m} ${y} um ${time}`;
  if (locale === "ru") return `${wd}, ${d} ${m} ${y} г., ${time}`;
  return `${wd}, ${m} ${d}, ${y}, ${time}`;
}

function formatDateTime(date: Date, locale: string): string {
  const dl = DATE_LOCALE[locale] || locale;
  const formatted = new Intl.DateTimeFormat(dl, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

  // Detect if Intl silently fell back to Chinese on a Chinese Windows system
  if (locale === "zh") return formatted;

  if (locale === "ko") {
    // Korean output must contain Hangul; if not, it fell back to Chinese
    if (!/[가-힯]/.test(formatted)) return manualFormat(date, locale);
    return formatted;
  }

  if (locale === "ja") {
    // Japanese weekday names use kanji (e.g. 日曜日), while Chinese uses 星期日.
    // The character "曜" is unique to Japanese day-of-week formatting.
    if (!/曜/.test(formatted)) return manualFormat(date, locale);
    return formatted;
  }

  // For European languages: output must NOT contain any CJK characters
  if (/[一-鿿가-힯぀-ゟ゠-ヿ]/.test(formatted)) {
    return manualFormat(date, locale);
  }

  return formatted;
}

export default function TimeZoneConverterPage() {
  const t = useTranslations("Tools.timeZoneConverter");
  const locale = useLocale();
  const [dateTime, setDateTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [fromZone, setFromZone] = useState("UTC+8");
  const [toZone, setToZone] = useState("UTC+0");
  const [result, setResult] = useState<string | null>(null);

  function handleConvert() {
    const date = new Date(dateTime);
    const resultDate = convertTimezone(date, timezones[fromZone].offset, timezones[toZone].offset);
    setResult(formatDateTime(resultDate, locale));
  }

  function swapZones() {
    setFromZone(toZone);
    setToZone(fromZone);
  }

  function useNow() {
    setDateTime(new Date().toISOString().slice(0, 16));
  }

  function getTimeDiff() {
    const fromOffset = timezones[fromZone].offset;
    const toOffset = timezones[toZone].offset;
    const diffHours = toOffset - fromOffset;
    const fromName = t(`timezones.${fromZone}`);
    const toName = t(`timezones.${toZone}`);
    const blue = (chunks: React.ReactNode) => <span className="text-primary-600 dark:text-primary-400">{chunks}</span>;

    if (diffHours === 0) {
      return (
        <span className="text-gray-600 dark:text-gray-400">
          {t.rich("timeDiffSame", { from: fromName, to: toName, blue })}
        </span>
      );
    }
    const absHours = Math.floor(Math.abs(diffHours));
    const absMinutes = Math.round((Math.abs(diffHours) - absHours) * 60);
    const params = { from: fromName, to: toName, hours: absHours, minutes: absMinutes, blue };
    return diffHours > 0
      ? <span className="text-green-600 dark:text-green-400">{t.rich("timeDiffAhead", params)}</span>
      : <span className="text-amber-600 dark:text-amber-400">{t.rich("timeDiffBehind", params)}</span>;
  }

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t("dateTime")}</label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              onClick={useNow}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {t("now")}
            </button>
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("fromTimezone")}</label>
            <select
              value={fromZone}
              onChange={(e) => setFromZone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {Object.entries(timezones).map(([key, { name, offset }]) => (
                <option key={key} value={key}>
                  {t(`timezones.${key}`)} (UTC{offset >= 0 ? "+" : ""}{offset})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={swapZones}
            title={t("swap")}
            className="flex-shrink-0 mb-0.5 px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ⇄
          </button>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t("toTimezone")}</label>
            <select
              value={toZone}
              onChange={(e) => setToZone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {Object.entries(timezones).map(([key, { name, offset }]) => (
                <option key={key} value={key}>
                  {t(`timezones.${key}`)} (UTC{offset >= 0 ? "+" : ""}{offset})
                </option>
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

      {result !== null && (
        <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center space-y-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("result")}</p>
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{result}</p>
          </div>
          <div className="pt-3 border-t border-primary-200 dark:border-primary-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("timeDiff")}</p>
            <p className="text-base font-semibold text-primary-600 dark:text-primary-400">{getTimeDiff()}</p>
          </div>
        </div>
      )}
      <ToolClickTracker toolSlug="time-zone-converter" />
      <FeedbackWidget toolSlug="time-zone-converter" />
      <FavoritedTools />
    </div>
  );
}
