import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readStore<T>(name: string): T[] {
  ensureDir();
  const filePath = path.join(DATA_DIR, `${name}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as T[];
    }
  } catch {}
  return [];
}

export async function writeStore<T>(name: string, data: T[]) {
  ensureDir();
  const filePath = path.join(DATA_DIR, `${name}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function nextId(name: string): number {
  const items = readStore(name);
  if (items.length === 0) return 1;
  const maxId = Math.max(...items.map((item: any) => item.id || 0));
  return maxId + 1;
}
