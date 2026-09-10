import { generateToolPageMetadata } from "@/lib/tool-metadata";

export const generateMetadata = generateToolPageMetadata("tip-calculator");

export default function ToolPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
