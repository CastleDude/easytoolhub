"use client";

import { usePathname } from "next/navigation";
import ToolSidebar from "@/components/ToolSidebar";

export default function ToolsLayoutClient({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isToolsIndex = pathname === `/${locale}/tools`;

  if (isToolsIndex) {
    return <>{children}</>;
  }

  return (
    <div className="container-main py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <ToolSidebar locale={locale} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
