'use client'

/**
 * CRM reports — live /api/crm/summary + /api/wave8/pipeline.
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function CrmReportsPage() {
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<any>(null)
  const [pipeline, setPipeline] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [s, p] = await Promise.all([api('/api/crm/summary'), api('/api/wave8/pipeline')])
      setSummary(s.data)
      setPipeline(p.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load CRM reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <HarvicsOSShell
      title="CRM Reports"
      subtitle="Module #8 — summary + pipeline"
      activeDomain="crm"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'CRM', href: '/os/crm' },
        { label: 'Reports' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/${locale}/os/crm`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← CRM workspace
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && summary ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['Customers', summary.totalCustomers],
              ['Leads', summary.totalLeads],
              ['Campaigns', summary.activeCampaigns],
              ['LTV', fmt(summary.totalLifetimeValue)],
              ['Conversion', `${summary.conversionRate ?? 0}%`],
            ].map(([label, value]) => (
              <div key={String(label)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #6B4F3A' }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{label}</div>
                <div className="mt-1 font-mono text-lg font-semibold">{value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && summary?.leadsByStage ? (
          <div className="border border-harvics-burgundy/15 bg-white">
            <div className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream">
              Leads by stage (CRM summary)
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-4">
              {Object.entries(summary.leadsByStage).map(([stage, count]) => (
                <div key={stage} className="border border-harvics-burgundy/10 bg-harvics-cream/30 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">{stage}</p>
                  <p className="font-mono text-lg font-semibold">{count as number}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && pipeline ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #B8860B' }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Lead pipeline</div>
                <div className="mt-1 font-mono text-lg font-semibold">{fmt(pipeline.totals?.totalLeadValue)}</div>
              </div>
              <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #1E3A8A' }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Deal pipeline</div>
                <div className="mt-1 font-mono text-lg font-semibold">{fmt(pipeline.totals?.totalDealValue)}</div>
              </div>
              <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #2E7D32' }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Total pipeline</div>
                <div className="mt-1 font-mono text-lg font-semibold">{fmt(pipeline.totals?.totalPipelineValue)}</div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="border border-harvics-burgundy/15 bg-white">
                <div className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream">
                  Wave8 leads by stage
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-harvics-burgundy/10 text-left text-[10px] uppercase tracking-[0.12em] text-harvics-burgundy/50">
                      <th className="px-3 py-2">Stage</th>
                      <th className="px-3 py-2">Count</th>
                      <th className="px-3 py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pipeline.leads || []).map((r: any) => (
                      <tr key={r.stage} className="border-b border-harvics-burgundy/5">
                        <td className="px-3 py-2 font-semibold">{r.stage}</td>
                        <td className="px-3 py-2 font-mono">{r.count}</td>
                        <td className="px-3 py-2 font-mono">{fmt(r.value)}</td>
                      </tr>
                    ))}
                    {!(pipeline.leads || []).length ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-harvics-burgundy/45">
                          No lead stages
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="border border-harvics-burgundy/15 bg-white">
                <div className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream">
                  Wave8 deals by stage
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-harvics-burgundy/10 text-left text-[10px] uppercase tracking-[0.12em] text-harvics-burgundy/50">
                      <th className="px-3 py-2">Stage</th>
                      <th className="px-3 py-2">Count</th>
                      <th className="px-3 py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pipeline.deals || []).map((r: any) => (
                      <tr key={r.stage} className="border-b border-harvics-burgundy/5">
                        <td className="px-3 py-2 font-semibold">{r.stage}</td>
                        <td className="px-3 py-2 font-mono">{r.count}</td>
                        <td className="px-3 py-2 font-mono">{fmt(r.value)}</td>
                      </tr>
                    ))}
                    {!(pipeline.deals || []).length ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-harvics-burgundy/45">
                          No deal stages
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            {(pipeline.aiTiers || []).length ? (
              <div className="border border-harvics-burgundy/15 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">AI tiers</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {pipeline.aiTiers.map((t: any) => (
                    <div key={t.tier} className="border border-harvics-gold/30 bg-harvics-cream/40 px-4 py-2">
                      <span className="text-sm font-semibold">{t.tier}</span>
                      <span className="ml-2 font-mono text-sm">{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
