'use client'

/**
 * Module #32 — Performance & Succession (SAP+ workspace)
 * Tabs: Reviews · 9-box
 * Status: Draft → Submitted → Acknowledged → Closed
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'reviews' | 'ninebox'

const PERIOD = '2026-H1'
const NEXT: Record<string, string[]> = {
  Draft: ['Submitted'],
  Submitted: ['Acknowledged', 'Draft'],
  Acknowledged: ['Closed'],
  Closed: [],
}

const BOX_COLORS: Record<string, string> = {
  'High/High': 'bg-harvics-burgundy text-harvics-cream',
  'High/Mid': 'bg-harvics-burgundy/80 text-harvics-cream',
  'High/Low': 'bg-harvics-gold/80 text-harvics-burgundy',
  'Mid/High': 'bg-harvics-burgundy/70 text-harvics-cream',
  'Mid/Mid': 'bg-harvics-cream border border-harvics-burgundy/30',
  'Mid/Low': 'bg-harvics-gold/40 text-harvics-burgundy',
  'Low/High': 'bg-harvics-burgundy/60 text-harvics-cream',
  'Low/Mid': 'bg-harvics-gold/50 text-harvics-burgundy',
  'Low/Low': 'bg-harvics-burgundy/40 text-harvics-cream',
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

export default function PerformanceModuleThirtyTwo() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('reviews')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [box, setBox] = useState<Record<string, any[]>>({})
  const [form, setForm] = useState({
    employeeId: '',
    period: PERIOD,
    reviewer: '',
    selfRating: '3',
    mgrRating: '3',
    strengths: '',
    improvements: '',
    potential: 'Hold',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [r, b] = await Promise.all([
        api(`/api/wave5/perf-reviews?period=${PERIOD}`),
        api(`/api/wave5/perf-9box?period=${PERIOD}`),
      ])
      setRows(r.data || [])
      setBox(b.data || {})
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #32')
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
      if (!form.employeeId) throw new Error('Employee required')
      const r = await api('/api/wave5/perf-reviews', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          selfRating: Number(form.selfRating) || 0,
          mgrRating: Number(form.mgrRating) || 0,
        }),
      })
      setForm((f) => ({ ...f, employeeId: '', strengths: '', improvements: '' }))
      setMessage(`Review ${r.data?.employeeId} drafted`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/wave5/perf-reviews/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Review → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #32 · Human Capital</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Performance & Succession
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ reviews with auto score · 9-box · Draft→Closed workflow.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Performance risk AI"
        subtitle="Highlights overdue reviews and succession gaps"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'performance', prompt: 'Triage open performance reviews and flag succession risk.' }}
        cta="Advise performance"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Reviews', value: rows.length },
          { label: 'Draft', value: rows.filter((r) => r.status === 'Draft').length },
          { label: 'Submitted', value: rows.filter((r) => r.status === 'Submitted').length },
          { label: 'Promote', value: rows.filter((r) => r.potential === 'Promote').length },
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
            ['reviews', 'Reviews'],
            ['ninebox', '9-box'],
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

      {!loading && tab === 'reviews' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New review</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Employee ID *" value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Period" value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Reviewer" value={form.reviewer} onChange={(e) => setForm((f) => ({ ...f, reviewer: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Self 0-5" value={form.selfRating} onChange={(e) => setForm((f) => ({ ...f, selfRating: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Mgr 0-5" value={form.mgrRating} onChange={(e) => setForm((f) => ({ ...f, mgrRating: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.potential} onChange={(e) => setForm((f) => ({ ...f, potential: e.target.value }))}>
              {['Promote', 'Stretch', 'Hold', 'PIP'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Create review
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Employee', 'Score', 'Potential', 'Status', 'Act'].map((h) => (
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
                      No reviews.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-semibold">
                        <Link href={`/${locale}/os/performance/reviews/${r.id}`} className="underline decoration-harvics-gold/50">
                          {r.employeeId}
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-mono">{r.overallScore}</td>
                      <td className="px-3 py-2">{r.potential}</td>
                      <td className="px-3 py-2">{r.status}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(NEXT[r.status] || []).map((s) => (
                            <button key={s} type="button" onClick={() => void setStatus(r.id, s)} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                              {s}
                            </button>
                          ))}
                          {!NEXT[r.status]?.length ? '—' : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'ninebox' ? (
        <div className="grid grid-cols-3 gap-2">
          {['High', 'Mid', 'Low'].flatMap((pot) =>
            ['High', 'Mid', 'Low'].map((perf) => {
              const k = `${pot}/${perf}`
              const list = box[k] || []
              return (
                <div key={k} className={`min-h-[100px] p-3 text-xs ${BOX_COLORS[k] || 'bg-harvics-cream'}`}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
                    {k} ({list.length})
                  </div>
                  {list.slice(0, 5).map((p, i) => (
                    <div key={i} className="mt-1 border-t border-white/20 pt-1">
                      {p.id ? (
                        <Link href={`/${locale}/os/performance/reviews/${p.id}`} className="underline">
                          {p.employeeId}
                        </Link>
                      ) : (
                        p.employeeId
                      )}{' '}
                      · {p.score}
                    </div>
                  ))}
                </div>
              )
            }),
          )}
        </div>
      ) : null}
    </div>
  )
}
