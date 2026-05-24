export interface ToolDef {
  key: string;
  icon: string;
  slug: string;
}

export const toolDefs: ToolDef[] = [
  { key: "percentage", icon: "📊", slug: "percentage" },
  { key: "bmi", icon: "⚖️", slug: "bmi" },
  { key: "wordCounter", icon: "📝", slug: "word-counter" },
  { key: "ageCalculator", icon: "🎂", slug: "age-calculator" },
  { key: "unitConverter", icon: "🔄", slug: "unit-converter" },
  { key: "discount", icon: "🏷️", slug: "discount" },
  { key: "tipCalculator", icon: "💰", slug: "tip-calculator" },
  { key: "loanCalculator", icon: "🏦", slug: "loan-calculator" },
  { key: "averageCalculator", icon: "📈", slug: "average-calculator" },
  { key: "timeZoneConverter", icon: "🕐", slug: "time-zone-converter" },
  { key: "currencyConverter", icon: "💱", slug: "currency-converter" },
  { key: "romanNumeral", icon: "🏛️", slug: "roman-numeral-converter" },
  { key: "numberBase", icon: "🔢", slug: "number-base-converter" },
  { key: "passwordGenerator", icon: "🔐", slug: "password-generator" },
  { key: "loremIpsum", icon: "📄", slug: "lorem-ipsum" },
  { key: "caseConverter", icon: "🔤", slug: "case-converter" },
  { key: "urlEncoder", icon: "🔗", slug: "url-encoder" },
  { key: "calorieCalculator", icon: "🔥", slug: "calorie-calculator" },
  { key: "dueDateCalculator", icon: "👶", slug: "due-date-calculator" },
  { key: "dateDifference", icon: "📅", slug: "date-difference" },
  { key: "whatToEat", icon: "🍽️", slug: "what-to-eat" },
];
