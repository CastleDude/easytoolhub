"use client";

import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  const tt = useTranslations("Tools");
  const locale = useLocale();

  const topTools = [
    { key: "percentage", slug: "percentage" },
    { key: "loanCalculator", slug: "loan-calculator" },
    { key: "bmi", slug: "bmi" },
    { key: "passwordGenerator", slug: "password-generator" },
    { key: "calorieCalculator", slug: "calorie-calculator" },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-auto">
      <div className="container-main py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">{t("tools")}</h3>
            <ul className="space-y-2">
              {topTools.map(({ key, slug }) => (
                <li key={key}>
                  <a href={`/${locale}/tools/${slug}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {tt(`${key}.title` as any)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">{t("company")}</h3>
            <ul className="space-y-2">
              <li><a href={`/${locale}/about`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t("aboutUs")}</a></li>
              <li><a href={`/${locale}/contact`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t("contact")}</a></li>
              <li><a href={`/${locale}/blog`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t("blog")}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">{t("legal")}</h3>
            <ul className="space-y-2">
              <li><a href={`/${locale}/privacy-policy`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t("privacyPolicy")}</a></li>
              <li><a href={`/${locale}/affiliate-disclosure`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t("affiliateDisclosure")}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">EasyToolHub</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t("tagline")}</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
