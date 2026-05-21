import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/blog";
import { locales, localesWithHreflang } from "@/i18n/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytoolhub.com";

const toolSlugs = [
  "percentage",
  "bmi",
  "word-counter",
  "age-calculator",
  "unit-converter",
  "discount",
  "tip-calculator",
  "loan-calculator",
  "average-calculator",
  "time-zone-converter",
  "currency-converter",
  "roman-numeral-converter",
  "number-base-converter",
  "password-generator",
  "lorem-ipsum",
  "case-converter",
  "url-encoder",
  "calorie-calculator",
  "due-date-calculator",
  "date-difference",
  "what-to-eat",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    // Homepage
    entries.push({
      url: `${siteUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });

    // Tools index
    entries.push({
      url: `${siteUrl}/${locale}/tools`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    });

    // Individual tools
    for (const slug of toolSlugs) {
      entries.push({
        url: `${siteUrl}/${locale}/tools/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    // Blog index
    entries.push({
      url: `${siteUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    // Individual blog posts
    for (const slug of getAllBlogSlugs()) {
      entries.push({
        url: `${siteUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    // Static pages
    entries.push({
      url: `${siteUrl}/${locale}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
    entries.push({
      url: `${siteUrl}/${locale}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    });
    entries.push({
      url: `${siteUrl}/${locale}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    });
    entries.push({
      url: `${siteUrl}/${locale}/affiliate-disclosure`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    });
  }

  return entries;
}
