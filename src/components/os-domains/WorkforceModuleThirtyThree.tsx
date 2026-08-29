'use client'

/**
 * Module #33 — Workforce Planning (SAP+ workspace)
 * Tabs: Plans · Gap analysis
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'plans' | 'gaps'

const PERIOD = '2026-Q3'

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

export default function WorkforceModuleThirtyThree() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('plans')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    period: PERIOD,
    department: '',
    currentFte: '0',
    plannedFte: '0',
    attritionPct: '5',
    notes: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave5/headcount-plans?period=${PERIOD}`)
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #33')
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
      if (!form.department) throw new Error('Department required')
      const r = await api('/api/wave5/headcount-plans', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          currentFte: Number(form.currentFte) || 0,
          plannedFte: Number(form.plannedFte) || 0,
          attritionPct: Number(form.attritionPct) || 0,
        }),
      })
      setForm((f) => ({ ...f, department: '', notes: '' }))
      setMessage(`Plan ${r.data?.department} upserted · hire need ${r.data?.hiringNeed}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const totals = rows.reduce(
    (a, r) => ({ c: a.c + (r.currentFte || 0), p: a.p + (r.plannedFte || 0), h: a.h + (r.hiringNeed || 0) }),
    { c: 0, p: 0, h: 0 },
  )

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #33 · Human Capital</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Workforce Planning
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ headcount plans · attrition → hiring need · audited upserts.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Headcount gap AI"
        subtitle="Compares planned vs current HC and recommends hiring/redeploy moves"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'workforce', prompt: 'Analyse headcount plan gaps and recommend workforce actions.' }}
        cta="Advise workforce"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Departments', value: rows.length },
          { label: 'Current FTE', value: totals.c.toFixed(1) },
          { label: 'Planned FTE', value: totals.p.toFixed(1) },
          { label: 'Hiring need', value: totals.h.toFixed(1) },
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
            ['plans', 'Plans'],
            ['gaps', 'Gap analysis'],
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

      {!loading && tab === 'plans' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add / update plan</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Period" value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Department *" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Current FTE" value={form.currentFte} onChange={(e) => setForm((f) => ({ ...f, currentFte: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Planned FTE" value={form.plannedFte} onChange={(e) => setForm((f) => ({ ...f, plannedFte: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Attrition %" value={form.attritionPct} onChange={(e) => setForm((f) => ({ ...f, attritionPct: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Upsert plan
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Dept', 'Current', 'Planned', 'Attrition', 'Hire need', 'Doc'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No plans for {PERIOD}.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-semibold">
                        <Link href={`/${locale}/os/workforce/plans/${r.id}`} className="underline decoration-harvics-gold/50">
                          {r.department}
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-mono">{r.currentFte}</td>
                      <td className="px-3 py-2 font-mono">{r.plannedFte}</td>
                      <td className="px-3 py-2 font-mono">{r.attritionPct}%</td>
                      <td className="px-3 py-2 font-mono font-semibold">{r.hiringNeed}</td>
                      <td className="px-3 py-2 text-xs">{r.period}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'gaps' ? (
        <div className="space-y-2">
          {rows
            .slice()
            .sort((a, b) => (b.hiringNeed || 0) - (a.hiringNeed || 0))
            .map((r) => (
              <div key={r.id} className="flex items-center justify-between border border-harvics-burgundy/15 bg-white px-4 py-3">
                <div>
                  <Link href={`/${locale}/os/workforce/plans/${r.id}`} className="font-semibold underline decoration-harvics-gold/50">
                    {r.department}
                  </Link>
                  <p className="text-xs text-harvics-burgundy/50">
                    {r.currentFte} → {r.plannedFte} · attrition {r.attritionPct}%
                  </p>
                </div>
                <div className="font-mono text-lg font-semibold" style={{ color: r.hiringNeed > 0 ? 'var(--harvics-burgundy)' : undefined }}>
                  +{r.hiringNeed} FTE
                </div>
              </div>
            ))}
          {rows.length === 0 ? <p className="py-8 text-center text-sm text-harvics-burgundy/45">No gap data.</p> : null}
        </div>
      ) : null}
    </div>
  )
}
