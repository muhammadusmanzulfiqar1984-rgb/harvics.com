'use client'

/**
 * Module #14 — Vendor Management (SAP+ workspace)
 * Tabs: Scorecards · By recommendation · Score vendor
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'scorecards' | 'promote' | 'warn' | 'score'

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

const REC_COLOR: Record<string, string> = {
  Promote: '#2E7D32',
  Maintain: '#1565C0',
  Warn: '#E65100',
  Drop: '#B71C1C',
}

export default function ProcurementModuleFourteen() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('scorecards')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    vendorId: '',
    vendorName: '',
    period: '2026-Q3',
    onTimePercent: 90,
    qualityScore: 85,
    priceScore: 75,
    responseScore: 80,
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave3/vendors/scorecards')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #14')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const overallPreview = +((form.onTimePercent + form.qualityScore + form.priceScore + form.responseScore) / 4).toFixed(1)

  const create = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.vendorId) throw new Error('Vendor ID required')
      const r = await api('/api/wave3/vendors/scorecards', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm({
        vendorId: '',
        vendorName: '',
        period: form.period,
        onTimePercent: 90,
        qualityScore: 85,
        priceScore: 75,
        responseScore: 80,
      })
      setMessage(`${r.data?.vendorName || r.data?.vendorId} · ${r.data?.recommendation} (${r.data?.overallScore})`)
      await load()
      setTab('scorecards')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const recCount = (k: string) => rows.filter((r) => r.recommendation === k).length

  const filtered = useMemo(() => {
    if (tab === 'promote') return rows.filter((r) => r.recommendation === 'Promote' || r.recommendation === 'Maintain')
    if (tab === 'warn') return rows.filter((r) => r.recommendation === 'Warn' || r.recommendation === 'Drop')
    return rows
  }, [rows, tab])

  const renderTable = (list: any[]) => (
    <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-harvics-burgundy text-left text-harvics-cream">
            {['Vendor', 'Period', 'On-time', 'Quality', 'Price', 'Response', 'Overall', 'Recommend'].map((h) => (
              <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-harvics-burgundy/45">
                No scorecards in this view.
              </td>
            </tr>
          ) : (
            list.map((r, i) => (
              <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                <td className="px-3 py-2 font-semibold">
                  <Link href={`/${locale}/os/vendor-scorecards/${r.id}`} className="underline decoration-harvics-gold/50">
                    {r.vendorName || r.vendorId}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.period}</td>
                <td className="px-3 py-2 font-mono">{r.onTimePercent}%</td>
                <td className="px-3 py-2 font-mono">{r.qualityScore}</td>
                <td className="px-3 py-2 font-mono">{r.priceScore}</td>
                <td className="px-3 py-2 font-mono">{r.responseScore}</td>
                <td className="px-3 py-2 font-mono text-lg font-semibold">{Number(r.overallScore).toFixed(1)}</td>
                <td className="px-3 py-2">
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                    style={{ background: REC_COLOR[r.recommendation] || '#666' }}
                  >
                    {r.recommendation}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #14 · Procurement</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Vendor Scorecards
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            On-time, quality, price, response — overall score and Promote / Maintain / Warn / Drop.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/rfq`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            RFQs
          </Link>
          <Link
            href={`/${locale}/os/sourcing`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Sourcing
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
        title="Vendor scorecard coach"
        subtitle="Flags weak suppliers before the next PO — not just a score table"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'vendors' }}
        cta="Advise vendors"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ['Scorecards', rows.length, '#3D1212'],
          ['Promote', recCount('Promote'), '#2E7D32'],
          ['Maintain', recCount('Maintain'), '#1565C0'],
          ['Warn', recCount('Warn'), '#E65100'],
          ['Drop', recCount('Drop'), '#B71C1C'],
        ].map(([label, n, color]) => (
          <div key={String(label)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: `3px solid ${color}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{n}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['scorecards', 'All scorecards'],
            ['promote', 'Promote / Maintain'],
            ['warn', 'Warn / Drop'],
            ['score', 'Score vendor'],
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

      {!loading && tab === 'score' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Score vendor</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Vendor ID *"
            value={form.vendorId}
            onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Vendor name"
            value={form.vendorName}
            onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Period (e.g. 2026-Q3)"
            value={form.period}
            onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
          />
          {(
            [
              ['onTimePercent', 'On-time %'],
              ['qualityScore', 'Quality'],
              ['priceScore', 'Price'],
              ['responseScore', 'Response'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-[11px] font-semibold">
              {label} · {form[key]}
              <input
                type="range"
                min={0}
                max={100}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                className="mt-1 w-full"
              />
            </label>
          ))}
          <div className="border-l-4 border-harvics-gold bg-white px-3 py-2 text-sm">
            Overall preview: <strong className="font-mono text-lg">{overallPreview}</strong>
          </div>
          <button
            type="button"
            onClick={() => void create()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Save score
          </button>
        </div>
      ) : null}

      {!loading && tab !== 'score' ? renderTable(filtered) : null}
    </div>
  )
}
