'use client'

/**
 * Module #7 — Financial Planning (SAP+ workspace)
 * Budgets · variance vs Controlling · version/approve · period detail.
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

type Tab = 'variance' | 'lines' | 'periods'

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

const defaultPeriod = () => new Date().toISOString().slice(0, 7)

export default function FinanceModuleSevenPlanning() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('variance')
  const [period, setPeriod] = useState(defaultPeriod)
  const [scenario, setScenario] = useState('Base')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [lines, setLines] = useState<any[]>([])
  const [centers, setCenters] = useState<any[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [periods, setPeriods] = useState<any[]>([])
  const [summary, setSummary] = useState({ totalBudget: 0, totalActual: 0, variance: 0 })

  const [form, setForm] = useState({
    account: '6000',
    costCenter: '',
    budgeted: '',
    scenario: 'Base',
    notes: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [b, v, cc, per] = await Promise.all([
        api(`/api/finance/budgets?period=${encodeURIComponent(period)}&scenario=${encodeURIComponent(scenario)}&limit=200`),
        api(`/api/finance/budgets/variance?period=${encodeURIComponent(period)}&scenario=${encodeURIComponent(scenario)}`),
        api('/api/finance/cost-centers'),
        api(`/api/finance/budgets/periods?scenario=${encodeURIComponent(scenario)}`).catch(() => ({ data: [] })),
      ])
      setLines(b.data || [])
      setRows(v.data || [])
      setSummary(v.summary || { totalBudget: 0, totalActual: 0, variance: 0 })
      setCenters(cc.data || [])
      setPeriods(per.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #7 Planning')
    } finally {
      setLoading(false)
    }
  }, [period, scenario])

  useEffect(() => {
    void load()
  }, [load])

  const createLine = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/finance/budgets', {
        method: 'POST',
        body: JSON.stringify({
          period,
          account: form.account,
          costCenter: form.costCenter || undefined,
          budgeted: Number(form.budgeted),
          scenario: form.scenario,
          notes: form.notes || undefined,
        }),
      })
      setForm({ account: '6000', costCenter: '', budgeted: '', scenario: form.scenario, notes: '' })
      setMessage('Budget line saved (Draft)')
      await load()
      setTab('variance')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const approveLine = async (id: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/finance/budgets/${id}/approve`, { method: 'POST', body: '{}' })
      setMessage(r.message || 'Approved')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const closeLine = async (id: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/finance/budgets/${id}/close`, { method: 'POST', body: '{}' })
      setMessage(r.message || 'Closed')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const approvePeriod = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/budgets/approve-period', {
        method: 'POST',
        body: JSON.stringify({ period, scenario }),
      })
      setMessage(r.message || `Approved ${r.approved} lines`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const draftCount = lines.filter((l) => (l.status || 'Draft') === 'Draft').length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #7 · Finance</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Financial Planning
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Budget lines by account and cost center — variance against Module #2 Controlling actuals. Draft → Approve → Close.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">
            Period
            <input
              className="ml-2 border border-harvics-burgundy/20 bg-white px-2 py-1.5 font-mono text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="YYYY-MM"
            />
          </label>
          <select
            className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          >
            <option value="Base">Base</option>
            <option value="Upside">Upside</option>
            <option value="Downside">Downside</option>
          </select>
          <Link
            href={`/${locale}/os/controlling`}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Controlling
          </Link>
          <Link
            href={`/${locale}/os/budgets/${encodeURIComponent(period)}`}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Period detail
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #1E3A8A' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Budget</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(summary.totalBudget)}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #B8860B' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Actual</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(summary.totalActual)}</div>
        </div>
        <div
          className="border border-harvics-burgundy/15 bg-white p-3"
          style={{ borderTop: `3px solid ${summary.variance > 0 ? '#B71C1C' : '#2E7D32'}` }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Variance</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(summary.variance)}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #6B1D2A' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Draft lines</div>
          <div className="mt-1 font-mono text-lg font-semibold">{draftCount}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['variance', 'Budget vs actual'],
            ['lines', 'Budget lines'],
            ['periods', 'Periods'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
              tab === id ? 'bg-harvics-burgundy text-harvics-cream' : 'border border-harvics-burgundy/25'
            }`}
          >
            {label}
          </button>
        ))}
        {draftCount > 0 ? (
          <button
            type="button"
            onClick={() => void approvePeriod()}
            className="ml-auto bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Approve all drafts · {period}
          </button>
        ) : null}
      </div>

      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

      {!loading && tab === 'variance' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Account', 'Cost center', 'Budget', 'Actual', 'Variance', '%', 'Status'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No budget/actual rows for {period}. Add budget lines and Controlling postings.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={`${r.account}-${r.costCenter}-${i}`} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
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
      ) : null}

      {!loading && tab === 'lines' ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">
              New budget line · {period}
            </p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="GL account"
              value={form.account}
              onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={form.costCenter}
              onChange={(e) => setForm((f) => ({ ...f, costCenter: e.target.value }))}
            >
              <option value="">Cost center (optional)</option>
              {centers.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Budgeted amount"
              type="number"
              value={form.budgeted}
              onChange={(e) => setForm((f) => ({ ...f, budgeted: e.target.value }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={form.scenario}
              onChange={(e) => setForm((f) => ({ ...f, scenario: e.target.value }))}
            >
              <option value="Base">Base</option>
              <option value="Upside">Upside</option>
              <option value="Downside">Downside</option>
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createLine()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Save budget line
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Account', 'CC', 'Budgeted', 'Scenario', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No budget lines for {period}.
                    </td>
                  </tr>
                ) : (
                  lines.map((l, i) => (
                    <tr key={l.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2">
                        <Link
                          href={`/${locale}/os/budgets/lines/${l.id}`}
                          className="font-mono font-semibold underline decoration-harvics-gold/50"
                        >
                          {l.account}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{l.costCenter || '—'}</td>
                      <td className="px-3 py-2 font-mono">{fmt(l.budgeted)}</td>
                      <td className="px-3 py-2">{l.scenario}</td>
                      <td className="px-3 py-2">{l.status || 'Draft'}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(l.status || 'Draft') === 'Draft' ? (
                            <button
                              type="button"
                              onClick={() => void approveLine(l.id)}
                              className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                            >
                              Approve
                            </button>
                          ) : null}
                          {(l.status || 'Draft') !== 'Closed' ? (
                            <button
                              type="button"
                              onClick={() => void closeLine(l.id)}
                              className="border border-red-300 px-2 py-1 text-[10px] font-bold uppercase text-red-800"
                            >
                              Close
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'periods' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Period', 'Total budget', 'Lines', 'Draft', 'Approved', 'Closed', ''].map((h) => (
                  <th key={h || 'x'} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No budget periods yet for scenario {scenario}.
                  </td>
                </tr>
              ) : (
                periods.map((p, i) => (
                  <tr key={p.period} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">{p.period}</td>
                    <td className="px-3 py-2 font-mono">{fmt(p.totalBudget)}</td>
                    <td className="px-3 py-2">{p.lines}</td>
                    <td className="px-3 py-2">{p.draft}</td>
                    <td className="px-3 py-2">{p.approved}</td>
                    <td className="px-3 py-2">{p.closed}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/${locale}/os/budgets/${encodeURIComponent(p.period)}`}
                        className="text-[10px] font-bold uppercase underline decoration-harvics-gold/50"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        className="ml-3 text-[10px] font-bold uppercase underline"
                        onClick={() => {
                          setPeriod(p.period)
                          setTab('variance')
                        }}
                      >
                        Load
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
