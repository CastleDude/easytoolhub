const fs = require("fs");
const path = require("path");

const toolsDir = "src/app/[locale]/tools";
const dirs = fs.readdirSync(toolsDir, { withFileTypes: true })
  .filter(d => d.isDirectory());

const slugToKey = {
  "percentage": "percentage", "bmi": "bmi", "word-counter": "wordCounter",
  "age-calculator": "ageCalculator", "unit-converter": "unitConverter",
  "discount": "discount", "tip-calculator": "tipCalculator",
  "loan-calculator": "loanCalculator", "average-calculator": "averageCalculator",
  "time-zone-converter": "timeZoneConverter", "currency-converter": "currencyConverter",
  "roman-numeral-converter": "romanNumeral", "number-base-converter": "numberBase",
  "password-generator": "passwordGenerator", "lorem-ipsum": "loremIpsum",
  "case-converter": "caseConverter", "url-encoder": "urlEncoder",
  "calorie-calculator": "calorieCalculator", "due-date-calculator": "dueDateCalculator",
  "date-difference": "dateDifference", "what-to-eat": "whatToEat",
};

const categoryMap = {
  "percentage":"Math","bmi":"Health","word-counter":"Text","age-calculator":"Time",
  "unit-converter":"Converter","discount":"Finance","tip-calculator":"Finance",
  "loan-calculator":"Finance","average-calculator":"Math","time-zone-converter":"Time",
  "currency-converter":"Finance","roman-numeral":"Converter","numberBase":"Developer",
  "password-generator":"Security","lorem-ipsum":"Text","case-converter":"Text",
  "url-encoder":"Developer","calorie-calculator":"Health","due-date-calculator":"Time",
  "date-difference":"Time","what-to-eat":"Lifestyle",
};

let count = 0;
let skipped = 0;

for (const dir of dirs) {
  const pageFile = path.join(toolsDir, dir.name, "page.tsx");
  if (!fs.existsSync(pageFile)) continue;

  let content = fs.readFileSync(pageFile, "utf-8");

  // Strip old broken metadata if present
  const metaIdx = content.indexOf("// ---- SEO metadata");
  if (metaIdx > 0) {
    content = content.substring(0, metaIdx).trimEnd() + "\n";
    console.log("STRIPPED old metadata:", dir.name);
  }

  const toolKey = slugToKey[dir.name] || dir.name;
  const category = categoryMap[dir.name] || "Utility";
  const slug = dir.name;

  // Remove old misplaced import if it's before "use client"
  content = content.replace(/^import \{ getTranslations \} from "next-intl\/server";\n/m, "");

  // Check if getTranslations from server is imported
  if (!content.includes("next-intl/server")) {
    // Insert after "use client" directive
    if (content.startsWith('"use client"')) {
      const idx = content.indexOf("\n");
      content = content.substring(0, idx + 1) + 'import { getTranslations } from "next-intl/server";\n' + content.substring(idx + 1);
    } else {
      content = 'import { getTranslations } from "next-intl/server";\n' + content;
    }
  }

  // Add metadata to end of file
  const kwSlug = slug.replace(/-/g, " ");
  const catLower = category.toLowerCase();
  const lines = [];
  lines.push("");
  lines.push("// ---- SEO metadata (server-side) ----");
  lines.push("export async function generateMetadata({");
  lines.push("  params,");
  lines.push("}: {");
  lines.push("  params: Promise<{ locale: string }>;");
  lines.push("}) {");
  lines.push("  const { locale } = await params;");
  lines.push('  const t = await getTranslations({ locale, namespace: "Tools" });');
  lines.push('  const th = await getTranslations({ locale, namespace: "Metadata" });');
  lines.push('  const title = t("' + toolKey + '.title");');
  lines.push('  const description = t("' + toolKey + '.description");');
  lines.push('  const url = `/${locale}/tools/' + slug + '`;');
  lines.push('  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytoolhub.top";');
  lines.push("");
  lines.push("  return {");
  lines.push("    title,");
  lines.push("    description,");
  lines.push('    keywords: ["' + kwSlug + '", "online tool", "free calculator", "EasyToolHub", "' + catLower + '"],');
  lines.push("    alternates: { canonical: url },");
  lines.push("    openGraph: {");
  lines.push("      title,");
  lines.push("      description,");
  lines.push("      url: siteUrl + url,");
  lines.push('      siteName: th("siteName"),');
  lines.push("    },");
  lines.push("  };");
  lines.push("}");
  const metadata = lines.join("\n");

  content += metadata;
  fs.writeFileSync(pageFile, content, "utf-8");
  console.log("ADDED:", dir.name);
  count++;
}

console.log(`\nDone: ${count} added, ${skipped} skipped`);
