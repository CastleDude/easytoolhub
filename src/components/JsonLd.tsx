const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytoolhub.com";

interface WebSiteSchema {
  name: string;
  url: string;
  description: string;
}

export function WebSiteJsonLd({ name, url, description }: WebSiteSchema) {
  const json = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${url}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description: string;
}

export function OrganizationJsonLd({ name, url, logo, description }: OrganizationSchema) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: `${siteUrl}${logo}`,
    description,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

interface ArticleSchema {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: string;
  url: string;
}

export function ArticleJsonLd({ headline, description, image, datePublished, dateModified, author, url }: ArticleSchema) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image.startsWith("http") ? image : `${siteUrl}${image}`,
    datePublished,
    dateModified,
    author: { "@type": "Person", name: author },
    publisher: { "@type": "Organization", name: "EasyToolHub", logo: { "@type": "ImageObject", url: `${siteUrl}/images/easytoolhubicon.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}${url}` },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

interface WebAppSchema {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
}

export function WebAppJsonLd({ name, description, url, applicationCategory }: WebAppSchema) {
  const json = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${siteUrl}${url}`,
    applicationCategory,
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
