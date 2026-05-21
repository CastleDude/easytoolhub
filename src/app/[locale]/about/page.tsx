import { getTranslations } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <div className="container-main py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("heading")}</h1>
      <div className="prose dark:prose-invert max-w-none space-y-4">
        <p className="text-lg text-gray-600 dark:text-gray-400">{t("p1")}</p>
        <p className="text-gray-600 dark:text-gray-400">{t("p2")}</p>
        <h2 className="text-xl font-semibold mt-8 mb-4">{t("missionTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t("missionDesc")}</p>
        <h2 className="text-xl font-semibold mt-8 mb-4">{t("moneyTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t("moneyDesc1")}{" "}
          <a
            href={`/${locale}/affiliate-disclosure`}
            className="text-primary-600 dark:text-primary-400 underline"
          >
            {t("moneyLink")}
          </a>{" "}
          {t("moneyDesc2")}
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
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: t("title"), description: t("description") };
}
