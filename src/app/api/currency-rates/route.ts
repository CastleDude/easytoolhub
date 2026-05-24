import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "src/data/currency-rate-cache.json");
const FRANKFURTER_URL = "https://api.frankfurter.app/latest?from=USD";

interface CacheEntry {
  date: string;
  rates: Record<string, number>;
}

async function fetchRates(): Promise<CacheEntry> {
  const res = await fetch(FRANKFURTER_URL);
  if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);
  const data = await res.json();
  return {
    date: data.date,
    rates: data.rates,
  };
}

function readCache(): CacheEntry | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

function writeCache(entry: CacheEntry): void {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(entry, null, 2), "utf-8");
}

export async function GET() {
  try {
    const cached = readCache();
    const today = new Date().toISOString().slice(0, 10);

    if (cached && cached.date === today) {
      return NextResponse.json({
        success: true,
        date: cached.date,
        rates: cached.rates,
        cached: true,
      });
    }

    const fresh = await fetchRates();
    writeCache(fresh);

    return NextResponse.json({
      success: true,
      date: fresh.date,
      rates: fresh.rates,
      cached: false,
    });
  } catch {
    // Fallback: return cached rates even if stale, or hardcoded rates as last resort
    const cached = readCache();
    if (cached) {
      return NextResponse.json({
        success: true,
        date: cached.date,
        rates: cached.rates,
        cached: true,
        stale: true,
      });
    }

    // Last resort: hardcoded rates
    return NextResponse.json({
      success: true,
      date: "2026-01-01",
      rates: {
        AUD: 1.35, BRL: 5.2, CAD: 1.25, CHF: 0.92, CNY: 6.45,
        EUR: 0.85, GBP: 0.73, INR: 74, JPY: 110, KRW: 1200,
        MXN: 20,
      },
      cached: false,
      fallback: true,
    });
  }
}
