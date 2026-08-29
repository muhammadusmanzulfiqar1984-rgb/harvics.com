'use client'

/**
 * Budget period document — lines, variance, approve-all, link to Controlling.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
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
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

export default function BudgetPeriodDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const period = decodeURIComponent(String(params?.period || ''))
  const scenario = 'Base'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lines, setLines] = useState<any[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [summary, setSummary] = useState({ totalBudget: 0, totalActual: 0, variance: 0 })

  const load = useCallback(async () => {
    if (!period) return
    setLoading(true)
    setError('')
    try {
      const [b, v] = await Promise.all([
        api(`/api/finance/budgets?period=${encodeURIComponent(period)}&scenario=${encodeURIComponent(scenario)}&limit=500`),
        api(`/api/finance/budgets/variance?period=${encodeURIComponent(period)}&scenario=${encodeURIComponent(scenario)}`),
      ])
      setLines(b.data || [])
      setRows(v.data || [])
      setSummary(v.summary || { totalBudget: 0, totalActual: 0, variance: 0 })
    } catch (e: any) {
      setError(e.message || 'Failed to load period')
    } finally {
      setLoading(false)
    }
  }, [period, scenario])

  useEffect(() => {
    void load()
  }, [load])

  const approvePeriod = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/budgets/approve-period', {
        method: 'POST',
        body: JSON.stringify({ period, scenario }),
      })
      setMessage(r.message || `Approved ${r.approved}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const draftCount = lines.filter((l) => (l.status || 'Draft') === 'Draft').length

  return (
    <HarvicsOSShell
      title={`Budget ${period}`}
      subtitle={`Module #7 — ${scenario} scenario`}
      activeDomain="budgets"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Planning', href: '/os/budgets' },
        { label: period },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/os/budgets`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← Planning workspace
          </Link>
          <Link
            href={`/${locale}/os/controlling`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50"
          >
            Controlling actuals
          </Link>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Period', period],
                ['Scenario', scenario],
                ['Budget', fmt(summary.totalBudget)],
                ['Actual', fmt(summary.totalActual)],
                ['Variance', fmt(summary.variance)],
                ['Lines', String(lines.length)],
                ['Draft', String(draftCount)],
                ['Approved', String(lines.filter((l) => l.status === 'Approved').length)],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            {draftCount > 0 ? (
              <button
                type="button"
                onClick={() => void approvePeriod()}
                className="bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
              >
                Approve all {draftCount} draft lines
              </button>
            ) : null}

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                Variance vs Controlling
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Account', 'CC', 'Budget', 'Actual', 'Variance', '%', 'Status'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No rows for this period.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, i) => (
                      <tr key={`${r.account}-${i}`} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono font-semibold">
                          {r.lineId ? (
                            <Link
                              href={`/${locale}/os/budgets/lines/${r.lineId}`}
                              className="underline decoration-harvics-gold/50"
                            >
                              {r.account}
                            </Link>
                          ) : (
                            r.account
                          )}
                        </td>
                        <td className="px-3 py-2">{r.costCenter || '—'}</td>
                        <td className="px-3 py-2 font-mono">{fmt(r.budgeted)}</td>
                        <td className="px-3 py-2 font-mono">{fmt(r.actual)}</td>
                        <td
                          className="px-3 py-2 font-mono font-semibold"
                          style={{ color: r.variance > 0 ? '#B71C1C' : '#2E7D32' }}
                        >
                          {fmt(r.variance)}
                        </td>
                        <td className="px-3 py-2">{r.variancePct == null ? '—' : `${r.variancePct}%`}</td>
                        <td className="px-3 py-2">{r.status || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
