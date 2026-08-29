'use client'

/**
 * Module #48 — Tax Engine (SAP+ workspace)
 * Tabs: Rates · Lookup · New
 * Workflow: Retire (set effectiveTo)
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'rates' | 'lookup' | 'new'

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

function isActive(r: any) {
  const now = Date.now()
  const from = r.effectiveFrom ? new Date(r.effectiveFrom).getTime() : 0
  const to = r.effectiveTo ? new Date(r.effectiveTo).getTime() : Infinity
  return from <= now && now <= to
}

export default function PlatformModuleFortyEight() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('rates')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({ country: 'AE', region: '', taxType: 'VAT', ratePercent: '5', notes: '' })
  const [lookup, setLookup] = useState({ country: 'AE', taxType: 'VAT', amount: '1000' })
  const [calc, setCalc] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/platform/tax/rates')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #48')
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
      await api('/api/platform/tax/rates', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          region: form.region || null,
          ratePercent: Number(form.ratePercent),
          notes: form.notes || null,
        }),
      })
      setForm({ country: 'AE', region: '', taxType: 'VAT', ratePercent: '5', notes: '' })
      setMessage('Tax rate added')
      await load()
      setTab('rates')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const doLookup = async () => {
    try {
      setError('')
      setMessage('')
      const j = await api(
        `/api/platform/tax/lookup?country=${lookup.country}&taxType=${lookup.taxType}&amount=${lookup.amount}`,
      )
      setCalc(j.data)
      setMessage('Lookup complete')
    } catch (e: any) {
      setError(e.message)
      setCalc(null)
    }
  }

  const retire = async (id: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/platform/tax/rates/${id}/retire`, { method: 'POST', body: '{}' })
      setMessage('Rate retired')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete rate?')) return
    try {
      setError('')
      await api(`/api/platform/tax/rates/${id}`, { method: 'DELETE' })
      setMessage('Rate deleted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const active = rows.filter(isActive).length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #48 · Platform</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Tax Engine
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ VAT/GST rates · live lookup · retire workflow.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Tax engine AI"
        subtitle="Spots missing jurisdictions and rate coverage gaps"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'tax', prompt: 'Advise on tax-rate coverage gaps and compliance risk.' }}
        cta="Advise tax"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          { label: 'Rates', value: rows.length },
          { label: 'Active', value: active },
          { label: 'Countries', value: new Set(rows.map((r) => r.country)).size },
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
            ['rates', 'Rates'],
            ['lookup', 'Lookup'],
            ['new', 'New'],
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
                {['Country', 'Type', 'Rate', 'Status', 'Act'].map((h) => (
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
                    <Link href={`/${locale}/os/tax-engine/${r.id}`} className="font-semibold underline">
                      {r.country}
                    </Link>
                    <div className="text-[11px] text-harvics-burgundy/50">{r.region || '—'}</div>
                  </td>
                  <td className="px-3 py-2">{r.taxType}</td>
                  <td className="px-3 py-2 font-mono font-semibold">{r.ratePercent}%</td>
                  <td className="px-3 py-2">{isActive(r) ? 'Active' : 'Retired'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {isActive(r) ? (
                        <button type="button" onClick={() => void retire(r.id)} className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream">
                          Retire
                        </button>
                      ) : null}
                      <button type="button" onClick={() => void remove(r.id)} className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]">
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No rates yet.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'lookup' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Live lookup</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={lookup.country} onChange={(e) => setLookup({ ...lookup, country: e.target.value.toUpperCase() })} placeholder="Country ISO-2" />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={lookup.taxType} onChange={(e) => setLookup({ ...lookup, taxType: e.target.value })}>
            {['VAT', 'GST', 'Sales', 'Excise', 'Withholding'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input type="number" className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={lookup.amount} onChange={(e) => setLookup({ ...lookup, amount: e.target.value })} placeholder="Amount" />
          <button type="button" onClick={() => void doLookup()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Calculate
          </button>
          {calc ? (
            <div className="border border-harvics-gold/40 bg-white p-3" style={{ borderLeft: '4px solid var(--harvics-gold)' }}>
              <div className="text-xs">
                {calc.country} {calc.taxType} {calc.ratePercent}% on {calc.amount}
              </div>
              <div className="mt-1 font-mono text-lg font-semibold">
                Tax {calc.tax} · Total {calc.total}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'new' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add rate</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })} placeholder="Country *" />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Region" />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.taxType} onChange={(e) => setForm({ ...form, taxType: e.target.value })}>
            {['VAT', 'GST', 'Sales', 'Excise', 'Withholding'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input type="number" className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.ratePercent} onChange={(e) => setForm({ ...form, ratePercent: e.target.value })} placeholder="Rate %" />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" />
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Add rate
          </button>
        </div>
      ) : null}
    </div>
  )
}
