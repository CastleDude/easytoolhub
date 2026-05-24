import { getTranslations } from "next-intl/server";
import ToolsGrid from "@/components/ToolsGrid";
import { toolDefs } from "@/lib/tool-defs";

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tools" });

  const tools = toolDefs.map(({ key, icon, slug }) => ({
    key,
    icon,
    slug,
    title: t(`${key}.title`),
    description: t(`${key}.description`),
  }));

  return (
    <div className="container-main py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">{t("title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          {t("subtitle")}
        </p>
      </div>
      <ToolsGrid
        tools={tools}
        locale={locale}
        pinLabel={t("pin")}
        unpinLabel={t("unpin")}
      />
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
