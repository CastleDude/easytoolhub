import fs from "fs";
import path from "path";

const STORE_FILE = path.join(process.cwd(), "src/data/visitor-logs.json");
const MAX_LOGS = 10000;

export interface VisitorLog {
  id: number;
  ip: string;
  country: string;
  page: string;
  referrer: string;
  referrerSource: string;
  userAgent: string;
  browser: string;
  device: string;
  visitType: "new" | "returning" | "bot";
  firstVisit: string;   // Beijing time ISO
  lastVisit: string;    // Beijing time ISO
  pageCount: number;
  visitCount: number;
  duration: number;     // seconds
}

// ----- helpers -----

function readStore(): VisitorLog[] {
  try {
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function writeStore(data: VisitorLog[]): void {
  const dir = path.dirname(STORE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (data.length > MAX_LOGS) data = data.slice(-MAX_LOGS);
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function beijingTime(): string {
  const d = new Date();
  return new Date(d.getTime() + 8 * 3600000).toISOString().replace("Z", "+08:00");
}

const BOT_PATTERNS = /bot|crawler|spider|scraper|curl|wget|python|go-http|java/i;
const CHROME_LINUX_BOT = /Chrome\/\d+.*Linux.*(?!.*Android)/i;

function isBot(ua: string): boolean {
  if (!ua) return false;
  return BOT_PATTERNS.test(ua) || CHROME_LINUX_BOT.test(ua);
}

function detectBrowser(ua: string): string {
  if (!ua) return "Unknown";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  if (/Chrome\//.test(ua)) return "Chrome";
  return "Other";
}

function detectDevice(ua: string): string {
  if (!ua) return "Desktop";
  const u = ua.toLowerCase();
  if (/iphone|android.*mobile|blackberry|iemobile/.test(u)) return "Mobile";
  if (/ipad|android(?!.*mobile)|tablet/.test(u)) return "Tablet";
  return "Desktop";
}

function parseReferrer(ref: string): string {
  if (!ref) return "直接访问";
  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (host.includes("google")) return "Google";
    if (host.includes("bing")) return "Bing";
    if (host.includes("baidu")) return "百度";
    if (host.includes("producthunt")) return "ProductHunt";
    if (host.includes("x.com") || host.includes("twitter")) return "X/Twitter";
    if (host.includes("facebook")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("reddit")) return "Reddit";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("github")) return "GitHub";
    return host;
  } catch { return ref.substring(0, 30); }
}

// ----- public API -----

export function recordVisit(
  ip: string,
  page: string,
  country: string | null,
  referrer: string | null,
  userAgent: string | null
): void {
  const now = beijingTime();
  const ua = userAgent || "";
  const ref = referrer || "";
  const bot = isBot(ua);

  const logs = readStore();
  const maxId = logs.length > 0 ? Math.max(...logs.map((l) => l.id)) : 0;

  if (bot) {
    // Group bot visits by IP+date
    const today = now.substring(0, 10);
    const existingBot = logs.find(
      (l) => l.ip === ip && l.visitType === "bot" && l.firstVisit.startsWith(today)
    );
    if (existingBot) {
      existingBot.lastVisit = now;
      existingBot.pageCount += 1;
    } else {
      logs.push({
        id: maxId + 1, ip, country: country || "Unknown", page,
        referrer: ref, referrerSource: parseReferrer(ref),
        userAgent: ua, browser: detectBrowser(ua), device: detectDevice(ua),
        visitType: "bot", firstVisit: now, lastVisit: now,
        pageCount: 1, visitCount: 1, duration: 0,
      });
    }
    writeStore(logs);
    return;
  }

  // Human visitor: find existing session by IP in last 24h
  const cutoff = new Date(new Date(now.replace("+08:00", "Z")).getTime() - 86400000)
    .toISOString().replace("Z", "+08:00");
  const existing = logs.find(
    (l) => l.ip === ip && l.visitType !== "bot" && l.lastVisit > cutoff
  );

  if (existing) {
    existing.lastVisit = now;
    existing.pageCount += 1;
    if (existing.page !== page) {
      existing.visitCount += 1;
    }
    const first = new Date(existing.firstVisit.replace("+08:00", "Z")).getTime();
    const last = new Date(now.replace("+08:00", "Z")).getTime();
    existing.duration = Math.floor((last - first) / 1000);
    if (country && existing.country === "Unknown") existing.country = country;
  } else {
    logs.push({
      id: maxId + 1, ip, country: country || "Unknown", page,
      referrer: ref, referrerSource: parseReferrer(ref),
      userAgent: ua, browser: detectBrowser(ua), device: detectDevice(ua),
      visitType: "new",
      firstVisit: now, lastVisit: now,
      pageCount: 1, visitCount: 1, duration: 0,
    });
  }

  writeStore(logs);
}

export function getVisitors(): VisitorLog[] {
  return readStore().sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
}

export function getAggregatedVisitors(
  filters?: { ip?: string; country?: string; device?: string; visitType?: string; from?: string; to?: string },
  sort?: { field: string; order: "asc" | "desc" },
  page?: number,
  pageSize?: number
): { data: VisitorLog[]; total: number } {
  let logs = readStore();

  // Ensure all logs have the new fields (migration from old format)
  let migrated = false;
  for (const log of logs) {
    if (!log.browser) { log.browser = detectBrowser(log.userAgent || ""); migrated = true; }
    if (!log.device) { log.device = detectDevice(log.userAgent || ""); migrated = true; }
    if (!log.referrerSource) { log.referrerSource = parseReferrer(log.referrer || ""); migrated = true; }
  }
  if (migrated) writeStore(logs);

  // Filter
  if (filters?.ip) {
    logs = logs.filter((l) => l.ip.includes(filters.ip!));
  }
  if (filters?.country) {
    logs = logs.filter((l) => l.country.toLowerCase().includes(filters.country!.toLowerCase()));
  }
  if (filters?.device && filters.device !== "all") {
    logs = logs.filter((l) => l.device === filters.device);
  }
  if (filters?.visitType && filters.visitType !== "all") {
    logs = logs.filter((l) => l.visitType === filters.visitType);
  }
  if (filters?.from) {
    logs = logs.filter((l) => l.lastVisit >= filters.from!);
  }
  if (filters?.to) {
    logs = logs.filter((l) => l.lastVisit <= filters.to! + "T23:59:59+08:00");
  }

  // Sort
  const sortField = sort?.field || "lastVisit";
  const sortOrder = sort?.order || "desc";
  logs.sort((a, b) => {
    const av = (a as any)[sortField] || "";
    const bv = (b as any)[sortField] || "";
    if (typeof av === "number") return sortOrder === "desc" ? bv - av : av - bv;
    return sortOrder === "desc" ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
  });

  const total = logs.length;
  const p = page || 1;
  const ps = pageSize || 20;
  const data = logs.slice((p - 1) * ps, p * ps);

  return { data, total };
}

export function getVisitorStats() {
  const logs = readStore();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = new Date(today.getTime() + 8 * 3600000).toISOString().replace("Z", "+08:00").substring(0, 10);

  const todayLogs = logs.filter((l) => l.lastVisit.startsWith(todayStr) && l.visitType !== "bot");
  const humanLogs = logs.filter((l) => l.visitType !== "bot");

  const ips = new Set(todayLogs.map((l) => l.ip));
  const countries = new Set(todayLogs.map((l) => l.country).filter(Boolean));

  const fiveMinAgo = new Date(now.getTime() - 5 * 60000);
  const fiveMinAgoStr = new Date(fiveMinAgo.getTime() + 8 * 3600000).toISOString().replace("Z", "+08:00");
  const onlineNow = humanLogs.filter((l) => l.lastVisit >= fiveMinAgoStr).length;

  return {
    todayVisits: todayLogs.length,
    todayIPs: ips.size,
    todayCountries: countries.size,
    onlineNow,
    totalVisitors: humanLogs.length,
  };
}

export function clearVisitors(): void {
  writeStore([]);
}
