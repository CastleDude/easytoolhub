"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { enUS, zhCN, es, fr, de, ja, ko, ru } from "date-fns/locale";
import { format } from "date-fns";
import "react-day-picker/style.css";

const localeMap: Record<string, typeof enUS> = {
  en: enUS,
  zh: zhCN,
  es: es,
  fr: fr,
  de: de,
  ja: ja,
  ko: ko,
  ru: ru,
};

const formatMap: Record<string, string> = {
  en: "MM/dd/yyyy",
  zh: "yyyy-MM-dd",
  es: "dd/MM/yyyy",
  fr: "dd/MM/yyyy",
  de: "dd.MM.yyyy",
  ja: "yyyy/MM/dd",
  ko: "yyyy-MM-dd",
  ru: "dd.MM.yyyy",
};

interface DatePickerInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  locale: string;
  placeholder?: string;
  min?: Date;
  max?: Date;
  className?: string;
  id?: string;
}

export default function DatePickerInput({
  value,
  onChange,
  locale,
  placeholder,
  min,
  max,
  className = "",
  id,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const dpLocale = localeMap[locale] || enUS;
  const fmt = formatMap[locale] || "yyyy-MM-dd";

  // Sync input display with value
  useEffect(() => {
    if (value) {
      setInputValue(format(value, fmt, { locale: dpLocale }));
    } else {
      setInputValue("");
    }
  }, [value, fmt, dpLocale]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleInputBlur() {
    if (!inputValue.trim()) {
      onChange(undefined);
      return;
    }
    // Try to parse the manually typed date
    const parsed = new Date(inputValue);
    if (!isNaN(parsed.getTime())) {
      if (min && parsed < min) { onChange(min); return; }
      if (max && parsed > max) { onChange(max); return; }
      onChange(parsed);
    } else {
      // Reset to current value if parse fails
      if (value) {
        setInputValue(format(value, fmt, { locale: dpLocale }));
      } else {
        setInputValue("");
      }
    }
  }

  function handleDaySelect(date: Date | undefined) {
    onChange(date);
    setOpen(false);
  }

  function handleInputFocus() {
    setOpen(true);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder || fmt}
        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all cursor-pointer"
      />
      {open && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleDaySelect}
            locale={dpLocale}
            disabled={[
              ...(min ? [{ before: min }] : []),
              ...(max ? [{ after: max }] : []),
            ]}
            captionLayout="dropdown"
            defaultMonth={value || new Date()}
            weekStartsOn={locale === "en" ? 0 : 1}
          />
        </div>
      )}
    </div>
  );
}
