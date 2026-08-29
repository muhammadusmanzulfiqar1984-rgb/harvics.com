'use client'

/**
 * Module #6 — HPay Payments (SAP+ workspace)
 * Draft → Approve → Release → Paid · batch from open AP.
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

type Tab = 'runs' | 'create' | 'batch-ap'

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

const fmt = (n: number, ccy = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 0 }).format(n || 0)

const STATUS_COLOR: Record<string, string> = {
  Draft: '#B8860B',
  Approved: '#1E3A8A',
  Released: '#E65100',
  Paid: '#2E7D32',
  Cancelled: '#666',
}

export default function FinanceModuleSixHPay() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('runs')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [runs, setRuns] = useState<any[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [proposeTotal, setProposeTotal] = useState(0)
  const [form, setForm] = useState({
    runNo: `PR-${Date.now().toString().slice(-6)}`,
    description: '',
    currency: 'USD',
  })
  const [items, setItems] = useState([{ payeeName: '', amount: '', invoiceRef: '' }])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [r, prop] = await Promise.all([
        api('/api/wave5/payment-runs'),
        api('/api/finance/ap/payment-proposals').catch(() => ({ data: [], totalPropose: 0 })),
      ])
      setRuns(r.data || [])
      setProposals(prop.data || [])
      setProposeTotal(prop.totalPropose || 0)
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #6 HPay')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const draftTotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0)
  const byStatus = (s: string) => runs.filter((r) => r.status === s).length
  const pipelineTotal = runs
    .filter((r) => !['Paid', 'Cancelled'].includes(r.status))
    .reduce((s, r) => s + (Number(r.totalAmount) || 0), 0)

  const create = async () => {
    try {
      setError('')
      setMessage('')
      const valid = items
        .filter((i) => i.payeeName && Number(i.amount) > 0)
        .map((i) => ({
          payeeName: i.payeeName,
          amount: Number(i.amount),
          invoiceRef: i.invoiceRef || undefined,
        }))
      if (!valid.length) throw new Error('Add at least one payee line')
      const r = await api('/api/wave5/payment-runs', {
        method: 'POST',
        body: JSON.stringify({ ...form, items: valid }),
      })
      setForm({
        runNo: `PR-${Date.now().toString().slice(-6)}`,
        description: '',
        currency: form.currency,
      })
      setItems([{ payeeName: '', amount: '', invoiceRef: '' }])
      setMessage(`Draft ${r.data?.runNo || form.runNo} created`)
      await load()
      setTab('runs')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const batchFromAp = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/wave5/payment-runs/from-ap', {
        method: 'POST',
        body: JSON.stringify({
          description: `Batch AP · ${proposals.length} open bills`,
          currency: 'USD',
        }),
      })
      setMessage(r.message || `Draft ${r.data?.runNo} created from AP`)
      await load()
      setTab('runs')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const act = async (id: string, action: 'approve' | 'release' | 'mark-paid' | 'cancel') => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/wave5/payment-runs/${id}/${action}`, { method: 'POST', body: '{}' })
      setMessage(r.message || action)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #6 · Finance</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            HPay Payments
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Outbound payment runs — Draft → Approve → Release → Paid. Batch open AP from Module #4.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/os/ap-aging`}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            AP workspace
          </Link>
          <Link
            href={`/${locale}/os/treasury-banking`}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Treasury
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #6B1D2A' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Pipeline</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(pipelineTotal)}</div>
        </div>
        {(['Draft', 'Approved', 'Released', 'Paid'] as const).map((s) => (
          <div key={s} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: `3px solid ${STATUS_COLOR[s]}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{s}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{byStatus(s)}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['runs', 'Payment runs'],
            ['create', 'New run'],
            ['batch-ap', 'Batch from AP'],
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

      {!loading && tab === 'runs' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Run', 'Description', 'Items', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No payment runs yet — create one or batch from AP.
                  </td>
                </tr>
              ) : (
                runs.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2">
                      <Link
                        href={`/${locale}/os/payment-runs/${r.id}`}
                        className="font-mono font-semibold underline decoration-harvics-gold/50"
                      >
                        {r.runNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.description || '—'}</td>
                    <td className="px-3 py-2">{r.itemCount ?? r.items?.length ?? 0}</td>
                    <td className="px-3 py-2 font-mono">{fmt(r.totalAmount, r.currency || 'USD')}</td>
                    <td className="px-3 py-2 font-semibold" style={{ color: STATUS_COLOR[r.status] || '#3D1212' }}>
                      {r.status}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {r.status === 'Draft' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void act(r.id, 'approve')}
                              className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => void act(r.id, 'cancel')}
                              className="border border-red-300 px-2 py-1 text-[10px] font-bold uppercase text-red-800"
                            >
                              Cancel
                            </button>
                          </>
                        ) : null}
                        {r.status === 'Approved' || r.status === 'Draft' ? (
                          <button
                            type="button"
                            onClick={() => void act(r.id, 'release')}
                            className="bg-harvics-gold/80 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            Release
                          </button>
                        ) : null}
                        {r.status === 'Approved' ? (
                          <button
                            type="button"
                            onClick={() => void act(r.id, 'cancel')}
                            className="border border-red-300 px-2 py-1 text-[10px] font-bold uppercase text-red-800"
                          >
                            Cancel
                          </button>
                        ) : null}
                        {r.status === 'Released' ? (
                          <button
                            type="button"
                            onClick={() => void act(r.id, 'mark-paid')}
                            className="bg-harvics-burgundy px-2 py-1 text-[10px] font-bold uppercase text-harvics-cream"
                          >
                            Mark paid
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
      ) : null}

      {!loading && tab === 'create' ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New payment run</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                placeholder="Run No"
                value={form.runNo}
                onChange={(e) => setForm((f) => ({ ...f, runNo: e.target.value }))}
              />
              <input
                className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                placeholder="Currency"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              />
              <input
                className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm sm:col-span-1"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Line items</p>
            {items.map((it, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-3">
                <input
                  className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Payee"
                  value={it.payeeName}
                  onChange={(e) => {
                    const n = [...items]
                    n[i] = { ...n[i], payeeName: e.target.value }
                    setItems(n)
                  }}
                />
                <input
                  className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  type="number"
                  placeholder="Amount"
                  value={it.amount}
                  onChange={(e) => {
                    const n = [...items]
                    n[i] = { ...n[i], amount: e.target.value }
                    setItems(n)
                  }}
                />
                <input
                  className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Invoice ref"
                  value={it.invoiceRef}
                  onChange={(e) => {
                    const n = [...items]
                    n[i] = { ...n[i], invoiceRef: e.target.value }
                    setItems(n)
                  }}
                />
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setItems([...items, { payeeName: '', amount: '', invoiceRef: '' }])}
                className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
              >
                + Add line
              </button>
              <button
                type="button"
                onClick={() => void create()}
                className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
              >
                Create draft
              </button>
            </div>
          </div>
          <div className="border border-harvics-burgundy/15 bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Draft total</div>
            <div className="mt-1 font-mono text-2xl font-semibold">{fmt(draftTotal, form.currency)}</div>
            <p className="mt-3 text-[12px] text-harvics-burgundy/60">
              Status machine: Draft → Approve → Release → Mark paid. Cancel only before release.
            </p>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'batch-ap' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Open AP proposals</p>
              <p className="mt-1 text-sm">
                {proposals.length} bills · propose pay {fmt(proposeTotal)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void batchFromAp()}
              disabled={!proposals.length}
              className="bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream disabled:opacity-40"
            >
              Create draft from AP
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Bill', 'Vendor', 'Outstanding', 'Due', 'Bucket', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No open AP bills — nothing to batch.
                    </td>
                  </tr>
                ) : (
                  proposals.map((p, i) => (
                    <tr key={p.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2">
                        <Link
                          href={`/${locale}/os/ap/bills/${p.id}`}
                          className="font-mono font-semibold underline decoration-harvics-gold/50"
                        >
                          {p.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{p.vendorName || '—'}</td>
                      <td className="px-3 py-2 font-mono">{fmt(p.proposePay || p.outstanding)}</td>
                      <td className="px-3 py-2">{p.dueDate || '—'}</td>
                      <td className="px-3 py-2">{p.bucket}</td>
                      <td className="px-3 py-2">{p.status}</td>
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
