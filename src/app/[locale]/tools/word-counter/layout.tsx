import { generateToolPageMetadata } from "@/lib/tool-metadata";

export const generateMetadata = generateToolPageMetadata("word-counter");

export default function ToolPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
