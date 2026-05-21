import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytoolhub.com";
const siteName = "EasyToolHub";

export function baseMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} - Free Online Tools & Expert Reviews`,
      template: `%s | ${siteName}`,
    },
    description:
      "Free online calculators, converters, and tools. Expert reviews of the best productivity software and tools to make your life easier.",
    keywords: [
      "online tools",
      "calculator",
      "converter",
      "productivity tools",
      "software reviews",
    ],
    authors: [{ name: "EasyToolHub" }],
    openGraph: {
      type: "website",
      siteName,
      title: `${siteName} - Free Online Tools & Expert Reviews`,
      description:
        "Free online calculators, converters, and tools. Expert reviews of the best productivity software.",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description:
        "Free online calculators, converters, and tools. Expert reviews of the best productivity software.",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: "/",
    },
    ...overrides,
  };
}

export function toolMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return baseMetadata({
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
    },
  });
}
