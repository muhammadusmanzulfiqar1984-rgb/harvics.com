'use client'

/**
 * Module #35 — Plant Maintenance
 * DoD: PM work orders against assets via /api/wave5/pm-orders
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

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

export default function PlantMaintenanceModuleThirtyFive() {
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [form, setForm] = useState({
    woNo: `PM-${Date.now().toString().slice(-6)}`,
    assetId: '',
    type: 'Corrective',
    priority: 'Medium',
    description: '',
    assignedTo: '',
    scheduledAt: '',
  })
  const [done, setDone] = useState<Record<string, { laborHours: string; partsCost: string }>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [o, a] = await Promise.allSettled([api('/api/wave5/pm-orders'), api('/api/v2/assets')])
      if (o.status === 'fulfilled') setRows(o.value.data || [])
      else throw new Error(o.reason?.message || 'Failed to load PM orders')
      if (a.status === 'fulfilled') setAssets(a.value.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #35')
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
      if (!form.assetId || !form.description) throw new Error('Asset and description required')
      const r = await api('/api/wave5/pm-orders', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          scheduledAt: form.scheduledAt || null,
        }),
      })
      setForm({ ...form, woNo: `PM-${Date.now().toString().slice(-6)}`, description: '' })
      setMessage(`WO ${r.data?.woNo} created`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const complete = async (id: string) => {
    try {
      setError('')
      const d = done[id] || { laborHours: '0', partsCost: '0' }
      await api(`/api/wave5/pm-orders/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          laborHours: Number(d.laborHours) || 0,
          partsCost: Number(d.partsCost) || 0,
        }),
      })
      setMessage('Work order completed')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const advance = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/wave5/pm-orders/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`WO → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const open = rows.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled').length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #35 · Asset & Maintenance</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Plant Maintenance
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ WO Open→Assigned→InProgress→Completed · labor + parts · audited.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Predictive maintenance AI"
        subtitle="Prioritises overdue PM orders before failure — classic SAP PM is reactive"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'plant-maintenance', prompt: 'Run predictive maintenance triage: overdue and high-priority PM orders first.' }}
        cta="Advise PM"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Work orders', value: rows.length },
          { label: 'Open', value: open },
          { label: 'Assets', value: assets.length },
          { label: 'Cost booked', value: `$${rows.reduce((s, r) => s + (r.totalCost || 0), 0).toLocaleString()}` },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

      {!loading ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New work order</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="WO # *" value={form.woNo} onChange={(e) => setForm((f) => ({ ...f, woNo: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.assetId} onChange={(e) => setForm((f) => ({ ...f, assetId: e.target.value }))}>
              <option value="">Asset * ({assets.length})</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>
              ))}
            </select>
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {['Preventive', 'Corrective', 'Predictive', 'Emergency'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              {['Low', 'Medium', 'High', 'Critical'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Assigned to" value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Description *" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Create WO
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['WO', 'Asset', 'Type', 'Pri', 'Desc', 'Status', 'Cost', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-harvics-burgundy/45">No work orders yet.</td></tr>
                ) : (
                  rows.map((r, i) => {
                    const d = done[r.id] || { laborHours: String(r.laborHours || 0), partsCost: String(r.partsCost || 0) }
                    const a = assets.find((x) => x.id === r.assetId)
                    return (
                      <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono font-semibold">
                          <Link href={`/${locale}/os/plant-maintenance/${r.id}`} className="underline decoration-harvics-gold/50">
                            {r.woNo}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-xs">{a?.assetCode || r.assetId?.slice(-6)}</td>
                        <td className="px-3 py-2">{r.type}</td>
                        <td className="px-3 py-2">{r.priority}</td>
                        <td className="max-w-[20ch] truncate px-3 py-2">{r.description}</td>
                        <td className="px-3 py-2">{r.status}</td>
                        <td className="px-3 py-2 font-mono">{r.totalCost ? `$${r.totalCost}` : '—'}</td>
                        <td className="px-3 py-2">
                          {r.status !== 'Completed' && r.status !== 'Cancelled' ? (
                            <div className="flex flex-wrap items-center gap-1">
                              {r.status === 'Open' ? (
                                <button type="button" onClick={() => void advance(r.id, 'Assigned')} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                                  Assign
                                </button>
                              ) : null}
                              {(r.status === 'Open' || r.status === 'Assigned') ? (
                                <button type="button" onClick={() => void advance(r.id, 'InProgress')} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                                  Start
                                </button>
                              ) : null}
                              <input className="w-12 border border-harvics-burgundy/20 px-1 py-0.5 text-[11px]" type="number" placeholder="hrs" value={d.laborHours} onChange={(e) => setDone((x) => ({ ...x, [r.id]: { ...d, laborHours: e.target.value } }))} />
                              <input className="w-16 border border-harvics-burgundy/20 px-1 py-0.5 text-[11px]" type="number" placeholder="$parts" value={d.partsCost} onChange={(e) => setDone((x) => ({ ...x, [r.id]: { ...d, partsCost: e.target.value } }))} />
                              <button type="button" onClick={() => void complete(r.id)} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                                Done
                              </button>
                            </div>
                          ) : '—'}
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
    </div>
  )
}
