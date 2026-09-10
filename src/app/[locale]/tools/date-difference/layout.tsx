import { generateToolPageMetadata } from "@/lib/tool-metadata";

export const generateMetadata = generateToolPageMetadata("date-difference");

export default function ToolPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
