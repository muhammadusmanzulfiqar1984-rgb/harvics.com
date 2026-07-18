import { NextResponse } from 'next/server';

const PB_KEY = process.env.PHANTOMBUSTER_API_KEY || '';
const PB_BASE = 'https://api.phantombuster.com/api/v2';
const DEFAULT_AGENT_ID = process.env.PHANTOMBUSTER_AGENT_ID || '';

function configured() {
  return Boolean(PB_KEY);
}

/** GET — status + available LinkedIn phantoms catalog */
export async function GET() {
  return NextResponse.json({
    configured: configured(),
    agentIdSet: Boolean(DEFAULT_AGENT_ID),
    phantoms: [
      {
        id: 'linkedin-profile-scraper',
        label: 'LinkedIn Profile Scraper',
        description: 'Scrape profile → name, title, company, location into HarvyX',
      },
      {
        id: 'linkedin-sales-nav-export',
        label: 'Sales Navigator Export',
        description: 'Export search results / lead lists from Sales Nav',
      },
      {
        id: 'linkedin-auto-connect',
        label: 'Auto Connect',
        description: 'Send connection requests with optional note',
      },
      {
        id: 'linkedin-message-sender',
        label: 'Message Sender',
        description: 'Send LinkedIn DMs to enriched leads',
      },
      {
        id: 'linkedin-company-employees',
        label: 'Company Employees',
        description: 'Pull decision-makers from a company LinkedIn page',
      },
    ],
    hint: configured()
      ? 'PhantomBuster key detected. Launch with agentId + argument (LinkedIn URL or search).'
      : 'Add PHANTOMBUSTER_API_KEY (and optional PHANTOMBUSTER_AGENT_ID) to .env.local',
  });
}

/**
 * POST — launch a PhantomBuster agent
 * body: { agentId?: string, argument?: string | object, phantom?: string, linkedinUrl?: string }
 */
export async function POST(req: Request) {
  try {
    if (!configured()) {
      return NextResponse.json(
        {
          error: 'PHANTOMBUSTER_API_KEY not configured',
          hint: 'Add PHANTOMBUSTER_API_KEY to .env.local, then restart Next.',
        },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const agentId = String(body.agentId || DEFAULT_AGENT_ID || '').trim();
    if (!agentId) {
      return NextResponse.json(
        {
          error: 'agentId required',
          hint: 'Pass agentId from your PhantomBuster dashboard, or set PHANTOMBUSTER_AGENT_ID.',
        },
        { status: 400 },
      );
    }

    const argument =
      body.argument ??
      (body.linkedinUrl
        ? { spreadsheetUrl: body.linkedinUrl, sessionCookie: body.sessionCookie || '' }
        : undefined);

    const launchRes = await fetch(`${PB_BASE}/agents/launch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Phantombuster-Key-1': PB_KEY,
      },
      body: JSON.stringify({
        id: agentId,
        argument: typeof argument === 'string' ? argument : argument ? JSON.stringify(argument) : undefined,
      }),
    });

    const data = await launchRes.json().catch(() => ({}));
    if (!launchRes.ok) {
      return NextResponse.json(
        { error: 'PhantomBuster launch failed', detail: data },
        { status: launchRes.status },
      );
    }

    return NextResponse.json({
      ok: true,
      phantom: body.phantom || 'custom',
      containerId: data.containerId || data.id || null,
      raw: data,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
