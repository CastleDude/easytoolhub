// ============================================================
// Percentage Calculator
// ============================================================
export function calcPercentage(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}
export function calcPercentageOf(percent: number, whole: number): number {
  return (percent / 100) * whole;
}
export function calcPercentageChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

// ============================================================
// BMI Calculator
// ============================================================
export type BMICategory = "underweight" | "normal" | "overweight" | "obese";
export function calcBMI(weightKg: number, heightCm: number): { bmi: number; category: BMICategory } {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category: BMICategory;
  if (bmi < 18.5) category = "underweight";
  else if (bmi < 25) category = "normal";
  else if (bmi < 30) category = "overweight";
  else category = "obese";
  return { bmi: Math.round(bmi * 10) / 10, category };
}

// ============================================================
// Word Counter
// ============================================================
export function countWords(text: string): {
  words: number; chars: number; charsNoSpaces: number;
  sentences: number; paragraphs: number;
} {
  const trimmed = text.trim();
  if (!trimmed) return { words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0 };
  return {
    words: trimmed.split(/\s+/).length,
    chars: trimmed.length,
    charsNoSpaces: trimmed.replace(/\s/g, "").length,
    sentences: trimmed.split(/[.!?]+/).filter(Boolean).length,
    paragraphs: trimmed.split(/\n\s*\n/).filter(Boolean).length,
  };
}

// ============================================================
// Age Calculator
// ============================================================
export function calcAge(birthDate: Date): { years: number; months: number; days: number; totalDays: number } {
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  return { years, months, days, totalDays: Math.floor((today.getTime() - birthDate.getTime()) / 86400000) };
}

// ============================================================
// Unit Converter
// ============================================================
export type UnitCategory = "length" | "weight" | "temperature" | "volume" | "area";
interface UnitDef { name: string; toBase: (v: number) => number; fromBase: (v: number) => number; }
export const unitDefs: Record<UnitCategory, Record<string, UnitDef>> = {
  length: {
    meter: { name: "Meter (m)", toBase: v => v, fromBase: v => v },
    kilometer: { name: "Kilometer (km)", toBase: v => v * 1000, fromBase: v => v / 1000 },
    centimeter: { name: "Centimeter (cm)", toBase: v => v / 100, fromBase: v => v * 100 },
    mile: { name: "Mile (mi)", toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    foot: { name: "Foot (ft)", toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    inch: { name: "Inch (in)", toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
  },
  weight: {
    kilogram: { name: "Kilogram (kg)", toBase: v => v, fromBase: v => v },
    gram: { name: "Gram (g)", toBase: v => v / 1000, fromBase: v => v * 1000 },
    pound: { name: "Pound (lb)", toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
    ounce: { name: "Ounce (oz)", toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
    stone: { name: "Stone (st)", toBase: v => v * 6.35029, fromBase: v => v / 6.35029 },
  },
  temperature: {
    celsius: { name: "Celsius (°C)", toBase: v => v, fromBase: v => v },
    fahrenheit: { name: "Fahrenheit (°F)", toBase: v => ((v - 32) * 5) / 9, fromBase: v => (v * 9) / 5 + 32 },
    kelvin: { name: "Kelvin (K)", toBase: v => v - 273.15, fromBase: v => v + 273.15 },
  },
  volume: {
    liter: { name: "Liter (L)", toBase: v => v, fromBase: v => v },
    milliliter: { name: "Milliliter (mL)", toBase: v => v / 1000, fromBase: v => v * 1000 },
    gallon: { name: "Gallon (gal)", toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
    quart: { name: "Quart (qt)", toBase: v => v * 0.946353, fromBase: v => v / 0.946353 },
    cup: { name: "Cup", toBase: v => v * 0.236588, fromBase: v => v / 0.236588 },
  },
  area: {
    sqmeter: { name: "Square Meter (m²)", toBase: v => v, fromBase: v => v },
    sqkilometer: { name: "Square Kilometer (km²)", toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    sqmile: { name: "Square Mile (mi²)", toBase: v => v * 2.59e6, fromBase: v => v / 2.59e6 },
    sqfoot: { name: "Square Foot (ft²)", toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
    acre: { name: "Acre", toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
    hectare: { name: "Hectare (ha)", toBase: v => v * 10000, fromBase: v => v / 10000 },
  },
};
export function convertUnit(category: UnitCategory, value: number, fromUnit: string, toUnit: string): number {
  const defs = unitDefs[category];
  return defs[toUnit].fromBase(defs[fromUnit].toBase(value));
}

// ============================================================
// Discount Calculator
// ============================================================
export function calcDiscount(originalPrice: number, discountPercent: number): {
  discountAmount: number; finalPrice: number; savingsPercent: number;
} {
  const discount = originalPrice * (discountPercent / 100);
  const final = originalPrice - discount;
  return {
    discountAmount: Math.round(discount * 100) / 100,
    finalPrice: Math.round(final * 100) / 100,
    savingsPercent: Math.round(discountPercent * 100) / 100,
  };
}

// ============================================================
// 2. Tip Calculator
// ============================================================
export function calcTip(bill: number, tipPercent: number, people: number = 1): {
  tipAmount: number; total: number; perPerson: number;
} {
  const tip = bill * (tipPercent / 100);
  const total = bill + tip;
  return { tipAmount: Math.round(tip * 100) / 100, total: Math.round(total * 100) / 100, perPerson: Math.round(total / people * 100) / 100 };
}

// ============================================================
// 3. Loan Calculator (Monthly payment using amortization)
// ============================================================
export function calcLoan(amount: number, annualRate: number, termYears: number): {
  monthly: number; total: number; totalInterest: number;
} {
  const monthlyRate = annualRate / 100 / 12;
  const n = termYears * 12;
  if (monthlyRate === 0) return { monthly: amount / n, total: amount, totalInterest: 0 };
  const monthly = amount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const total = monthly * n;
  return { monthly: Math.round(monthly * 100) / 100, total: Math.round(total * 100) / 100, totalInterest: Math.round((total - amount) * 100) / 100 };
}

// ============================================================
// 4. Average Calculator
// ============================================================
export function calcAverage(nums: number[]): { sum: number; count: number; mean: number; median: number; min: number; max: number } {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return { sum: nums.reduce((a, b) => a + b, 0), count: nums.length, mean: nums.reduce((a, b) => a + b, 0) / nums.length, median, min: Math.min(...nums), max: Math.max(...nums) };
}

// ============================================================
// 5. Time Zone Converter
// ============================================================
export const timezones: Record<string, { name: string; offset: number }> = {
  "UTC-12": { name: "Baker Island (UTC-12)", offset: -12 },
  "UTC-11": { name: "American Samoa (UTC-11)", offset: -11 },
  "UTC-10": { name: "Hawaii (UTC-10)", offset: -10 },
  "UTC-9": { name: "Alaska (UTC-9)", offset: -9 },
  "UTC-8": { name: "Pacific Time (UTC-8)", offset: -8 },
  "UTC-7": { name: "Mountain Time (UTC-7)", offset: -7 },
  "UTC-6": { name: "Central Time (UTC-6)", offset: -6 },
  "UTC-5": { name: "Eastern Time (UTC-5)", offset: -5 },
  "UTC-4": { name: "Atlantic Time (UTC-4)", offset: -4 },
  "UTC-3": { name: "Brazil (UTC-3)", offset: -3 },
  "UTC+0": { name: "London (UTC+0)", offset: 0 },
  "UTC+1": { name: "Berlin/Paris (UTC+1)", offset: 1 },
  "UTC+2": { name: "Eastern Europe (UTC+2)", offset: 2 },
  "UTC+3": { name: "Moscow (UTC+3)", offset: 3 },
  "UTC+5:30": { name: "India (UTC+5:30)", offset: 5.5 },
  "UTC+8": { name: "China/Beijing (UTC+8)", offset: 8 },
  "UTC+9": { name: "Japan/Korea (UTC+9)", offset: 9 },
  "UTC+10": { name: "Sydney (UTC+10)", offset: 10 },
  "UTC+12": { name: "New Zealand (UTC+12)", offset: 12 },
};
export function convertTimezone(date: Date, fromOffset: number, toOffset: number): Date {
  const utc = date.getTime() - fromOffset * 3600000;
  return new Date(utc + toOffset * 3600000);
}

// ============================================================
// 6. Currency Converter (mocked — use ExchangeRate-API in prod)
// ============================================================
export const currencyRates: Record<string, { name: string; rate: number }> = {
  USD: { name: "US Dollar ($)", rate: 1 },
  EUR: { name: "Euro (€)", rate: 0.85 },
  GBP: { name: "British Pound (£)", rate: 0.73 },
  JPY: { name: "Japanese Yen (¥)", rate: 110 },
  CNY: { name: "Chinese Yuan (¥)", rate: 6.45 },
  KRW: { name: "Korean Won (₩)", rate: 1200 },
  INR: { name: "Indian Rupee (₹)", rate: 74 },
  CAD: { name: "Canadian Dollar (C$)", rate: 1.25 },
  AUD: { name: "Australian Dollar (A$)", rate: 1.35 },
  CHF: { name: "Swiss Franc (Fr)", rate: 0.92 },
  MXN: { name: "Mexican Peso (MX$)", rate: 20 },
  BRL: { name: "Brazilian Real (R$)", rate: 5.2 },
};
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const from = currencyRates[fromCurrency]?.rate || 1;
  const to = currencyRates[toCurrency]?.rate || 1;
  return Math.round((amount / from) * to * 100) / 100;
}

// ============================================================
// 7. Roman Numeral Converter
// ============================================================
export function toRoman(num: number): string {
  if (num < 1 || num > 3999) return "";
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  return result;
}
export function fromRoman(s: string): number {
  const map: Record<string, number> = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]] || 0;
    const next = map[s[i + 1]] || 0;
    result += cur < next ? -cur : cur;
  }
  return result;
}

// ============================================================
// 8. Number Base Converter (Binary/Hex/Decimal/Octal)
// ============================================================
export type Base = 2 | 8 | 10 | 16;
const basePrefix: Record<Base, string> = { 2: "0b", 8: "0o", 10: "", 16: "0x" };
export function convertBase(value: string, from: Base, to: Base): string {
  const num = parseInt(value.replace(/^0[xbo]/i, ""), from);
  if (isNaN(num)) return "";
  return (basePrefix[to] + num.toString(to)).replace(/^0[xbo](?!.)/i, (m) => m + "0");
}

// ============================================================
// 9. Password Generator
// ============================================================
export function generatePassword(length: number, opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }): string {
  const pools: Record<string, string> = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };
  let chars = "";
  for (const [k, v] of Object.entries(opts)) { if (v) chars += pools[k]; }
  if (!chars) chars = pools.lower + pools.numbers;
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ============================================================
// 10. Lorem Ipsum Generator
// ============================================================
const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");
export function generateLorem(paragraphs: number, wordsPerPara: number): string {
  const result: string[] = [];
  for (let p = 0; p < paragraphs; p++) {
    const words: string[] = [];
    for (let w = 0; w < wordsPerPara; w++) {
      const word = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
      words.push(w === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    result.push(words.join(" ") + ".");
  }
  return result.join("\n\n");
}

// ============================================================
// 11. Case Converter
// ============================================================
export type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "kebab" | "snake";
export function convertCase(text: string, type: CaseType): string {
  switch (type) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case "sentence": return text.replace(/(^\w|\.\s+\w)/g, m => m.toUpperCase()).replace(/([.!?])\s*([a-z])/g, (_, p, c) => p + " " + c.toUpperCase());
    case "camel": return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
    case "kebab": return text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
    case "snake": return text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
    default: return text;
  }
}

// ============================================================
// 12. URL Encoder/Decoder
// ============================================================
export function urlEncode(text: string): string { return encodeURIComponent(text); }
export function urlDecode(text: string): string { return decodeURIComponent(text); }

// ============================================================
// 13. Calorie Calculator (Mifflin-St Jeor formula)
// ============================================================
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
const activityMultipliers: Record<ActivityLevel, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
export function calcCalories(weightKg: number, heightCm: number, age: number, gender: "male" | "female", activity: ActivityLevel): { bmr: number; tdee: number } {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr += gender === "male" ? 5 : -161;
  return { bmr: Math.round(bmr), tdee: Math.round(bmr * activityMultipliers[activity]) };
}

// ============================================================
// 14. Due Date Calculator (pregnancy, Naegele's rule)
// ============================================================
export function calcDueDate(lmpDate: Date): { dueDate: Date; weeks: number; trimester: string } {
  const due = new Date(lmpDate);
  due.setDate(due.getDate() + 280);
  const today = new Date();
  const diffWeeks = Math.floor((today.getTime() - lmpDate.getTime()) / (7 * 86400000));
  let trimester = "first";
  if (diffWeeks >= 14) trimester = "second";
  if (diffWeeks >= 28) trimester = "third";
  return { dueDate: due, weeks: diffWeeks, trimester };
}

// ============================================================
// 15. Date Difference Calculator
// ============================================================
export function dateDiff(d1: Date, d2: Date): { days: number; weeks: number; months: number; years: number } {
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  const days = Math.floor(diffMs / 86400000);
  const weeks = Math.floor(days / 7);
  const months = (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth();
  return { days, weeks, months: Math.abs(months), years: Math.floor(Math.abs(months) / 12) };
}
