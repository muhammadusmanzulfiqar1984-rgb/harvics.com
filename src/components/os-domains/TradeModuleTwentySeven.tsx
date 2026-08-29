'use client'

/**
 * Module #27 — Trade & Customs (SAP+ workspace)
 * Tabs: HS codes · Duty calc · Add code
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'codes' | 'duty' | 'add'

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
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

export default function TradeModuleTwentySeven() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('codes')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [form, setForm] = useState({
    code: '',
    description: '',
    category: '',
    dutyPercent: '5',
    notes: '',
  })
  const [calc, setCalc] = useState({ code: '', cifValue: '' })
  const [duty, setDuty] = useState<any | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const path = q ? `/api/wave3/trade/hs-codes?q=${encodeURIComponent(q)}` : '/api/wave3/trade/hs-codes'
      const r = await api(path)
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #27')
    } finally {
      setLoading(false)
    }
  }, [q])

  useEffect(() => {
    void load()
  }, [load])

  const create = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.code || !form.description) throw new Error('Code and description required')
      const r = await api('/api/wave3/trade/hs-codes', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          description: form.description,
          category: form.category || null,
          dutyPercent: Number(form.dutyPercent) || 0,
          notes: form.notes || null,
        }),
      })
      setForm({ code: '', description: '', category: '', dutyPercent: '5', notes: '' })
      setMessage(`HS ${r.data?.code} saved`)
      await load()
      setTab('codes')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const runDuty = async () => {
    try {
      setError('')
      setMessage('')
      if (!calc.code || !calc.cifValue) throw new Error('HS code and CIF value required')
      const r = await api(
        `/api/wave3/trade/duty-calc?code=${encodeURIComponent(calc.code)}&cifValue=${encodeURIComponent(calc.cifValue)}`,
      )
      setDuty(r.data)
      setMessage(`Duty ${fmt(r.data?.duty)} · landed ${fmt(r.data?.landedCost)}`)
    } catch (e: any) {
      setError(e.message)
      setDuty(null)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #27 · Logistics</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Trade & Customs
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ HS code master and CIF duty calculator.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/shipping-trade`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Shipping
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
        title="Trade & customs coach"
        subtitle="HS/duty exposure before clearance"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'trade' }}
        cta="Advise trade"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          { label: 'HS codes', value: rows.length },
          {
            label: 'Avg duty %',
            value: rows.length ? (rows.reduce((s, r) => s + (r.dutyPercent || 0), 0) / rows.length).toFixed(1) : '0',
          },
          { label: 'Categories', value: new Set(rows.map((r) => r.category).filter(Boolean)).size },
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
            ['codes', 'HS codes'],
            ['duty', 'Duty calc'],
            ['add', 'Add code'],
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

      {!loading && tab === 'codes' ? (
        <div className="space-y-3">
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm md:max-w-md"
            placeholder="Search code or description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'Description', 'Category', 'Duty %', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No HS codes yet. Open Add code.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link
                          href={`/${locale}/os/import-export/hs/${r.id}`}
                          className="underline decoration-harvics-gold/50 underline-offset-2"
                        >
                          {r.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{r.description}</td>
                      <td className="px-3 py-2">{r.category || '—'}</td>
                      <td className="px-3 py-2 font-mono">{r.dutyPercent}%</td>
                      <td className="space-x-1 px-3 py-2">
                        <Link
                          href={`/${locale}/os/import-export/hs/${r.id}`}
                          className="border border-harvics-burgundy/20 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setCalc((c) => ({ ...c, code: r.code }))
                            setTab('duty')
                          }}
                          className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          Duty
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'duty' ? (
        <div className="mx-auto max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Duty calculator</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="HS code"
            value={calc.code}
            onChange={(e) => setCalc((c) => ({ ...c, code: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="number"
            placeholder="CIF value"
            value={calc.cifValue}
            onChange={(e) => setCalc((c) => ({ ...c, cifValue: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void runDuty()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Calculate
          </button>
          {duty ? (
            <div className="border border-harvics-gold/40 bg-white p-3 text-sm">
              <div className="text-[12px] text-harvics-burgundy/60">{duty.description}</div>
              <div className="mt-2">
                Duty: <strong className="font-mono">{fmt(duty.duty)}</strong> ({duty.dutyPercent}%)
              </div>
              <div className="mt-1">
                Landed: <strong className="font-mono">{fmt(duty.landedCost)}</strong>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'add' ? (
        <div className="mx-auto max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add HS code</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Code * e.g. 2202.10"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Description *"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="number"
            placeholder="Duty %"
            value={form.dutyPercent}
            onChange={(e) => setForm((f) => ({ ...f, dutyPercent: e.target.value }))}
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
            Save HS code
          </button>
        </div>
      ) : null}
    </div>
  )
}
