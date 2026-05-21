"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function CookieConsent() {
  const t = useTranslations("CookieConsent");
  const locale = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) {
      setShow(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
          {t("text")}{" "}
          <a
            href={`/${locale}/privacy-policy`}
            className="text-primary-600 dark:text-primary-400 underline"
          >
            {t("privacyPolicy")}
          </a>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
