'use client'

/**
 * Module #13 — Procurement (RFQ SAP+ workspace)
 * Tabs: RFQs · Responses · Awarded · New RFQ
 * Status: Draft → Open → Awarded | Closed | Cancelled
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'rfqs' | 'responses' | 'awarded' | 'create'

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

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0)

const STATUS_COLOR: Record<string, string> = {
  Draft: '#666',
  Open: '#1565C0',
  Closed: '#B8860B',
  Awarded: '#2E7D32',
  Cancelled: '#8B0000',
}

export default function ProcurementModuleThirteen() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('rfqs')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({ rfqNo: '', title: '', description: '', category: '', dueDate: '' })
  const [respFor, setRespFor] = useState<string | null>(null)
  const [resp, setResp] = useState({ vendorId: '', vendorName: '', amount: '', currency: 'USD', leadTimeDays: '14' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave3/procurement/rfqs')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #13')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.rfqNo || !form.title) throw new Error('RFQ no and title required')
      const r = await api('/api/wave3/procurement/rfqs', {
        method: 'POST',
        body: JSON.stringify({
          rfqNo: form.rfqNo,
          title: form.title,
          description: form.description || null,
          category: form.category || null,
          dueDate: form.dueDate || null,
        }),
      })
      setForm({ rfqNo: '', title: '', description: '', category: '', dueDate: '' })
      setMessage(`RFQ ${r.data?.rfqNo} saved as Draft`)
      await load()
      setTab('rfqs')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const openRfq = async (id: string) => {
    try {
      setError('')
      await api(`/api/wave3/procurement/rfqs/${id}/open`, { method: 'POST', body: '{}' })
      setMessage('RFQ opened for responses')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const closeRfq = async (id: string) => {
    try {
      setError('')
      await api(`/api/wave3/procurement/rfqs/${id}/close`, { method: 'POST', body: '{}' })
      setMessage('RFQ closed')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const cancelRfq = async (id: string) => {
    if (!confirm('Cancel this RFQ?')) return
    try {
      setError('')
      await api(`/api/wave3/procurement/rfqs/${id}/cancel`, { method: 'POST', body: '{}' })
      setMessage('RFQ cancelled')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const submitResponse = async (id: string) => {
    try {
      setError('')
      if (!resp.vendorId || !resp.amount) throw new Error('Vendor ID and amount required')
      await api(`/api/wave3/procurement/rfqs/${id}/responses`, {
        method: 'POST',
        body: JSON.stringify({
          vendorId: resp.vendorId,
          vendorName: resp.vendorName || null,
          amount: Number(resp.amount),
          currency: (resp.currency || 'USD').toUpperCase(),
          leadTimeDays: resp.leadTimeDays ? Number(resp.leadTimeDays) : null,
        }),
      })
      setRespFor(null)
      setResp({ vendorId: '', vendorName: '', amount: '', currency: 'USD', leadTimeDays: '14' })
      setMessage('Response submitted')
      await load()
      setTab('responses')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const award = async (rfqId: string, respId: string) => {
    if (!confirm('Award this vendor? Other responses are rejected.')) return
    try {
      setError('')
      await api(`/api/wave3/procurement/rfqs/${rfqId}/award/${respId}`, { method: 'POST', body: '{}' })
      setMessage('RFQ awarded')
      await load()
      setTab('awarded')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const draft = rows.filter((r) => r.status === 'Draft').length
  const open = rows.filter((r) => r.status === 'Open').length
  const awarded = rows.filter((r) => r.status === 'Awarded')
  const allResponses = rows.flatMap((r) =>
    (r.responses || []).map((rp: any) => ({ ...rp, rfqNo: r.rfqNo, rfqId: r.id, rfqStatus: r.status, rfqTitle: r.title })),
  )

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #13 · Procurement</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            RFQ Workspace
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Draft → open → collect responses → award · audited status machine.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/vendor-scorecards`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Scorecards
          </Link>
          <Link
            href={`/${locale}/os/contracts`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Contracts
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

      <OsSapAiPanel
        title="RFQ advisor"
        subtitle="Bid coverage and award readiness vs classic MM RFQ lists"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'rfq' }}
        cta="Advise RFQs"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['RFQs', rows.length, '#3D1212'],
          ['Draft', draft, '#666'],
          ['Open', open, '#1565C0'],
          ['Awarded', awarded.length, '#2E7D32'],
        ].map(([label, n, color]) => (
          <div key={String(label)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: `3px solid ${color}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{n}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['rfqs', 'RFQs'],
            ['responses', 'Responses'],
            ['awarded', 'Awarded'],
            ['create', 'New RFQ'],
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

      {!loading && tab === 'create' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New RFQ</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="RFQ no *"
            value={form.rfqNo}
            onChange={(e) => setForm((f) => ({ ...f, rfqNo: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <textarea
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void create()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Save draft
          </button>
        </div>
      ) : null}

      {!loading && tab === 'rfqs' ? (
        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="border border-harvics-burgundy/15 bg-white px-3 py-8 text-center text-harvics-burgundy/45">No RFQs yet.</div>
          ) : (
            rows.map((r) => (
              <div
                key={r.id}
                className="border border-harvics-burgundy/15 bg-white"
                style={{ borderLeft: `4px solid ${STATUS_COLOR[r.status] || '#666'}` }}
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-harvics-burgundy/10 px-3 py-2">
                  <Link
                    href={`/${locale}/os/rfq/${r.id}`}
                    className="font-mono text-sm font-semibold underline decoration-harvics-gold/50"
                  >
                    {r.rfqNo}
                  </Link>
                  <span className="flex-1 text-sm font-medium">{r.title}</span>
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                    style={{ background: STATUS_COLOR[r.status] || '#666' }}
                  >
                    {r.status}
                  </span>
                  {r.status === 'Draft' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void openRfq(r.id)}
                        className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => void cancelRfq(r.id)}
                        className="border border-red-300 px-2 py-1 text-[10px] font-bold uppercase text-red-800"
                      >
                        Cancel
                      </button>
                    </>
                  ) : null}
                  {r.status === 'Open' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setRespFor(respFor === r.id ? null : r.id)}
                        className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        + Response
                      </button>
                      <button
                        type="button"
                        onClick={() => void closeRfq(r.id)}
                        className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => void cancelRfq(r.id)}
                        className="border border-red-300 px-2 py-1 text-[10px] font-bold uppercase text-red-800"
                      >
                        Cancel
                      </button>
                    </>
                  ) : null}
                </div>
                {respFor === r.id ? (
                  <div className="grid gap-2 bg-harvics-cream/40 p-3 md:grid-cols-5">
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                      placeholder="Vendor ID *"
                      value={resp.vendorId}
                      onChange={(e) => setResp((f) => ({ ...f, vendorId: e.target.value }))}
                    />
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                      placeholder="Vendor name"
                      value={resp.vendorName}
                      onChange={(e) => setResp((f) => ({ ...f, vendorName: e.target.value }))}
                    />
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                      placeholder="Amount *"
                      type="number"
                      value={resp.amount}
                      onChange={(e) => setResp((f) => ({ ...f, amount: e.target.value }))}
                    />
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                      placeholder="Lead days"
                      type="number"
                      value={resp.leadTimeDays}
                      onChange={(e) => setResp((f) => ({ ...f, leadTimeDays: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => void submitResponse(r.id)}
                      className="bg-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase text-harvics-cream"
                    >
                      Submit
                    </button>
                  </div>
                ) : null}
                <div className="px-3 py-2 text-[12px] text-harvics-burgundy/55">
                  {(r.responses || []).length} response(s)
                  {r.category ? ` · ${r.category}` : ''}
                  {r.dueDate ? ` · due ${new Date(r.dueDate).toLocaleDateString()}` : ''}
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {!loading && tab === 'responses' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['RFQ', 'Vendor', 'Amount', 'Lead', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allResponses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No responses yet.
                  </td>
                </tr>
              ) : (
                [...allResponses]
                  .sort((a, b) => a.amount - b.amount)
                  .map((rp, i) => (
                    <tr key={rp.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2">
                        <Link href={`/${locale}/os/rfq/${rp.rfqId}`} className="font-mono underline decoration-harvics-gold/50">
                          {rp.rfqNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{rp.vendorName || rp.vendorId}</td>
                      <td className="px-3 py-2 font-mono">{fmt(rp.amount, rp.currency || 'USD')}</td>
                      <td className="px-3 py-2">{rp.leadTimeDays ?? '—'}d</td>
                      <td className="px-3 py-2">{rp.status}</td>
                      <td className="px-3 py-2">
                        {rp.rfqStatus === 'Open' && rp.status === 'Submitted' ? (
                          <button
                            type="button"
                            onClick={() => void award(rp.rfqId, rp.id)}
                            className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            Award
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'awarded' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['RFQ', 'Title', 'Awarded to', 'When'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {awarded.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No awards yet.
                  </td>
                </tr>
              ) : (
                awarded.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link href={`/${locale}/os/rfq/${r.id}`} className="underline decoration-harvics-gold/50">
                        {r.rfqNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.title}</td>
                    <td className="px-3 py-2">{r.awardedTo || '—'}</td>
                    <td className="px-3 py-2">{r.awardedAt ? new Date(r.awardedAt).toLocaleString() : '—'}</td>
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
