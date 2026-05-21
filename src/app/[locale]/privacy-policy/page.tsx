import { getTranslations } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });

  return (
    <div className="container-main py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("heading")}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {t("lastUpdated")}{" "}
        {new Date().toLocaleDateString(locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : locale === "ko" ? "ko-KR" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("s1Title")}</h2>
          <p>{t("s1Desc")}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t("s1Item1")}</li>
            <li>
              {t("s1Item2part1")}{" "}
              <a href="https://adssettings.google.com" className="text-primary-600 dark:text-primary-400 underline">
                {t("s1Item2Link")}
              </a>
              .
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("s2Title")}</h2>
          <p>{t("s2Desc")}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("s3Title")}</h2>
          <p>{t("s3Desc")}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("s4Title")}</h2>
          <p>{t("s4Desc")}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("s5Title")}</h2>
          <p>{t("s5Desc")}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("s6Title")}</h2>
          <p>
            {t("s6Desc")}{" "}
            <a href={`/${locale}/contact`} className="text-primary-600 dark:text-primary-400 underline">
              {t("s6Link")}
            </a>
            .
          </p>
        </section>
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
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return { title: t("title"), description: t("description") };
}
