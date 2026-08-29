'use client'
/** Module #60 — Marketplace (SAP+) Tabs: Listings · New · Sold */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'
type Tab = 'listings' | 'new' | 'sold'
function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}
export default function UniverseModuleSixty() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('listings')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [buy, setBuy] = useState<Record<string, number>>({})
  const [form, setForm] = useState({ sellerId: 'demo-seller', sellerName: 'Demo Seller', title: '', description: '', category: '', price: 0, currency: 'USD', qtyAvailable: 1 })
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setRows((await api('/api/wave6/listings')).data || []) } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const create = async () => {
    try {
      setError(''); setMessage('')
      if (!form.title || form.price <= 0) throw new Error('Title + price required')
      await api('/api/wave6/listings', { method: 'POST', body: JSON.stringify(form) })
      setForm({ ...form, title: '', description: '' }); setMessage('Listing created'); await load(); setTab('listings')
    } catch (e: any) { setError(e.message) }
  }
  const purchase = async (id: string) => {
    try {
      setError(''); setMessage('')
      const r = await api(`/api/wave6/listings/${id}/purchase`, { method: 'POST', body: JSON.stringify({ qty: buy[id] || 1, buyerId: 'demo-buyer' }) })
      setMessage(`Purchased · charged ${r.totalCharged}`); await load()
    } catch (e: any) { setError(e.message) }
  }
  const setStatus = async (id: string, status: string) => {
    try { setError(''); setMessage(''); await api(`/api/wave6/listings/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }); setMessage(`Status → ${status}`); await load() } catch (e: any) { setError(e.message) }
  }
  const active = rows.filter((r) => r.status === 'Active')
  const sold = rows.filter((r) => r.status === 'Sold' || r.status === 'Withdrawn')
  const view = tab === 'sold' ? sold : active
  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #60 · Universe</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >Marketplace</h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ listings · Active→Sold/Withdrawn · purchase audit.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Refresh</button>
      </div>
      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Marketplace AI"
        subtitle="Ranks listings that need attention or promotion"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'marketplace', prompt: 'Advise on marketplace listing health and conversion risks.' }}
        cta="Advise marketplace"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: 'Listings', value: rows.length }, { label: 'Active', value: active.length }, { label: 'Sold/Out', value: sold.length }, { label: 'GMV', value: rows.reduce((s, r) => s + (r.price || 0) * Math.max(0, (r.qtyAvailable === 0 ? 1 : 0)), 0) }].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {([['listings','Listings'],['new','New'],['sold','Sold / Withdrawn']] as const).map(([id,label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${tab===id?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy/25'}`}>{label}</button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
      {!loading && tab === 'new' ? (
        <div className="max-w-lg space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New listing</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Price" value={form.price || ''} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
            <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Ccy" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Qty" value={form.qtyAvailable} onChange={(e) => setForm({ ...form, qtyAvailable: +e.target.value })} />
          </div>
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">+ List</button>
        </div>
      ) : null}
      {!loading && tab !== 'new' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {view.map((l) => (
            <div key={l.id} className="border border-harvics-burgundy/15 bg-white p-4" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
              <div className="flex justify-between gap-2">
                <Link href={`/${locale}/os/marketplace/${l.id}`} className="font-semibold underline">{l.title}</Link>
                <span className="text-[10px] font-bold uppercase">{l.status}</span>
              </div>
              <div className="mt-1 text-[11px] text-harvics-burgundy/60">{l.category || '—'} · {l.sellerName}</div>
              <div className="mt-3 font-mono text-lg font-semibold">{l.currency} {l.price}</div>
              <div className="text-[11px]">{l.qtyAvailable} avail</div>
              {l.status === 'Active' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input type="number" min={1} className="w-16 border border-harvics-burgundy/20 px-2 py-1 text-sm" defaultValue={1} onChange={(e) => setBuy({ ...buy, [l.id]: +e.target.value })} />
                  <button type="button" onClick={() => void purchase(l.id)} className="bg-harvics-gold px-3 py-1 text-[10px] font-bold uppercase text-harvics-burgundy">Buy</button>
                  <button type="button" onClick={() => void setStatus(l.id, 'Withdrawn')} className="border border-harvics-burgundy px-3 py-1 text-[10px] font-bold uppercase">Withdraw</button>
                </div>
              ) : null}
            </div>
          ))}
          {view.length === 0 ? <p className="col-span-full py-8 text-center text-sm text-harvics-burgundy/50">No listings in this view.</p> : null}
        </div>
      ) : null}
    </div>
  )
}
