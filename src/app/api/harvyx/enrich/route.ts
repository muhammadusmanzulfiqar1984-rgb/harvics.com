import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const HUNTER_KEY = process.env.HUNTER_API_KEY || '';

function domainFrom(website?: string, email?: string): string {
  if (website) {
    try {
      return new URL(website.startsWith('http') ? website : `https://${website}`).hostname.replace(/^www\./, '');
    } catch {
      return website.replace(/^www\./, '').split('/')[0];
    }
  }
  if (email && email.includes('@')) return email.split('@')[1];
  return '';
}

/**
 * POST — enrich a lead with a real email via Hunter.io
 * body: { company?, website?, domain?, contactName?, firstName?, lastName?, email? }
 */
export async function POST(req: Request) {
  try {
    if (!HUNTER_KEY) {
      return NextResponse.json({ error: 'HUNTER_API_KEY not configured.' }, { status: 500 });
    }
    const b = await req.json();
    const domain = (b.domain || domainFrom(b.website, b.email)).trim();
    if (!domain) {
      return NextResponse.json(
        { error: 'Need a website or domain to enrich (lead has no website).' },
        { status: 400 },
      );
    }

    // Split contactName into first/last if not provided explicitly.
    let firstName = (b.firstName || '').trim();
    let lastName = (b.lastName || '').trim();
    if (!firstName && b.contactName) {
      const parts = String(b.contactName).trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    // If we know the person's name → use email-finder for a precise match.
    if (firstName && lastName) {
      const url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${HUNTER_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.data?.email) {
        return NextResponse.json({
          ok: true,
          method: 'email-finder',
          domain,
          email: json.data.email,
          confidence: json.data.score ?? null,
          phone: json.data.phone_number || '',
          position: json.data.position || '',
          linkedin: json.data.linkedin_url || '',
        });
      }
      // fall through to domain-search if no precise match
    }

    // Otherwise → domain-search returns the best-known contacts at the company.
    const dsUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&limit=5&api_key=${HUNTER_KEY}`;
    const dsRes = await fetch(dsUrl);
    const dsJson = await dsRes.json();
    if (!dsRes.ok) {
      return NextResponse.json(
        { error: `Hunter ${dsRes.status}: ${dsJson?.errors?.[0]?.details || 'lookup failed'}` },
        { status: dsRes.status },
      );
    }
    const emails = (dsJson.data?.emails || []).map((e: any) => ({
      email: e.value,
      firstName: e.first_name,
      lastName: e.last_name,
      position: e.position,
      confidence: e.confidence,
      phone: e.phone_number || '',
      linkedin: e.linkedin || '',
    }));

    if (!emails.length) {
      return NextResponse.json({ ok: false, domain, message: 'No emails found for this domain.', emails: [] });
    }

    // Prefer decision-maker-ish positions, else highest confidence.
    const ranked = [...emails].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    const best = ranked[0];
    return NextResponse.json({
      ok: true,
      method: 'domain-search',
      domain,
      email: best.email,
      confidence: best.confidence ?? null,
      phone: best.phone || '',
      position: best.position || '',
      linkedin: best.linkedin || '',
      contactName: [best.firstName, best.lastName].filter(Boolean).join(' '),
      emails: ranked,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
