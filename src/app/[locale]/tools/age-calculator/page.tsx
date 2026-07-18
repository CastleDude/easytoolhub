"use client";
import { getTranslations } from "next-intl/server";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { calcAge } from "@/lib/tools";
import DatePickerInput from "@/components/DatePickerInput";

export default function AgeCalculatorPage() {
  const t = useTranslations("Tools.ageCalculator");
  const locale = useLocale();
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [result, setResult] = useState<ReturnType<typeof calcAge> | null>(null);

  function calculate() {
    if (!birthDate) return;
    setResult(calcAge(birthDate));
  }

  return (
    <div className="py-4">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">{t("dateOfBirth")}</label>
        <DatePickerInput
          value={birthDate}
          onChange={setBirthDate}
          locale={locale}
          max={new Date()}
          placeholder={t("placeholder")}
        />
      </div>

      <button
        onClick={calculate}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("calculate")}
      </button>

      {result && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-center border border-primary-100 dark:border-primary-900">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{result.years}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("years")}</p>
          </div>
          <div className="p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-center border border-primary-100 dark:border-primary-900">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{result.months}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("months")}</p>
          </div>
          <div className="p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-center border border-primary-100 dark:border-primary-900">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{result.days}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("days")}</p>
          </div>
          <div className="p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-center border border-primary-100 dark:border-primary-900">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{result.totalDays.toLocaleString(locale)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("totalDays")}</p>
          </div>
        </div>
      )}

      <div className="mt-16 prose dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-3">{t("howTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t("howDesc1")}</p>
        <p className="text-gray-600 dark:text-gray-400 mt-3">{t("howDesc2")}</p>
      </div>
      <ToolClickTracker toolSlug="age-calculator" />
      <FeedbackWidget toolSlug="age-calculator" />
    </div>
  );
}

// ---- SEO metadata (server-side) ----
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tools" });
  const th = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("ageCalculator.title");
  const description = t("ageCalculator.description");
  const url = `/${locale}/tools/age-calculator`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytoolhub.com";

  return {
    title,
    description,
    keywords: ["age calculator", "online tool", "free calculator", "EasyToolHub", "time"],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url: siteUrl + url,
      siteName: th("siteName"),
    },
  };
}