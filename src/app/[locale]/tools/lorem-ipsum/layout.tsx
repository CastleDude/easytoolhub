import { generateToolPageMetadata } from "@/lib/tool-metadata";

export const generateMetadata = generateToolPageMetadata("lorem-ipsum");

export default function ToolPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
