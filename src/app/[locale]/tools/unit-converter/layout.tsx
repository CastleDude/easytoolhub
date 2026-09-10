import { generateToolPageMetadata } from "@/lib/tool-metadata";

export const generateMetadata = generateToolPageMetadata("unit-converter");

export default function ToolPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
