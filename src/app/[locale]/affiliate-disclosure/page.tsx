import { getTranslations } from "next-intl/server";

export default async function AffiliatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Affiliate" });

  return (
    <div className="container-main py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("heading")}</h1>
      <div className="prose dark:prose-invert max-w-none space-y-4 text-gray-600 dark:text-gray-400">
        <p>{t("intro")}</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">{t("linksTitle")}</h2>
        <p>{t("linksDesc")}</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">{t("honestyTitle")}</h2>
        <p>{t("honestyDesc")}</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">{t("amazonTitle")}</h2>
        <p>{t("amazonDesc")}</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">{t("questionsTitle")}</h2>
        <p>
          {t("questionsDesc")}{" "}
          <a href={`/${locale}/contact`} className="text-primary-600 dark:text-primary-400 underline">
            {t("questionsLink")}
          </a>
          .
        </p>
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
  const t = await getTranslations({ locale, namespace: "Affiliate" });
  return { title: t("title"), description: t("description") };
}
