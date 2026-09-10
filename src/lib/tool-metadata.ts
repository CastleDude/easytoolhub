import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { toolDefs } from "./tool-defs";
import { locales, localesWithHreflang } from "@/i18n/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytoolhub.top";

/**
 * Factory that returns a `generateMetadata` for a tool page identified by its
 * URL slug (kebab-case, e.g. "bmi", "word-counter").
 *
 * Tool pages are client components, so they can't export `generateMetadata`
 * themselves. A tiny per-tool `layout.tsx` calls this factory with its slug.
 */
export function generateToolPageMetadata(slug: string) {
  const tool = toolDefs.find((t) => t.slug === slug);

  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    if (!tool) return {};

    const t = await getTranslations({ locale, namespace: "Tools" });
    const title = t(`${tool.key}.title`);
    const description = t(`${tool.key}.description`);

    const languages: Record<string, string> = {};
    for (const loc of locales) {
      languages[localesWithHreflang[loc]] = `/${loc}/tools/${slug}`;
    }

    return {
      title,
      description,
      openGraph: {
        type: "website",
        title,
        description,
        url: `${siteUrl}/${locale}/tools/${slug}`,
      },
      alternates: {
        canonical: `/${locale}/tools/${slug}`,
        languages,
      },
    };
  };
}
