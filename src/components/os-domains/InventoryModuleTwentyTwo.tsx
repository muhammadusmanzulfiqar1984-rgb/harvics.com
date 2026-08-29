'use client'

/**
 * Module #22 — Inventory Management (SAP+ workspace)
 * Tabs: Cycle counts · ABC · Stock
 * Status: Pending → Confirmed|Adjusted|Cancelled
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'counts' | 'abc' | 'stock'

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

const CAT: Record<string, string> = { A: '#2E7D32', B: '#B8860B', C: '#666' }

const CYCLE_NEXT: Record<string, string[]> = {
  Pending: ['Confirmed', 'Adjusted', 'Cancelled'],
  Confirmed: [],
  Adjusted: [],
  Cancelled: [],
}

export default function InventoryModuleTwentyTwo() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('counts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [counts, setCounts] = useState<any[]>([])
  const [abc, setAbc] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [summary, setSummary] = useState({ A: 0, B: 0, C: 0, totalValue: 0 })
  const [form, setForm] = useState({
    sku: '',
    warehouseId: '',
    systemQty: '0',
    countedQty: '0',
    countedBy: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, a, s] = await Promise.all([
        api('/api/wave3/inventory/cycle-counts'),
        api('/api/wave3/inventory/abc-analysis'),
        api('/api/inventory').catch(() => ({ data: [] })),
      ])
      setCounts(c.data || [])
      setAbc(a.data || [])
      setSummary(a.summary || { A: 0, B: 0, C: 0, totalValue: 0 })
      setStock(s.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #22')
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
      if (!form.sku) throw new Error('SKU required')
      await api('/api/wave3/inventory/cycle-counts', {
        method: 'POST',
        body: JSON.stringify({
          sku: form.sku,
          warehouseId: form.warehouseId || null,
          systemQty: Number(form.systemQty) || 0,
          countedQty: Number(form.countedQty) || 0,
          countedBy: form.countedBy || null,
        }),
      })
      setForm({ sku: '', warehouseId: '', systemQty: '0', countedQty: '0', countedBy: '' })
      setMessage('Cycle count logged')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const confirm = async (id: string) => {
    try {
      setError('')
      await api(`/api/wave3/inventory/cycle-counts/${id}/confirm`, { method: 'POST', body: '{}' })
      setMessage('Count confirmed')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave3/inventory/cycle-counts/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      setMessage(`Count → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #22 · Inventory</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Inventory Management
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ cycle counts, variance workflow, Pareto ABC, and on-hand stock.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/warehouses`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Warehouses
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
        title="Inventory variance coach"
        subtitle="Cycle-count deltas and below-min SKUs classic MM misses"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'inventory' }}
        cta="Advise inventory"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: 'A items', value: summary.A, color: CAT.A },
          { label: 'B items', value: summary.B, color: CAT.B },
          { label: 'C items', value: summary.C, color: CAT.C },
          { label: 'Inv. value', value: fmt(summary.totalValue), color: 'var(--harvics-gold)' },
          { label: 'Pending counts', value: counts.filter((c) => c.status === 'Pending').length, color: 'var(--harvics-burgundy)' },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: `3px solid ${k.color}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['counts', 'Cycle counts'],
            ['abc', 'ABC analysis'],
            ['stock', 'Stock'],
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

      {!loading && tab === 'counts' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Log count</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="SKU *"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Warehouse ID"
              value={form.warehouseId}
              onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="System qty"
              value={form.systemQty}
              onChange={(e) => setForm((f) => ({ ...f, systemQty: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Counted qty"
              value={form.countedQty}
              onChange={(e) => setForm((f) => ({ ...f, countedQty: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Counted by"
              value={form.countedBy}
              onChange={(e) => setForm((f) => ({ ...f, countedBy: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void create()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Log count
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['SKU', 'System', 'Counted', 'Variance', 'By', 'Status', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {counts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No cycle counts yet.
                    </td>
                  </tr>
                ) : (
                  counts.map((r, i) => {
                    const next = CYCLE_NEXT[r.status] || []
                    return (
                      <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono font-semibold">
                          <Link
                            href={`/${locale}/os/inventory/counts/${r.id}`}
                            className="underline decoration-harvics-gold/50 underline-offset-2"
                          >
                            {r.sku}
                          </Link>
                        </td>
                        <td className="px-3 py-2 font-mono">{r.systemQty}</td>
                        <td className="px-3 py-2 font-mono">{r.countedQty}</td>
                        <td className={`px-3 py-2 font-mono ${r.variance ? 'font-semibold text-red-800' : ''}`}>{r.variance}</td>
                        <td className="px-3 py-2">{r.countedBy || '—'}</td>
                        <td className="px-3 py-2">{r.status}</td>
                        <td className="space-x-1 px-3 py-2">
                          <Link
                            href={`/${locale}/os/inventory/counts/${r.id}`}
                            className="border border-harvics-burgundy/20 px-2 py-0.5 text-[9px] font-bold uppercase"
                          >
                            Open
                          </Link>
                          {r.status === 'Pending' ? (
                            <button
                              type="button"
                              onClick={() => void confirm(r.id)}
                              className="border border-harvics-gold/50 px-2 py-0.5 text-[9px] font-bold uppercase"
                            >
                              Confirm
                            </button>
                          ) : null}
                          {next.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => void setStatus(r.id, s)}
                              className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase"
                            >
                              {s === 'Confirmed' ? 'Confirm*' : s === 'Adjusted' ? 'Adjust' : 'Cancel'}
                            </button>
                          ))}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'abc' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['SKU', 'Name', 'Qty', 'Price', 'Value', 'Cum %', 'Cat'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {abc.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No inventory items for ABC yet.
                  </td>
                </tr>
              ) : (
                abc.map((r, i) => (
                  <tr key={r.sku} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">{r.sku}</td>
                    <td className="px-3 py-2">{r.name || '—'}</td>
                    <td className="px-3 py-2 font-mono">{r.qty}</td>
                    <td className="px-3 py-2 font-mono">{fmt(r.price)}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{fmt(r.value)}</td>
                    <td className="px-3 py-2">{r.cumPct}%</td>
                    <td className="px-3 py-2">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: CAT[r.category] || '#666' }}
                      >
                        {r.category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'stock' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['SKU', 'Description', 'On hand', 'Min', 'Cost', 'Warehouse', 'Low'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stock.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No stock rows from /api/inventory.
                  </td>
                </tr>
              ) : (
                stock.map((r, i) => {
                  const low = r.lowStock || (r.onHand < (r.minStock || 0))
                  return (
                    <tr key={r.id || r.sku} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">{r.sku}</td>
                      <td className="px-3 py-2">{r.description || r.name || '—'}</td>
                      <td className="px-3 py-2 font-mono">{r.onHand ?? r.qty ?? '—'}</td>
                      <td className="px-3 py-2 font-mono">{r.minStock ?? '—'}</td>
                      <td className="px-3 py-2 font-mono">{fmt(r.unitCost || 0)}</td>
                      <td className="px-3 py-2">{r.warehouse || '—'}</td>
                      <td className="px-3 py-2">
                        {low ? (
                          <span className="border border-red-300 px-2 py-0.5 text-[9px] font-bold uppercase text-red-800">
                            Low
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
