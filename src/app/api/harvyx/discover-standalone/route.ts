/**
 * POST /api/harvyx/discover-standalone
 *
 * Completely isolated B2B discovery endpoint.  Does NOT touch any existing
 * /api/harvyx/discover logic, D1 database, lead store, or outreach pipeline.
 *
 * Powered by TinyFish Search + Fetch APIs.
 * Safe on Cloudflare Edge (no Node.js fs / child_process / heavy deps).
 *
 * Request body:
 *   { niche: string, location: string, topN?: number }
 *
 * Response:
 *   {
 *     ok: true,
 *     niche, location, query,
 *     searchHits: TinyFishSearchResult[],
 *     fetchedPages: { url, title, description, text }[],
 *     markdown: string,    // combined clean text — ready for LLM / display
 *     latencyMs: number
 *   }
 */

import { NextRequest, NextResponse } from 'next/server'
import { TinyFishProspector } from '@/lib/harvyx/tinyFishProspector'

// Node.js runtime — compatible with OpenNext/Cloudflare deployment.
// Uses only global fetch, no Node builtins, so fully edge-safe in behaviour.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const t0 = Date.now()

  // ── Parse & validate body ──────────────────────────────────────────────────
  let body: { niche?: string; location?: string; topN?: number } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const niche    = (body.niche    || '').trim()
  const location = (body.location || '').trim()
  const topN     = Math.min(Math.max(Number(body.topN) || 2, 1), 5)

  if (!niche || !location) {
    return NextResponse.json(
      { ok: false, error: '`niche` and `location` are required fields.' },
      { status: 400 }
    )
  }

  // ── Auth check (same cookie/header guard used by all harvyx routes) ─────────
  // Inline check here so this file has zero imports from the existing stack.
  const apiKey = req.headers.get('x-internal-api-key') || ''
  const cookieVal = req.cookies.get('harvyx_ops')?.value || ''
  const accessCode = (process.env.HARVYX_ACCESS_CODE || '').trim()
  const tinyFishKey = process.env.TINYFISH_API_KEY || ''

  if (!tinyFishKey) {
    return NextResponse.json(
      { ok: false, error: 'TINYFISH_API_KEY is not configured on this environment.' },
      { status: 500 }
    )
  }

  // If access control is enabled, require either the cookie token or the
  // internal API key — same policy as other harvyx routes.
  if (accessCode) {
    const hasInternalKey = apiKey && apiKey === process.env.HARVYX_INTERNAL_API_KEY
    const hasCookie = cookieVal.length > 0
    if (!hasInternalKey && !hasCookie) {
      return NextResponse.json(
        { ok: false, error: 'Access denied. Authentication required.' },
        { status: 401 }
      )
    }
  }

  // ── Run discovery ──────────────────────────────────────────────────────────
  try {
    const prospector = new TinyFishProspector(tinyFishKey)
    const result = await prospector.discover(niche, location, topN)

    return NextResponse.json({
      ok: true,
      niche:        result.niche,
      location:     result.location,
      query:        result.query,
      leads:        result.leads,          // structured: company, email, phone, etc.
      chatOutput:   result.chatOutput,     // formatted ready-to-display chat reply
      searchHits:   result.searchHits,
      fetchedPages: result.fetchedPages.map((p) => ({
        url:         p.final_url,
        title:       p.title,
        description: p.description,
        text:        p.text,
      })),
      markdown:  result.markdown,
      latencyMs: Date.now() - t0,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[discover-standalone]', message)
    return NextResponse.json(
      { ok: false, error: 'Discovery failed.', detail: message },
      { status: 500 }
    )
  }
}

// ── GET: quick health / capability check ──────────────────────────────────────
export async function GET() {
  const configured = Boolean(process.env.TINYFISH_API_KEY)
  return NextResponse.json({
    endpoint: '/api/harvyx/discover-standalone',
    status:   configured ? 'ready' : 'unconfigured',
    requires: configured ? [] : ['TINYFISH_API_KEY'],
    usage: {
      method:      'POST',
      contentType: 'application/json',
      body: {
        niche:    'string  (required) — e.g. "denim fabric importer"',
        location: 'string  (required) — e.g. "Warsaw Poland"',
        topN:     'number  (optional, 1–5, default 2) — pages to fetch',
      },
    },
  })
}
