'use client'
/** Module #61 — Trade Floor (SAP+) Tabs: Instruments · Book · Trades */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'
type Tab = 'instruments' | 'book' | 'trades'
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
export default function UniverseModuleSixtyOne() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('instruments')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [insts, setInsts] = useState<any[]>([])
  const [pick, setPick] = useState('')
  const [book, setBook] = useState<any>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [newInst, setNewInst] = useState({ symbol: '', name: '', category: 'Commodity', lastPrice: 100 })
  const [order, setOrder] = useState({ traderId: '', side: 'buy', price: 0, qty: 1 })
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const r = await api('/api/wave7/instruments')
      setInsts(r.data || [])
      const sym = pick || r.data?.[0]?.symbol || ''
      if (!pick && sym) setPick(sym)
      setTrades((await api(`/api/wave7/trades${sym ? '?symbol=' + sym : ''}`)).data || [])
      if (sym) setBook(await api(`/api/wave7/instruments/${sym}/orderbook`))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [pick])
  useEffect(() => { void load() }, [load])
  const create = async () => {
    try {
      setError(''); setMessage('')
      if (!newInst.symbol || !newInst.name) throw new Error('Symbol + name required')
      await api('/api/wave7/instruments', { method: 'POST', body: JSON.stringify(newInst) })
      setNewInst({ ...newInst, symbol: '', name: '' }); setMessage('Instrument listed'); await load()
    } catch (e: any) { setError(e.message) }
  }
  const place = async () => {
    try {
      setError(''); setMessage('')
      if (!pick || !order.traderId) throw new Error('Instrument + trader required')
      const r = await api('/api/wave7/orders', { method: 'POST', body: JSON.stringify({ ...order, symbol: pick }) })
      setMessage(r.message || 'Order placed'); await load(); setTab('book')
    } catch (e: any) { setError(e.message) }
  }
  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #61 · Universe</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >Trade Floor</h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ instruments · order book · matching · audited fills.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Refresh</button>
      </div>
      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Trade floor AI"
        subtitle="Highlights instrument liquidity and risk outliers"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'trade-floor', prompt: 'Advise on trade-floor instrument priorities and risk.' }}
        cta="Advise trade floor"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: 'Instruments', value: insts.length }, { label: 'Pick', value: pick || '—' }, { label: 'Bids', value: book?.bids?.length ?? 0 }, { label: 'Trades', value: trades.length }].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {([['instruments','Instruments'],['book','Book / Order'],['trades','Trades']] as const).map(([id,label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${tab===id?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy/25'}`}>{label}</button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
      {!loading && tab === 'instruments' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New instrument</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Symbol *" value={newInst.symbol} onChange={(e) => setNewInst({ ...newInst, symbol: e.target.value.toUpperCase() })} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={newInst.name} onChange={(e) => setNewInst({ ...newInst, name: e.target.value })} />
            <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">+ List</button>
          </div>
          <div className="overflow-auto border border-harvics-burgundy/15 bg-white lg:col-span-2">
            <table className="w-full border-collapse text-left text-[12px]">
              <thead><tr className="bg-harvics-burgundy text-harvics-cream"><th className="p-2">Symbol</th><th className="p-2">Name</th><th className="p-2">Last</th><th className="p-2" /></tr></thead>
              <tbody>
                {insts.map((i) => (
                  <tr key={i.id} className="border-b border-harvics-burgundy/10">
                    <td className="p-2 font-mono font-semibold"><Link href={`/${locale}/os/trade-floor/${i.symbol}`} className="underline">{i.symbol}</Link></td>
                    <td className="p-2">{i.name}</td>
                    <td className="p-2 font-mono">{i.lastPrice}</td>
                    <td className="p-2"><button type="button" className="border border-harvics-burgundy px-2 py-0.5 text-[10px] font-bold uppercase" onClick={() => { setPick(i.symbol); setTab('book') }}>Book</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {!loading && tab === 'book' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Place order · {pick || '—'}</p>
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={pick} onChange={(e) => setPick(e.target.value)}>
              {insts.map((i) => <option key={i.id} value={i.symbol}>{i.symbol}</option>)}
            </select>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Trader ID *" value={order.traderId} onChange={(e) => setOrder({ ...order, traderId: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <select className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={order.side} onChange={(e) => setOrder({ ...order, side: e.target.value })}><option value="buy">buy</option><option value="sell">sell</option></select>
              <input type="number" className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Price" value={order.price || ''} onChange={(e) => setOrder({ ...order, price: +e.target.value })} />
              <input type="number" className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Qty" value={order.qty} onChange={(e) => setOrder({ ...order, qty: +e.target.value })} />
            </div>
            <button type="button" onClick={() => void place()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">{order.side === 'buy' ? 'Bid' : 'Ask'}</button>
          </div>
          <div className="border border-harvics-burgundy/15 bg-white p-4">
            <div className="mb-2 text-[11px] font-bold uppercase">Order book · last {book?.instrument?.lastPrice ?? '—'} · spread {book?.spread ?? '—'}</div>
            <div className="mb-1 text-[10px] font-bold uppercase text-red-800">Asks</div>
            {(book?.asks || []).slice(0, 5).map((o: any) => <div key={o.id} className="flex justify-between font-mono text-[12px] text-red-800"><span>{o.price}</span><span>{o.qty}</span></div>)}
            <div className="mb-1 mt-3 text-[10px] font-bold uppercase text-green-800">Bids</div>
            {(book?.bids || []).slice(0, 5).map((o: any) => <div key={o.id} className="flex justify-between font-mono text-[12px] text-green-800"><span>{o.price}</span><span>{o.qty}</span></div>)}
          </div>
        </div>
      ) : null}
      {!loading && tab === 'trades' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead><tr className="bg-harvics-burgundy text-harvics-cream"><th className="p-2">When</th><th className="p-2">Sym</th><th className="p-2">Price</th><th className="p-2">Qty</th><th className="p-2">Buyer</th><th className="p-2">Seller</th></tr></thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 text-[11px]">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="p-2 font-semibold">{t.instrument?.symbol}</td>
                  <td className="p-2 font-mono">{t.price}</td>
                  <td className="p-2 font-mono">{t.qty}</td>
                  <td className="p-2 text-[11px]">{t.buyerId}</td>
                  <td className="p-2 text-[11px]">{t.sellerId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
