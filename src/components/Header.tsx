"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

export default function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  function getLocalizedPath(loc: Locale): string {
    // Remove current locale prefix and prepend new one
    const segments = pathname.split("/").filter(Boolean);
    // First segment is always the locale, but usePathname from next-intl already strips it
    // or includes it depending on usage. Let's reconstruct.
    const pathWithoutLocale = "/" + segments.slice(1).join("/");
    return `/${loc}${pathWithoutLocale}`;
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="container-main flex items-center justify-between h-16">
        <a
          href={`/${locale}`}
          className="text-xl font-bold text-primary-600 dark:text-primary-400"
        >
          {t("logo")}
        </a>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href={`/${locale}/tools`}
            className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
          >
            {t("tools")}
          </a>
          <a
            href={`/${locale}/blog`}
            className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
          >
            {t("reviews")}
          </a>
          <a
            href={`/${locale}/about`}
            className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
          >
            {t("about")}
          </a>
          <a
            href={`/${locale}/contact`}
            className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
          >
            {t("contact")}
          </a>
          <ThemeToggle />
          <LanguageSwitcher
            locale={locale as Locale}
            langOpen={langOpen}
            setLangOpen={setLangOpen}
          />
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-600 dark:text-gray-300"
          aria-label={t("toggleMenu")}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="container-main py-3 flex flex-col gap-2">
            <a href={`/${locale}/tools`} className="py-2 text-sm font-medium" onClick={() => setOpen(false)}>{t("tools")}</a>
            <a href={`/${locale}/blog`} className="py-2 text-sm font-medium" onClick={() => setOpen(false)}>{t("reviews")}</a>
            <a href={`/${locale}/about`} className="py-2 text-sm font-medium" onClick={() => setOpen(false)}>{t("about")}</a>
            <a href={`/${locale}/contact`} className="py-2 text-sm font-medium" onClick={() => setOpen(false)}>{t("contact")}</a>
            <div className="flex gap-2 py-2">
              <ThemeToggle />
              <LanguageSwitcher locale={locale as Locale} langOpen={langOpen} setLangOpen={setLangOpen} />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function LanguageSwitcher({
  locale,
  langOpen,
  setLangOpen,
}: {
  locale: Locale;
  langOpen: boolean;
  setLangOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const pathWithoutLocale = segments.length > 0 ? "/" + segments.join("/") : "";

  return (
    <div className="relative">
      <button
        onClick={() => setLangOpen(!langOpen)}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Switch language"
      >
        {localeNames[locale] || locale}
      </button>
      {langOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px]">
            {locales.map((loc) => (
              <a
                key={loc}
                href={`/${loc}${pathWithoutLocale}`}
                onClick={() => setLangOpen(false)}
                className={`block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  loc === locale
                    ? "text-primary-600 dark:text-primary-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {localeNames[loc]}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  if (!mounted) {
    return <div className="w-10 h-9" />;
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
      aria-label="Toggle dark mode"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
