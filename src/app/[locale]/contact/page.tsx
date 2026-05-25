import { getTranslations } from "next-intl/server";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });

  return (
    <div className="container-main py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("heading")}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t("intro")}</p>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("emailTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t("emailText")}</p>
        <a
          href="mailto:postmaster@easytoolhub.top"
          className="text-primary-600 dark:text-primary-400 text-lg font-medium hover:underline"
        >
          postmaster@easytoolhub.top
        </a>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-2">{t("adTitle")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t("adDesc")}</p>
          <a href="mailto:postmaster@easytoolhub.top" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            postmaster@easytoolhub.top
          </a>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-2">{t("contentTitle")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t("contentDesc")}</p>
          <a href="mailto:postmaster@easytoolhub.top" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            postmaster@easytoolhub.top
          </a>
        </div>
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
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: t("title"), description: t("description") };
}
