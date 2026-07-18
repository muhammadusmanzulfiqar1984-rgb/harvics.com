import { NextRequest, NextResponse } from 'next/server';
import { getEventLibrarySnapshot, searchLibraryCatalog } from '@/lib/harvyx/dataBanks';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const items = searchLibraryCatalog(q, 120);
  const lib = getEventLibrarySnapshot();

  return NextResponse.json({
    query: q,
    count: items.length,
    items,
    eventLibrary: lib,
    easternEuropeFairs: lib.easternEuropeFairs,
    sourceCatalogSize: items.filter((i) => i.kind === 'source').length,
  });
}
