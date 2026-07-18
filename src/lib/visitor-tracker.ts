import fs from "fs";
import path from "path";

const STORE_FILE = path.join(process.cwd(), "src/data/visitors.json");

export interface VisitorSession {
  id: string;
  ip: string;
  country: string;
  device: string;       // Mobile / Tablet / Desktop
  firstVisit: string;  // Beijing time ISO
  lastVisit: string;   // Beijing time ISO
  duration: number;     // seconds
  pageCount: number;
}

function readStore(): VisitorSession[] {
  try {
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function writeStore(data: VisitorSession[]): void {
  const dir = path.dirname(STORE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function beijingTime(): string {
  const now = new Date();
  // Format as ISO with +08:00
  const bj = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return bj.toISOString().replace("Z", "+08:00");
}

function countryFromIP(ip: string): string {
  // Simple mapping for common IPs; in production use a geo-IP service
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return "Local";
  }
  return "Unknown";
}

function detectDevice(userAgent: string): string {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();
  if (/iphone|android.*mobile|webos|blackberry|iemobile|opera mini/.test(ua)) return "Mobile";
  if (/ipad|android(?!.*mobile)|tablet/.test(ua)) return "Tablet";
  return "Desktop";
}

export function recordVisit(
  sessionId: string,
  ip: string,
  countryHeader: string | null,
  pageCount: number,
  userAgent: string
): VisitorSession {
  const sessions = readStore();
  const now = beijingTime();

  // Country priority: header > IP lookup
  const country = countryHeader || countryFromIP(ip);

  const existing = sessions.find((s) => s.id === sessionId);
  if (existing) {
    existing.lastVisit = now;
    existing.pageCount = Math.max(existing.pageCount, pageCount);
    existing.country = existing.country === "Unknown" ? country : existing.country;
    // Calculate duration from first to last visit
    const first = new Date(existing.firstVisit.replace("+08:00", "Z"));
    const last = new Date(now.replace("+08:00", "Z"));
    existing.duration = Math.floor((last.getTime() - first.getTime()) / 1000);
    writeStore(sessions);
    return existing;
  }

  const session: VisitorSession = {
    id: sessionId,
    ip,
    country,
    device: detectDevice(userAgent),
    firstVisit: now,
    lastVisit: now,
    duration: 0,
    pageCount,
  };

  // Keep max 500 sessions
  sessions.push(session);
  if (sessions.length > 500) {
    sessions.splice(0, sessions.length - 500);
  }

  writeStore(sessions);
  return session;
}

export function getVisitors(): VisitorSession[] {
  return readStore()
    .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
}

export function clearVisitors(): void {
  writeStore([]);
}
