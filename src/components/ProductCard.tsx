"use client";

import { useTranslations } from "next-intl";
import StarRating from "@/components/StarRating";
import AffiliateLink from "@/components/AffiliateLink";

interface ProductCardProps {
  name: string;
  description: string;
  rating: number;
  pros: string[];
  cons: string[];
  affiliateUrl: string;
  bestFor?: string;
}

export default function ProductCard({
  name,
  description,
  rating,
  pros,
  cons,
  affiliateUrl,
  bestFor,
}: ProductCardProps) {
  const t = useTranslations("ProductCard");

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900 hover:border-primary-300 dark:hover:border-primary-700 transition-all">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold">{name}</h3>
        <StarRating rating={rating} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      {bestFor && (
        <p className="text-sm mb-4">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t("bestFor")}</span>{" "}
          <span className="text-gray-500 dark:text-gray-400">{bestFor}</span>
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-xs font-semibold uppercase text-green-600 dark:text-green-400 mb-2">{t("pros")}</h4>
          <ul className="space-y-1">
            {pros.map((pro) => (
              <li key={pro} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span> {pro}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-red-600 dark:text-red-400 mb-2">{t("cons")}</h4>
          <ul className="space-y-1">
            {cons.map((con) => (
              <li key={con} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span> {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <AffiliateLink
        href={affiliateUrl}
        className="inline-block w-full text-center px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("checkPrice")}
      </AffiliateLink>
    </div>
  );
}
