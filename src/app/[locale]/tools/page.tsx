import { getTranslations } from "next-intl/server";
import ToolCard from "@/components/ToolCard";

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tools" });

  const toolKeys = [
    { key: "percentage", icon: "📊", slug: "percentage" },
    { key: "bmi", icon: "⚖️", slug: "bmi" },
    { key: "wordCounter", icon: "📝", slug: "word-counter" },
    { key: "ageCalculator", icon: "🎂", slug: "age-calculator" },
    { key: "unitConverter", icon: "🔄", slug: "unit-converter" },
    { key: "discount", icon: "🏷️", slug: "discount" },
    { key: "tipCalculator", icon: "💰", slug: "tip-calculator" },
    { key: "loanCalculator", icon: "🏦", slug: "loan-calculator" },
    { key: "averageCalculator", icon: "📈", slug: "average-calculator" },
    { key: "timeZoneConverter", icon: "🕐", slug: "time-zone-converter" },
    { key: "currencyConverter", icon: "💱", slug: "currency-converter" },
    { key: "romanNumeral", icon: "🏛️", slug: "roman-numeral-converter" },
    { key: "numberBase", icon: "🔢", slug: "number-base-converter" },
    { key: "passwordGenerator", icon: "🔐", slug: "password-generator" },
    { key: "loremIpsum", icon: "📄", slug: "lorem-ipsum" },
    { key: "caseConverter", icon: "🔤", slug: "case-converter" },
    { key: "urlEncoder", icon: "🔗", slug: "url-encoder" },
    { key: "calorieCalculator", icon: "🔥", slug: "calorie-calculator" },
    { key: "dueDateCalculator", icon: "👶", slug: "due-date-calculator" },
    { key: "dateDifference", icon: "📅", slug: "date-difference" },
    { key: "whatToEat", icon: "🍽️", slug: "what-to-eat" },
  ];

  return (
    <div className="container-main py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">{t("title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          {t("subtitle")}
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {toolKeys.map(({ key, icon, slug }) => (
          <ToolCard
            key={key}
            title={t(`${key}.title`)}
            description={t(`${key}.description`)}
            href={`/${locale}/tools/${slug}`}
            icon={icon}
          />
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tools" });
  return { title: t("title"), description: t("description") };
}
