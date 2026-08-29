/**
 * In-memory daily usage counters (per isolate). Good enough for ops caps on CF;
 * resets on deploy / cold start — intentional soft gate for Phase 4a.
 */

type Bucket = { day: string; sends: number; enrich: number };

const g = globalThis as unknown as { __harvyxUsage?: Map<string, Bucket> };

function store(): Map<string, Bucket> {
  if (!g.__harvyxUsage) g.__harvyxUsage = new Map();
  return g.__harvyxUsage;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function bucket(orgId: string): Bucket {
  const key = orgId || 'harvics';
  const map = store();
  const day = today();
  const cur = map.get(key);
  if (!cur || cur.day !== day) {
    const fresh = { day, sends: 0, enrich: 0 };
    map.set(key, fresh);
    return fresh;
  }
  return cur;
}

export function getUsage(orgId: string) {
  const b = bucket(orgId);
  return { day: b.day, sends: b.sends, enrich: b.enrich };
}

export function recordSends(orgId: string, n: number) {
  const b = bucket(orgId);
  b.sends += Math.max(0, n);
  return b.sends;
}

export function recordEnrich(orgId: string, n: number) {
  const b = bucket(orgId);
  b.enrich += Math.max(0, n);
  return b.enrich;
}

export function assertSendBudget(orgId: string, want: number, cap: number): string | null {
  const b = bucket(orgId);
  if (b.sends + want > cap) {
    return `Daily send cap reached (${b.sends}/${cap}). Try tomorrow or raise HARVYX_DAILY_SEND_CAP.`;
  }
  return null;
}

export function assertEnrichBudget(orgId: string, want: number, cap: number): string | null {
  const b = bucket(orgId);
  if (b.enrich + want > cap) {
    return `Daily enrich cap reached (${b.enrich}/${cap}). Try tomorrow or raise HARVYX_DAILY_ENRICH_CAP.`;
  }
  return null;
}
