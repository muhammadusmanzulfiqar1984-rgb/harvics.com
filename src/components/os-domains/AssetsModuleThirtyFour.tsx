'use client'

/**
 * Module #34 — Fixed Assets
 * DoD: asset register + maintenance logs via /api/v2/assets
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

export default function AssetsModuleThirtyFour() {
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [form, setForm] = useState({
    assetCode: '',
    name: '',
    category: 'Plant',
    location: '',
    purchaseDate: '',
    purchasePrice: '0',
    currency: 'USD',
  })
  const [mForm, setMForm] = useState({ type: 'Preventive', description: '', cost: '0', technician: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/v2/assets')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #34')
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
      if (!form.assetCode || !form.name) throw new Error('Code and name required')
      const r = await api('/api/v2/assets', {
        method: 'POST',
        body: JSON.stringify({
          assetCode: form.assetCode,
          name: form.name,
          category: form.category || null,
          location: form.location || null,
          purchaseDate: form.purchaseDate || null,
          purchasePrice: Number(form.purchasePrice) || 0,
          currency: form.currency,
          status: 'Active',
        }),
      })
      setForm({ assetCode: '', name: '', category: 'Plant', location: '', purchaseDate: '', purchasePrice: '0', currency: 'USD' })
      setMessage(`Asset ${r.data?.assetCode} registered`)
      setSel(r.data?.id || null)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addMaint = async () => {
    try {
      setError('')
      setMessage('')
      if (!sel) throw new Error('Select an asset')
      if (!mForm.description) throw new Error('Description required')
      await api(`/api/v2/assets/${sel}/maintenance`, {
        method: 'POST',
        body: JSON.stringify({
          type: mForm.type,
          description: mForm.description,
          cost: Number(mForm.cost) || 0,
          technician: mForm.technician || null,
        }),
      })
      setMForm({ type: 'Preventive', description: '', cost: '0', technician: '' })
      setMessage('Maintenance logged')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const retire = async (id: string) => {
    try {
      setError('')
      await api(`/api/v2/assets/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Retired' }) })
      setMessage('Asset retired')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const selected = rows.find((a) => a.id === sel)
  const book = rows.reduce((s, a) => s + (a.purchasePrice || 0), 0)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #34 · Asset & Maintenance</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Fixed Assets
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ register · maintenance logs · Active→Retired · audited.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Asset health AI"
        subtitle="Prioritises inactive assets and maintenance debt"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'assets', prompt: 'Advise on fixed-asset register health and maintenance follow-ups.' }}
        cta="Advise assets"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Assets', value: rows.length },
          { label: 'Active', value: rows.filter((a) => a.status === 'Active').length },
          { label: 'In maintenance', value: rows.filter((a) => a.status === 'InMaintenance').length },
          { label: 'Book value', value: `$${book.toLocaleString()}` },
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
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Register asset</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Asset code *" value={form.assetCode} onChange={(e) => setForm((f) => ({ ...f, assetCode: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {['Plant', 'Vehicle', 'IT', 'Furniture', 'Tooling'].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="date" value={form.purchaseDate} onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Purchase price" value={form.purchasePrice} onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value }))} />
            <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Register
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'Name', 'Cat', 'Location', 'Price', 'Status', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">No assets yet.</td></tr>
                ) : (
                  rows.map((a, i) => (
                    <tr key={a.id} className={`${i % 2 ? 'bg-harvics-cream/40' : 'bg-white'} ${sel === a.id ? 'outline outline-1 outline-harvics-gold' : ''} cursor-pointer`} onClick={() => setSel(a.id)}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link href={`/${locale}/os/assets/${a.id}`} className="underline decoration-harvics-gold/50" onClick={(e) => e.stopPropagation()}>
                          {a.assetCode}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{a.name}</td>
                      <td className="px-3 py-2">{a.category || '—'}</td>
                      <td className="px-3 py-2">{a.location || '—'}</td>
                      <td className="px-3 py-2 font-mono">{a.currency} {Number(a.purchasePrice || 0).toLocaleString()}</td>
                      <td className="px-3 py-2">{a.status}</td>
                      <td className="px-3 py-2">
                        {a.status !== 'Retired' ? (
                          <button type="button" onClick={(e) => { e.stopPropagation(); void retire(a.id) }} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                            Retire
                          </button>
                        ) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {selected ? (
              <div className="border-t border-harvics-burgundy/15 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Maintenance — {selected.assetCode}</p>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <select className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm" value={mForm.type} onChange={(e) => setMForm((f) => ({ ...f, type: e.target.value }))}>
                    {['Preventive', 'Corrective', 'Emergency'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm md:col-span-2" placeholder="Description *" value={mForm.description} onChange={(e) => setMForm((f) => ({ ...f, description: e.target.value }))} />
                  <button type="button" onClick={() => void addMaint()} className="bg-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream">
                    Log
                  </button>
                </div>
                <ul className="mt-3 space-y-1 text-xs">
                  {(selected.maintenances || []).length === 0 ? <li className="text-harvics-burgundy/45">No logs.</li> : null}
                  {(selected.maintenances || []).map((m: any) => (
                    <li key={m.id}>{m.type} · {m.description} · {m.currency} {m.cost} · {m.technician || '—'}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
