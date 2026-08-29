'use client'

/**
 * Module #49 — FX Engine (SAP+ workspace)
 * Tabs: Rates · Convert · Post
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'rates' | 'convert' | 'post'

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

export default function PlatformModuleFortyNine() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('rates')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    fromCcy: 'USD',
    toCcy: 'AED',
    rate: '3.6725',
    effectiveDate: new Date().toISOString().slice(0, 10),
    source: 'manual',
  })
  const [conv, setConv] = useState({ from: 'USD', to: 'AED', amount: '1000' })
  const [result, setResult] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/v2/treasury/fx-rates')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #49')
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
      if (!form.fromCcy || !form.toCcy || !form.rate) throw new Error('From/To/Rate required')
      await api('/api/v2/treasury/fx-rates', {
        method: 'POST',
        body: JSON.stringify({
          fromCcy: form.fromCcy.toUpperCase(),
          toCcy: form.toCcy.toUpperCase(),
          rate: Number(form.rate),
          effectiveDate: form.effectiveDate,
          source: form.source || null,
        }),
      })
      setForm({ ...form, rate: '', source: 'manual' })
      setMessage('FX rate posted')
      await load()
      setTab('rates')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const convert = async () => {
    try {
      setError('')
      setMessage('')
      const j = await api(
        `/api/v2/treasury/fx-convert?from=${conv.from}&to=${conv.to}&amount=${conv.amount}`,
      )
      setResult(j.data)
      setMessage('Converted')
    } catch (e: any) {
      setError(e.message)
      setResult(null)
    }
  }

  const pairs = new Set(rows.map((r) => `${r.fromCcy}/${r.toCcy}`)).size

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #49 · Platform</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            FX Engine
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ spot rates · convert · effective dating.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="FX exposure AI"
        subtitle="Highlights stale pairs and volatility watchlist"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'fx', prompt: 'Advise on FX rate freshness and exposure watchpoints.' }}
        cta="Advise FX"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          { label: 'Rates', value: rows.length },
          { label: 'Pairs', value: pairs },
          { label: 'Latest', value: rows[0] ? `${rows[0].fromCcy}/${rows[0].toCcy}` : '—' },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 truncate font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['rates', 'Rates'],
            ['convert', 'Convert'],
            ['post', 'Post'],
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

      {!loading && tab === 'rates' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Pair', 'Rate', 'Effective', 'Source'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-harvics-burgundy/10">
                  <td className="px-3 py-2">
                    <Link href={`/${locale}/os/fx-engine/${r.id}`} className="font-semibold underline">
                      {r.fromCcy}/{r.toCcy}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono font-semibold">{r.rate}</td>
                  <td className="px-3 py-2 text-xs">{r.effectiveDate}</td>
                  <td className="px-3 py-2 text-xs">{r.source || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No FX rates yet.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'convert' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Convert</p>
          <div className="grid grid-cols-2 gap-2">
            <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={conv.from} onChange={(e) => setConv({ ...conv, from: e.target.value.toUpperCase() })} placeholder="From" />
            <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={conv.to} onChange={(e) => setConv({ ...conv, to: e.target.value.toUpperCase() })} placeholder="To" />
          </div>
          <input type="number" className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={conv.amount} onChange={(e) => setConv({ ...conv, amount: e.target.value })} placeholder="Amount" />
          <button type="button" onClick={() => void convert()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Convert
          </button>
          {result ? (
            <div className="border border-harvics-gold/40 bg-white p-3">
              <div className="font-mono text-lg font-semibold">{result.converted}</div>
              <div className="text-xs text-harvics-burgundy/60">
                @ {result.rate} · {result.effectiveDate || '1:1'}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'post' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Post rate</p>
          <div className="grid grid-cols-2 gap-2">
            <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.fromCcy} onChange={(e) => setForm({ ...form, fromCcy: e.target.value.toUpperCase() })} placeholder="From *" />
            <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.toCcy} onChange={(e) => setForm({ ...form, toCcy: e.target.value.toUpperCase() })} placeholder="To *" />
          </div>
          <input type="number" className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="Rate *" />
          <input type="date" className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source" />
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Post rate
          </button>
        </div>
      ) : null}
    </div>
  )
}
