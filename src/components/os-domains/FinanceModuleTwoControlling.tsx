'use client'

/**
 * Module #2 — Controlling
 * DoD: cost centers, plan/actual postings, variance report, allocations, optional Module #1 GL on Actual.
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'centers' | 'postings' | 'variance' | 'allocations'

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

export default function FinanceModuleTwoControlling() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('variance')
  const [period, setPeriod] = useState(defaultPeriod)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [centers, setCenters] = useState<any[]>([])
  const [postings, setPostings] = useState<any[]>([])
  const [allocations, setAllocations] = useState<any[]>([])
  const [report, setReport] = useState<any[]>([])
  const [totals, setTotals] = useState({ actual: 0, plan: 0, variance: 0 })

  const [ccForm, setCcForm] = useState({ code: '', name: '', manager: '' })
  const [postForm, setPostForm] = useState({
    costCenterCode: '',
    account: '6000',
    amount: '',
    type: 'Actual' as 'Actual' | 'Plan',
    description: '',
    postToGl: true,
  })
  const [allocForm, setAllocForm] = useState({
    fromAccount: '6000',
    toCostCenter: '',
    amount: '',
    basis: 'manual',
    notes: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [cc, posts, rep, alloc] = await Promise.all([
        api('/api/finance/cost-centers'),
        api(`/api/finance/cost-postings?period=${encodeURIComponent(period)}&limit=200`),
        api(`/api/finance/controlling/report?period=${encodeURIComponent(period)}`),
        api(`/api/finance/allocations?period=${encodeURIComponent(period)}&limit=200`),
      ])
      setCenters(cc.data || [])
      setPostings(posts.data || [])
      setReport(rep.data || [])
      setTotals(rep.totals || { actual: 0, plan: 0, variance: 0 })
      setAllocations(alloc.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #2 Controlling')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    void load()
  }, [load])

  const createCenter = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/finance/cost-centers', {
        method: 'POST',
        body: JSON.stringify(ccForm),
      })
      setCcForm({ code: '', name: '', manager: '' })
      setMessage('Cost center created')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createPosting = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/cost-postings', {
        method: 'POST',
        body: JSON.stringify({
          costCenterCode: postForm.costCenterCode,
          period,
          account: postForm.account,
          amount: Number(postForm.amount),
          type: postForm.type,
          description: postForm.description || undefined,
          postToGl: postForm.postToGl,
        }),
      })
      setPostForm({
        costCenterCode: '',
        account: '6000',
        amount: '',
        type: 'Actual',
        description: '',
        postToGl: true,
      })
      const glBit = r.journal
        ? ` · GL ${r.journal.entryNo}`
        : r.glNote
          ? ` · ${r.glNote}`
          : ''
      setMessage(`Posting saved (${r.data?.type || '—'})${glBit}`)
      await load()
      setTab('variance')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createAllocation = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/finance/allocations', {
        method: 'POST',
        body: JSON.stringify({
          period,
          fromAccount: allocForm.fromAccount,
          toCostCenter: allocForm.toCostCenter,
          amount: Number(allocForm.amount),
          basis: allocForm.basis || 'manual',
          notes: allocForm.notes || undefined,
        }),
      })
      setAllocForm({ fromAccount: '6000', toCostCenter: '', amount: '', basis: 'manual', notes: '' })
      setMessage('Allocation saved')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const seedDemo = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/controlling/seed-demo', {
        method: 'POST',
        body: JSON.stringify({ period }),
      })
      setMessage(
        `Sample data · centers +${(r.costCentersCreated || []).length} · postings +${r.postingsCreated || 0}`,
      )
      await load()
      setTab('variance')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const executeAllocation = async (id: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/finance/allocations/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify({ postToGl: true }),
      })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`${r.message || 'Executed'}${glBit}`)
      await load()
      setTab('variance')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggleCenter = async (id: string, active: boolean) => {
    try {
      setError('')
      await api(`/api/finance/cost-centers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !active }),
      })
      setMessage(active ? 'Cost center deactivated' : 'Cost center activated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #2 · Finance</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Controlling
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Cost centers, plan vs actual, allocations, variance — Actual postings can hit Module #1 GL (Dr
            6000 / Cr 1000).
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
          <button
            type="button"
            onClick={() => void seedDemo()}
            className="border border-harvics-gold/50 bg-harvics-cream px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Load sample data
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      <OsSapAiPanel
        title="Variance AI (CFO)"
        subtitle={`Explain plan vs actual for ${period} in CFO language — volume / price / mix / timing`}
        endpoint="/api/finance/ai/controlling-variance"
        buildBody={() => ({ period })}
        cta="Explain variance"
      />

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}
      {message ? (
        <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #1E3A8A' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Plan</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(totals.plan)}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #B8860B' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Actual</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(totals.actual)}</div>
        </div>
        <div
          className="border border-harvics-burgundy/15 bg-white p-3"
          style={{ borderTop: `3px solid ${totals.variance > 0 ? '#B71C1C' : '#2E7D32'}` }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Variance</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(totals.variance)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['variance', 'Variance'],
            ['centers', 'Cost centers'],
            ['postings', 'Postings'],
            ['allocations', 'Allocations'],
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
      </div>

      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

      {!loading && tab === 'variance' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Code', 'Name', 'Plan', 'Actual', 'Variance', '%', 'Status'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No postings for {period}. Use Load sample data or add Plan/Actual postings.
                  </td>
                </tr>
              ) : (
                report.map((r, i) => (
                  <tr key={r.code} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link
                        className="underline decoration-harvics-gold/50 underline-offset-2"
                        href={`/${locale}/os/controlling/centers/${encodeURIComponent(r.code)}?period=${encodeURIComponent(period)}`}
                      >
                        {r.code}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 font-mono">{fmt(r.plan)}</td>
                    <td className="px-3 py-2 font-mono">{fmt(r.actual)}</td>
                    <td
                      className="px-3 py-2 font-mono font-semibold"
                      style={{ color: r.variance > 0 ? '#B71C1C' : '#2E7D32' }}
                    >
                      {fmt(r.variance)}
                    </td>
                    <td className="px-3 py-2">{r.variancePct == null ? '—' : `${r.variancePct}%`}</td>
                    <td className="px-3 py-2">{r.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'centers' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New cost center</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Code (e.g. CC-FMCG)"
              value={ccForm.code}
              onChange={(e) => setCcForm((f) => ({ ...f, code: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Name"
              value={ccForm.name}
              onChange={(e) => setCcForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Manager"
              value={ccForm.manager}
              onChange={(e) => setCcForm((f) => ({ ...f, manager: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createCenter()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'Name', 'Manager', 'Active', ''].map((h) => (
                    <th key={h || 'x'} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {centers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No cost centers yet.
                    </td>
                  </tr>
                ) : (
                  centers.map((c, i) => (
                    <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link
                          className="underline decoration-harvics-gold/50 underline-offset-2"
                          href={`/${locale}/os/controlling/centers/${encodeURIComponent(c.code)}?period=${encodeURIComponent(period)}`}
                        >
                          {c.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2">{c.manager || '—'}</td>
                      <td className="px-3 py-2">{c.active ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => void toggleCenter(c.id, Boolean(c.active))}
                          className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                        >
                          {c.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'postings' ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">
              Post plan / actual · {period}
            </p>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={postForm.costCenterCode}
              onChange={(e) => setPostForm((f) => ({ ...f, costCenterCode: e.target.value }))}
            >
              <option value="">Cost center</option>
              {centers.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={postForm.type}
              onChange={(e) =>
                setPostForm((f) => ({ ...f, type: e.target.value as 'Actual' | 'Plan' }))
              }
            >
              <option value="Plan">Plan</option>
              <option value="Actual">Actual</option>
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="GL account (e.g. 6000)"
              value={postForm.account}
              onChange={(e) => setPostForm((f) => ({ ...f, account: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Amount"
              type="number"
              value={postForm.amount}
              onChange={(e) => setPostForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Description"
              value={postForm.description}
              onChange={(e) => setPostForm((f) => ({ ...f, description: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                checked={postForm.postToGl}
                onChange={(e) => setPostForm((f) => ({ ...f, postToGl: e.target.checked }))}
                disabled={postForm.type !== 'Actual'}
              />
              Post Actual to Module #1 GL (Dr 6000 / Cr 1000)
            </label>
            <button
              type="button"
              onClick={() => void createPosting()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Save posting
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['CC', 'Type', 'Account', 'Amount', 'Description'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {postings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No postings for {period}.
                    </td>
                  </tr>
                ) : (
                  postings.map((p, i) => (
                    <tr key={p.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">{p.costCenterCode}</td>
                      <td className="px-3 py-2">{p.type}</td>
                      <td className="px-3 py-2 font-mono">{p.account}</td>
                      <td className="px-3 py-2 font-mono">{fmt(p.amount)}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/60">{p.description || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'allocations' ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">
              Allocate cost · {period}
            </p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="From GL account"
              value={allocForm.fromAccount}
              onChange={(e) => setAllocForm((f) => ({ ...f, fromAccount: e.target.value }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={allocForm.toCostCenter}
              onChange={(e) => setAllocForm((f) => ({ ...f, toCostCenter: e.target.value }))}
            >
              <option value="">To cost center</option>
              {centers.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Amount"
              type="number"
              value={allocForm.amount}
              onChange={(e) => setAllocForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Basis (e.g. headcount)"
              value={allocForm.basis}
              onChange={(e) => setAllocForm((f) => ({ ...f, basis: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Notes"
              value={allocForm.notes}
              onChange={(e) => setAllocForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createAllocation()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Save allocation
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['From', 'To CC', 'Amount', 'Basis', 'Notes', ''].map((h) => (
                    <th key={h || 'act'} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No allocations for {period}.
                    </td>
                  </tr>
                ) : (
                  allocations.map((a, i) => (
                    <tr key={a.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">{a.fromAccount}</td>
                      <td className="px-3 py-2 font-mono">{a.toCostCenter}</td>
                      <td className="px-3 py-2 font-mono">{fmt(a.amount)}</td>
                      <td className="px-3 py-2">{a.basis || '—'}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/60">{a.notes || '—'}</td>
                      <td className="px-3 py-2">
                        {String(a.basis || '').includes('executed') ? (
                          <span className="text-[10px] uppercase text-harvics-burgundy/45">Done</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void executeAllocation(a.id)}
                            className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                          >
                            Execute
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
