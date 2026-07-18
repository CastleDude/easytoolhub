import { getTranslations } from "next-intl/server";
import AnimatedBanner from "@/components/AnimatedBanner";
import ExpandableToolsGrid from "@/components/ExpandableToolsGrid";
import BookmarkButton from "@/components/BookmarkButton";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

function getToolKeys() {
  return [
    { key: "percentage", icon: "📊", slug: "percentage" },
    { key: "loanCalculator", icon: "🏦", slug: "loan-calculator" },
    { key: "bmi", icon: "⚖️", slug: "bmi" },
    { key: "passwordGenerator", icon: "🔐", slug: "password-generator" },
    { key: "calorieCalculator", icon: "🔥", slug: "calorie-calculator" },
    { key: "currencyConverter", icon: "💱", slug: "currency-converter" },
    { key: "wordCounter", icon: "📝", slug: "word-counter" },
    { key: "ageCalculator", icon: "🎂", slug: "age-calculator" },
    { key: "unitConverter", icon: "🔄", slug: "unit-converter" },
    { key: "discount", icon: "🏷️", slug: "discount" },
    { key: "tipCalculator", icon: "💰", slug: "tip-calculator" },
    { key: "averageCalculator", icon: "📈", slug: "average-calculator" },
    { key: "timeZoneConverter", icon: "🕐", slug: "time-zone-converter" },
    { key: "dueDateCalculator", icon: "👶", slug: "due-date-calculator" },
    { key: "dateDifference", icon: "📅", slug: "date-difference" },
    { key: "romanNumeral", icon: "🏛️", slug: "roman-numeral-converter" },
    { key: "numberBase", icon: "🔢", slug: "number-base-converter" },
    { key: "caseConverter", icon: "🔤", slug: "case-converter" },
    { key: "urlEncoder", icon: "🔗", slug: "url-encoder" },
    { key: "loremIpsum", icon: "📄", slug: "lorem-ipsum" },
    { key: "whatToEat", icon: "🍽️", slug: "what-to-eat" },
  ];
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  const tt = await getTranslations({ locale, namespace: "Tools" });

  const tools = getToolKeys();
  const topTools = tools.slice(0, 6).map((t) => ({
    ...t,
    title: tt(`${t.key}.title` as any),
    description: tt(`${t.key}.description` as any),
  }));
  const restTools = tools.slice(6).map((t) => ({
    ...t,
    title: tt(`${t.key}.title` as any),
    description: tt(`${t.key}.description` as any),
  }));

  return (
    <>
      {/* ===== Hero ===== */}
      <AnimatedBanner>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
          {t("heroTitle1")}
          <br />
          <span className="text-primary-600 dark:text-primary-400">
            {t("heroTitle2")}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          {t("heroSubtitle")}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href={`/${locale}/tools`}
            className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            {t("exploreTools")}
          </a>
          <a
            href={`/${locale}/blog`}
            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors shadow-sm"
          >
            {t("readReviews")}
          </a>
          <BookmarkButton />
        </div>

        {/* Stats bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {[
            { num: "21+", label: t("statTools") },
            { num: "8", label: t("statLanguages") },
            { num: "16", label: t("statReviews") },
            { num: "∞", label: t("statFree") },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                {num}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </AnimatedBanner>

      {/* ===== Popular Tools ===== */}
      <section className="py-16 md:py-20">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t("popularTools")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {t("popularToolsDesc")}
            </p>
          </div>
          <ExpandableToolsGrid
            topTools={topTools}
            restTools={restTools}
            locale={locale}
            buttonText={t("viewAllTools")}
            favAddLabel={t("favAdd")}
            favRemoveLabel={t("favRemove")}
          />
        </div>
      </section>

      {/* ===== Why Us ===== */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t("whyTitle")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {t("whySubtitle")}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((n) => (
              <div key={n} className="text-center">
                <div className="text-3xl mb-3">
                  {n === 1 ? "⚡" : n === 2 ? "🌍" : "🛡️"}
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t(`why${n}Title`)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t(`why${n}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Reviews Preview ===== */}
      <section className="py-16 md:py-20">
        <div className="container-main text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {t("reviewsTitle")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            {t("reviewsDesc")}
          </p>
          <a
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t("reviewsButton")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-main text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {t("ctaTitle")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-lg mx-auto">
            {t("ctaDesc")}
          </p>
          <a
            href={`/${locale}/tools`}
            className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            {t("ctaButton")}
          </a>
        </div>
      </section>
    </>
  );
}
