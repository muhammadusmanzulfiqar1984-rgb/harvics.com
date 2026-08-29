'use client'
/** Module #65 — Crypto Lite (SAP+) Tabs: Market · Trade · Portfolio */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'
type Tab = 'market' | 'trade' | 'portfolio'
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
const ME = 'demo-trader'
export default function UniverseModuleSixtyFive() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('market')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [assets, setAssets] = useState<any[]>([])
  const [portfolio, setPortfolio] = useState<any>(null)
  const [newA, setNewA] = useState({ symbol: '', name: '', priceUsd: 0, change24h: 0 })
  const [trade, setTrade] = useState({ symbol: '', side: 'buy', qty: 0 })
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      setAssets((await api('/api/wave7/crypto/assets')).data || [])
      setPortfolio(await api(`/api/wave7/crypto/portfolio/${ME}`))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const create = async () => {
    try {
      setError(''); setMessage('')
      if (!newA.symbol || !newA.name || newA.priceUsd <= 0) throw new Error('All fields required')
      await api('/api/wave7/crypto/assets', { method: 'POST', body: JSON.stringify(newA) })
      setNewA({ ...newA, symbol: '', name: '' }); setMessage('Asset listed'); await load()
    } catch (e: any) { setError(e.message) }
  }
  const exec = async () => {
    try {
      setError(''); setMessage('')
      if (!trade.symbol || trade.qty <= 0) throw new Error('Pick asset + qty')
      const r = await api('/api/wave7/crypto/trade', { method: 'POST', body: JSON.stringify({ ...trade, userId: ME }) })
      setMessage(r.realisedPnl != null ? `SELL · P&L ${r.realisedPnl}` : `BUY · holding ${r.holding?.qty}`)
      await load(); setTab('portfolio')
    } catch (e: any) { setError(e.message) }
  }
  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #65 · Universe</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >Crypto Lite</h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ sandbox assets · buy/sell · portfolio P&L · audited trades.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Refresh</button>
      </div>
      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Crypto lite AI"
        subtitle="Flags portfolio concentration and trade anomalies"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'crypto', prompt: 'Advise on crypto-lite portfolio risk and recent trade patterns.' }}
        cta="Advise crypto"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: 'Assets', value: assets.length }, { label: 'Value', value: portfolio?.totalValue ?? 0 }, { label: 'Cost', value: portfolio?.totalCost ?? 0 }, { label: 'P&L', value: portfolio?.totalPnl ?? 0 }].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {([['market','Market'],['trade','Trade'],['portfolio','Portfolio']] as const).map(([id,label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${tab===id?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy/25'}`}>{label}</button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
      {!loading && tab === 'market' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">List asset</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Symbol *" value={newA.symbol} onChange={(e) => setNewA({ ...newA, symbol: e.target.value.toUpperCase() })} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={newA.name} onChange={(e) => setNewA({ ...newA, name: e.target.value })} />
            <input type="number" className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Price USD *" value={newA.priceUsd || ''} onChange={(e) => setNewA({ ...newA, priceUsd: +e.target.value })} />
            <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">+ List</button>
          </div>
          <div className="overflow-auto border border-harvics-burgundy/15 bg-white lg:col-span-2">
            <table className="w-full border-collapse text-left text-[12px]">
              <thead><tr className="bg-harvics-burgundy text-harvics-cream"><th className="p-2">Sym</th><th className="p-2">Name</th><th className="p-2">Price</th><th className="p-2">24h</th></tr></thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.id} className="border-b border-harvics-burgundy/10">
                    <td className="p-2 font-mono font-semibold"><Link href={`/${locale}/os/crypto/${a.symbol}`} className="underline">{a.symbol}</Link></td>
                    <td className="p-2">{a.name}</td>
                    <td className="p-2 font-mono">${a.priceUsd}</td>
                    <td className="p-2 font-mono">{a.change24h}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {!loading && tab === 'trade' ? (
        <div className="max-w-md space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Execute · {ME}</p>
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={trade.symbol} onChange={(e) => setTrade({ ...trade, symbol: e.target.value })}>
            <option value="">— asset —</option>
            {assets.map((a) => <option key={a.id} value={a.symbol}>{a.symbol}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={trade.side} onChange={(e) => setTrade({ ...trade, side: e.target.value })}><option value="buy">buy</option><option value="sell">sell</option></select>
            <input type="number" className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Qty" value={trade.qty || ''} onChange={(e) => setTrade({ ...trade, qty: +e.target.value })} />
          </div>
          <button type="button" onClick={() => void exec()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">{trade.side === 'buy' ? 'Buy' : 'Sell'}</button>
        </div>
      ) : null}
      {!loading && tab === 'portfolio' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead><tr className="bg-harvics-burgundy text-harvics-cream"><th className="p-2">Sym</th><th className="p-2">Qty</th><th className="p-2">Avg</th><th className="p-2">Mkt</th><th className="p-2">Value</th><th className="p-2">P&L</th></tr></thead>
            <tbody>
              {(portfolio?.data || []).map((h: any) => (
                <tr key={h.symbol} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 font-semibold">{h.symbol}</td>
                  <td className="p-2 font-mono">{h.qty}</td>
                  <td className="p-2 font-mono">{h.avgCostUsd}</td>
                  <td className="p-2 font-mono">{h.currentPriceUsd}</td>
                  <td className="p-2 font-mono">{h.value}</td>
                  <td className="p-2 font-mono">{h.unrealisedPnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(portfolio?.data || []).length === 0 ? <p className="py-8 text-center text-sm text-harvics-burgundy/50">No holdings.</p> : null}
        </div>
      ) : null}
    </div>
  )
}
