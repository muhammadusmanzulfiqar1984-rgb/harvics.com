'use client'

/**
 * Module #17 — Production Planning (SAP+ workspace)
 * Tabs: Work orders · Board · New WO
 * Status: Planned → Released → InProgress → Completed | Cancelled
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'orders' | 'board' | 'create'

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

const WO_NEXT: Record<string, string[]> = {
  Planned: ['Released', 'Cancelled'],
  Released: ['InProgress', 'Cancelled'],
  InProgress: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
}

const STATUS_COLOR: Record<string, string> = {
  Planned: '#666',
  Released: '#1565C0',
  InProgress: '#B8860B',
  Completed: '#2E7D32',
  Cancelled: '#B71C1C',
}

export default function ManufacturingModuleSeventeen() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('orders')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    workOrderNo: '',
    productSku: '',
    qty: '100',
    priority: 'Normal',
    startDate: '',
    notes: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/v2/manufacturing/work-orders')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #17')
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
      if (!form.workOrderNo || !form.productSku) throw new Error('WO # and SKU required')
      const r = await api('/api/v2/manufacturing/work-orders', {
        method: 'POST',
        body: JSON.stringify({
          workOrderNo: form.workOrderNo,
          productSku: form.productSku,
          qty: Number(form.qty) || 0,
          priority: form.priority,
          status: 'Planned',
          startDate: form.startDate || null,
          notes: form.notes || null,
        }),
      })
      setForm({ workOrderNo: '', productSku: '', qty: '100', priority: 'Normal', startDate: '', notes: '' })
      setMessage(`Work order ${r.data?.workOrderNo} created`)
      await load()
      setTab('orders')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/v2/manufacturing/work-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const open = rows.filter((r) => !['Completed', 'Cancelled'].includes(r.status)).length

  const byStatus = useMemo(() => {
    const map: Record<string, any[]> = {
      Planned: [],
      Released: [],
      InProgress: [],
      Completed: [],
      Cancelled: [],
    }
    for (const r of rows) {
      ;(map[r.status] || (map[r.status] = [])).push(r)
    }
    return map
  }, [rows])

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #17 · Manufacturing</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Production Planning
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Planned → released → in progress → complete · audited WO status machine.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/shop-floor`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Shop floor
          </Link>
          <Link
            href={`/${locale}/os/bom`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            BOM
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
        title="Production variance coach"
        subtitle="WO release backlog vs in-progress capacity — SAP PP without AI"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'manufacturing' }}
        cta="Advise production"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total WOs', value: rows.length, color: '#3D1212' },
          { label: 'Open', value: open, color: '#B8860B' },
          { label: 'In progress', value: rows.filter((r) => r.status === 'InProgress').length, color: '#1565C0' },
          { label: 'Completed', value: rows.filter((r) => r.status === 'Completed').length, color: '#2E7D32' },
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
            ['orders', 'Work orders'],
            ['board', 'Status board'],
            ['create', 'New WO'],
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
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New work order</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="WO # *"
            value={form.workOrderNo}
            onChange={(e) => setForm((f) => ({ ...f, workOrderNo: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Product SKU *"
            value={form.productSku}
            onChange={(e) => setForm((f) => ({ ...f, productSku: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="number"
            placeholder="Qty"
            value={form.qty}
            onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
          />
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
          >
            <option>Normal</option>
            <option>High</option>
            <option>Urgent</option>
            <option>Low</option>
          </select>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void create()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Create WO
          </button>
        </div>
      ) : null}

      {!loading && tab === 'orders' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['WO #', 'SKU', 'Qty', 'Priority', 'Status', 'Start', 'Act'].map((h) => (
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
                    No work orders yet.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link href={`/${locale}/os/manufacturing/${r.id}`} className="underline decoration-harvics-gold/50">
                        {r.workOrderNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.productSku}</td>
                    <td className="px-3 py-2 font-mono">{r.qty}</td>
                    <td className="px-3 py-2">{r.priority}</td>
                    <td className="px-3 py-2">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                        style={{ background: STATUS_COLOR[r.status] || '#666' }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-harvics-burgundy/60">{r.startDate || '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {(WO_NEXT[r.status] || []).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => void setStatus(r.id, s)}
                            className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase"
                          >
                            {s}
                          </button>
                        ))}
                        {!WO_NEXT[r.status]?.length ? <span className="text-harvics-burgundy/30">—</span> : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'board' ? (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(byStatus).map(([status, list]) => (
            <div key={status} className="border border-harvics-burgundy/15 bg-white">
              <div
                className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                style={{ background: STATUS_COLOR[status] || '#666' }}
              >
                {status} · {list.length}
              </div>
              <div className="space-y-2 p-2">
                {list.length === 0 ? (
                  <p className="px-1 py-4 text-center text-[12px] text-harvics-burgundy/40">Empty</p>
                ) : (
                  list.map((r) => (
                    <Link
                      key={r.id}
                      href={`/${locale}/os/manufacturing/${r.id}`}
                      className="block border border-harvics-burgundy/10 bg-harvics-cream/40 px-2 py-2 hover:border-harvics-gold/50"
                    >
                      <div className="font-mono text-[12px] font-semibold">{r.workOrderNo}</div>
                      <div className="text-[12px] text-harvics-burgundy/70">{r.productSku}</div>
                      <div className="text-[11px] text-harvics-burgundy/50">qty {r.qty}</div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
