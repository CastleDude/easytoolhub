import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/db";

interface ApiTestResultItem {
  key: string;
  name: string;
  url: string;
  status: number | null;
  duration: number;
  ok: boolean;
}

interface ApiTestRecord {
  id: number;
  testedAt: string;
  results: ApiTestResultItem[];
}

// POST - save test results
export async function POST(req: NextRequest) {
  const body = await req.json();
  const results: ApiTestResultItem[] = body.results;
  if (!Array.isArray(results)) {
    return NextResponse.json({ error: "results array required" }, { status: 400 });
  }

  const records = readStore<ApiTestRecord>("api-test-results");
  const record: ApiTestRecord = {
    id: records.length + 1,
    testedAt: new Date().toISOString(),
    results,
  };
  records.push(record);

  // Keep only the latest 50 records
  while (records.length > 50) records.shift();

  await writeStore("api-test-results", records);
  return NextResponse.json({ ok: true, record });
}

// GET - retrieve latest test results
export async function GET() {
  const records = readStore<ApiTestRecord>("api-test-results");
  const latest = records.length > 0 ? records[records.length - 1] : null;
  return NextResponse.json({ latest, total: records.length });
}
