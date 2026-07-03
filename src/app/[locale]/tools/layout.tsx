import ToolsLayoutClient from "./ToolsLayoutClient";

export default async function ToolsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ToolsLayoutClient locale={locale}>
      {children}
    </ToolsLayoutClient>
  );
}
