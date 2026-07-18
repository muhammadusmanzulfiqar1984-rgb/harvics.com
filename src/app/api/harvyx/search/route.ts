import { NextRequest, NextResponse } from 'next/server';
import { searchAllDataBanks } from '@/lib/harvyx/leadSearch';

export const dynamic = 'force-dynamic';

/** Unified search across all HarvyX data banks + live APIs. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ error: 'Missing query (q).' }, { status: 400 });

  const includeLive = req.nextUrl.searchParams.get('live') !== '0';
  const result = await searchAllDataBanks(q, { includeLive });

  return NextResponse.json(result);
}
