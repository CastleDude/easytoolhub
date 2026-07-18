import ToolsLayoutClient from "./ToolsLayoutClient";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getTranslations } from "next-intl/server";

export default async function ToolsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tools" });
  const th = await getTranslations({ locale, namespace: "Metadata" });

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: th("homeTitle"), href: `/${locale}` },
          { name: t("title"), href: `/${locale}/tools` },
        ]}
      />
      <ToolsLayoutClient locale={locale}>
        {children}
      </ToolsLayoutClient>
    </>
  );
}
