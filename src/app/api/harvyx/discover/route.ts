import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const SERPER_KEY = process.env.SERPER_API_KEY || '';

type Lead = Record<string, any>;

function domainFromUrl(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Google Places: Text Search → then Place Details for phone/website on the top results. */
async function discoverPlaces(query: string, max: number): Promise<Lead[]> {
  if (!PLACES_KEY) return [];
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${PLACES_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Places ${res.status}`);
  const data = await res.json();
  if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places: ${data.status} ${data.error_message || ''}`);
  }
  const results = (data.results || []).slice(0, max);

  // Fetch details (phone + website) in parallel for the shown results.
  const detailed = await Promise.all(
    results.map(async (r: any) => {
      let phone = '';
      let website = '';
      try {
        const dUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${r.place_id}&fields=formatted_phone_number,international_phone_number,website&key=${PLACES_KEY}`;
        const dRes = await fetch(dUrl);
        const dJson = await dRes.json();
        const res2 = dJson.result || {};
        phone = res2.international_phone_number || res2.formatted_phone_number || '';
        website = res2.website || '';
      } catch {
        /* details optional */
      }
      const company = r.name || '';
      const website2 = website || '';
      const domain = domainFromUrl(website2);
      return {
        id: `live_places_${r.place_id}`,
        source: 'google_places',
        sourceFile: 'live',
        company,
        contactName: '',
        title: '',
        email: '',
        phone,
        linkedin: '',
        website: website2,
        domain,
        country: '',
        city: r.formatted_address || '',
        segment: (r.types || []).slice(0, 2).join(', '),
        tags: ['live', 'places'],
        status: 'new',
        score: Math.round((r.rating || 0) * 18) || 40,
        rating: r.rating || null,
        live: true,
      } as Lead;
    }),
  );
  return detailed;
}

/** Serper (Google web search) fallback for company website discovery. */
async function discoverSerper(query: string, max: number): Promise<Lead[]> {
  if (!SERPER_KEY) return [];
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: max }),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}`);
  const data = await res.json();
  return (data.organic || []).slice(0, max).map((o: any, i: number) => {
    const domain = domainFromUrl(o.link);
    return {
      id: `live_serper_${i}_${domain}`,
      source: 'serper',
      sourceFile: 'live',
      company: o.title || domain,
      contactName: '',
      title: '',
      email: '',
      phone: '',
      linkedin: o.link?.includes('linkedin.com') ? o.link : '',
      website: o.link || '',
      domain,
      country: '',
      city: '',
      segment: '',
      tags: ['live', 'web'],
      status: 'new',
      score: 45,
      snippet: o.snippet || '',
      live: true,
    } as Lead;
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const provider = (searchParams.get('provider') || 'places').toLowerCase();
  const max = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10) || 10, 1), 20);

  if (!q) return NextResponse.json({ error: 'Missing query (q).' }, { status: 400 });

  try {
    let leads: Lead[] = [];
    let used = provider;
    if (provider === 'web' || provider === 'serper') {
      leads = await discoverSerper(q, max);
    } else {
      leads = await discoverPlaces(q, max);
      if (!leads.length && SERPER_KEY) {
        used = 'serper';
        leads = await discoverSerper(q, max);
      }
    }
    return NextResponse.json({ leads, total: leads.length, provider: used, live: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
