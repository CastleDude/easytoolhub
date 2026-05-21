"use client";

import { useTranslations } from "next-intl";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

export default function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const t = useTranslations("Ad");

  return (
    <div className={`ad-container ${className}`}>
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-400 dark:text-gray-500 min-h-[90px]"
        data-ad-slot={slot}
        data-ad-format={format}
      >
        {t("advertisement")}
      </div>
    </div>
  );
}
