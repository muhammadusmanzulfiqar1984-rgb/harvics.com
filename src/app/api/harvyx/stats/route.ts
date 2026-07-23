// HarvyX Pipeline Stats API
// Aggregates across D1 (leads) when available

import { authenticate } from '../auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getLeadsDb(): Promise<D1Database | null> {
  try {
    const mod: any = await import('@opennextjs/cloudflare')
    const ctx = await mod.getCloudflareContext({ async: true })
    return ctx?.env?.LEADS_DB ?? null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const authError = authenticate(request)
  if (authError) return authError

  try {
    const d1 = await getLeadsDb()

    let leadStats: Record<string, number> = {}
    let topVerticals: { vertical: string; count: number }[] = []
    let totalLeads = 0

    if (d1) {
      const [statusRows, verticalRows, totalRow] = await Promise.all([
        d1.prepare('SELECT status, COUNT(*) as count FROM leads GROUP BY status').all(),
        d1
          .prepare(
            'SELECT segment as vertical, COUNT(*) as count FROM leads WHERE segment IS NOT NULL AND segment != "" GROUP BY segment ORDER BY count DESC LIMIT 5'
          )
          .all(),
        d1.prepare('SELECT COUNT(*) as total FROM leads').first<{ total: number }>(),
      ])

      leadStats = Object.fromEntries(
        (statusRows.results as any[]).map((r) => [r.status, r.count])
      )
      topVerticals = (verticalRows.results as any[]).map((r) => ({
        vertical: r.vertical,
        count: r.count,
      }))
      totalLeads = totalRow?.total ?? 0
    }

    return Response.json({
      generated_at: new Date().toISOString(),
      leads: {
        total: totalLeads,
        by_status: {
          new: leadStats['new'] ?? 0,
          contacted: leadStats['contacted'] ?? 0,
          qualified: leadStats['qualified'] ?? 0,
          replied: leadStats['replied'] ?? 0,
          lost: leadStats['lost'] ?? 0,
        },
        top_verticals: topVerticals,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[HarvyX] GET /stats error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
