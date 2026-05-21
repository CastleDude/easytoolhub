"use client";
import ToolClickTracker from "@/components/admin/ToolClickTracker";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { convertUnit, unitDefs, type UnitCategory } from "@/lib/tools";

const categories: { key: UnitCategory; labelKey: string }[] = [
  { key: "length", labelKey: "length" },
  { key: "weight", labelKey: "weight" },
  { key: "temperature", labelKey: "temperature" },
  { key: "volume", labelKey: "volume" },
  { key: "area", labelKey: "area" },
];

export default function UnitConverterPage() {
  const t = useTranslations("Tools.unitConverter");
  const tc = useTranslations("Categories");
  const tu = useTranslations("Units");
  const [category, setCategory] = useState<UnitCategory>("length");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("foot");
  const [result, setResult] = useState<number | null>(null);

  const units = Object.entries(unitDefs[category]);

  function convert() {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    setResult(convertUnit(category, v, fromUnit, toUnit));
  }

  function handleCategoryChange(cat: UnitCategory) {
    setCategory(cat);
    const keys = Object.keys(unitDefs[cat]);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
    setResult(null);
  }

  const fromUnitDisplay = tu(fromUnit as any);
  const toUnitDisplay = tu(toUnit as any);

  return (
    <div className="container-main py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("subtitle")}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat.key
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tc(cat.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("value")}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("value")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("from")}</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {units.map(([key]) => (
              <option key={key} value={key}>
                {tu(key as any)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <button
            onClick={() => {
              const tmp = fromUnit;
              setFromUnit(toUnit);
              setToUnit(tmp);
            }}
            className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg"
            aria-label={t("swap")}
          >
            ⇄
          </button>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("to")}</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {units.map(([key]) => (
              <option key={key} value={key}>
                {tu(key as any)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={convert}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t("convert")}
      </button>

      {result !== null && (
        <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-950 rounded-xl text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("result")}</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {value} {fromUnitDisplay.split(" ")[0]} ={" "}
            {parseFloat(result.toFixed(6))}{" "}
            {toUnitDisplay.split(" ")[0]}
          </p>
        </div>
      )}

      <div className="mt-16 prose dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-3">
          {t("commonConversions", { category: tc(categories.find((c) => c.key === category)!.labelKey) })}
        </h2>
        <ConversionTable category={category} tu={tu} />
      </div>
      <ToolClickTracker toolSlug="unit-converter" />
      <FeedbackWidget toolSlug="unit-converter" />
    </div>
  );
}

function ConversionTable({ category, tu }: { category: UnitCategory; tu: Function }) {
  const refs: Record<UnitCategory, string[]> = {
    length: [
      `1 ${tu("inch")} = 2.54 ${tu("centimeter")}`,
      `1 ${tu("foot")} = 0.3048 ${tu("meter")}`,
      `1 ${tu("mile")} = 1.60934 ${tu("kilometer")}`,
      `1 ${tu("meter")} = 3.28084 ${tu("foot")}`,
      `1 ${tu("kilometer")} = 0.621371 ${tu("mile")}`,
    ],
    weight: [
      `1 ${tu("pound")} = 0.453592 ${tu("kilogram")}`,
      `1 ${tu("kilogram")} = 2.20462 ${tu("pound")}`,
      `1 ${tu("ounce")} = 28.3495 ${tu("gram")}`,
      `1 ${tu("stone")} = 6.35029 ${tu("kilogram")}`,
    ],
    temperature: [
      `0${tu("celsius").split(" ")[0].slice(0, 2)} = 32${tu("fahrenheit").split(" ")[0].slice(0, 2)}`,
      `100${tu("celsius").split(" ")[0].slice(0, 2)} = 212${tu("fahrenheit").split(" ")[0].slice(0, 2)}`,
      `37${tu("celsius").split(" ")[0].slice(0, 2)} = 98.6${tu("fahrenheit").split(" ")[0].slice(0, 2)}`,
      `0${tu("kelvin").split(" ")[0].slice(0, 2)} = -273.15${tu("celsius").split(" ")[0].slice(0, 2)}`,
    ],
    volume: [
      `1 ${tu("gallon")} = 3.78541 ${tu("liter")}`,
      `1 ${tu("liter")} = 0.264172 ${tu("gallon")}`,
      `1 ${tu("cup")} = 236.588 ${tu("milliliter")}`,
      `1 ${tu("quart")} = 0.946353 ${tu("liter")}`,
    ],
    area: [
      `1 ${tu("sqfoot")} = 0.092903 ${tu("sqmeter")}`,
      `1 ${tu("acre")} = 4,046.86 ${tu("sqmeter")}`,
      `1 ${tu("hectare")} = 10,000 ${tu("sqmeter")}`,
      `1 ${tu("sqmile")} = 2.59 ${tu("sqkilometer")}`,
    ],
  };

  return (
    <ul className="text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
      {refs[category].map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  );
}
