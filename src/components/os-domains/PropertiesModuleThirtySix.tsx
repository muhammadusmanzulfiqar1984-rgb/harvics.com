'use client'

/**
 * Module #36 — Real Estate & Facilities (SAP+ workspace)
 * Tabs: Portfolio · Status board
 * Status: Active → Vacant|UnderRenovation|Sold
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'portfolio' | 'status'

const NEXT: Record<string, string[]> = {
  Active: ['Vacant', 'UnderRenovation', 'Sold'],
  Vacant: ['Active', 'UnderRenovation', 'Sold'],
  UnderRenovation: ['Active', 'Vacant'],
  Sold: [],
}

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

export default function PropertiesModuleThirtySix() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('portfolio')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'Office',
    address: '',
    sqft: '0',
    occupancyPct: '0',
    monthlyRent: '0',
    currency: 'USD',
    leaseEnd: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave5/properties')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #36')
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
      if (!form.code || !form.name) throw new Error('Code and name required')
      const r = await api('/api/wave5/properties', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          sqft: Number(form.sqft) || 0,
          occupancyPct: Number(form.occupancyPct) || 0,
          monthlyRent: Number(form.monthlyRent) || 0,
          leaseEnd: form.leaseEnd || null,
        }),
      })
      setForm({ ...form, code: '', name: '', address: '' })
      setMessage(`Property ${r.data?.code} registered`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/wave5/properties/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Property → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const totalSqft = rows.reduce((s, r) => s + (r.sqft || 0), 0)
  const totalRent = rows.reduce((s, r) => s + (r.monthlyRent || 0), 0)
  const avgOcc = rows.length ? rows.reduce((s, r) => s + (r.occupancyPct || 0), 0) / rows.length : 0

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #36 · Asset & Maintenance</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Real Estate & Facilities
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ portfolio · occupancy · lease · status machine.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Facilities AI"
        subtitle="Flags under-utilised properties and lease/ops risk"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'properties', prompt: 'Advise on real-estate and facilities portfolio priorities.' }}
        cta="Advise facilities"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Properties', value: rows.length },
          { label: 'Sqft', value: totalSqft.toLocaleString() },
          { label: 'Rent / mo', value: `$${totalRent.toLocaleString()}` },
          { label: 'Avg occ', value: `${avgOcc.toFixed(0)}%` },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['portfolio', 'Portfolio'],
            ['status', 'Status board'],
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

      {!loading && tab === 'portfolio' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New property</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Code *" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {['Office', 'Warehouse', 'Retail', 'Plant', 'Land'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Sqft" value={form.sqft} onChange={(e) => setForm((f) => ({ ...f, sqft: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Occupancy %" value={form.occupancyPct} onChange={(e) => setForm((f) => ({ ...f, occupancyPct: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Monthly rent" value={form.monthlyRent} onChange={(e) => setForm((f) => ({ ...f, monthlyRent: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="date" value={form.leaseEnd} onChange={(e) => setForm((f) => ({ ...f, leaseEnd: e.target.value }))} />
            <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Register
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'Name', 'Type', 'Sqft', 'Occ', 'Rent', 'Status'].map((h) => (
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
                      No properties.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link href={`/${locale}/os/properties/${r.id}`} className="underline decoration-harvics-gold/50">
                          {r.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2">{r.type}</td>
                      <td className="px-3 py-2 font-mono">{Number(r.sqft || 0).toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono">{r.occupancyPct}%</td>
                      <td className="px-3 py-2 font-mono">
                        {r.currency} {Number(r.monthlyRent || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{r.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'status' ? (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border border-harvics-burgundy/15 bg-white px-4 py-3">
              <div>
                <Link href={`/${locale}/os/properties/${r.id}`} className="font-mono font-semibold underline decoration-harvics-gold/50">
                  {r.code}
                </Link>
                <span className="ml-2">{r.name}</span>
                <span className="ml-2 text-xs text-harvics-burgundy/50">{r.status}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(NEXT[r.status] || []).map((s) => (
                  <button key={s} type="button" onClick={() => void setStatus(r.id, s)} className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase">
                    {s}
                  </button>
                ))}
                {!NEXT[r.status]?.length ? <span className="text-xs text-harvics-burgundy/40">Terminal</span> : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
