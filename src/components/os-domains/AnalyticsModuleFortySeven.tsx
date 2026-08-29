'use client'

/**
 * Module #47 — Professional Services (SAP+ workspace)
 * Tabs: Engagements · Time · New
 * Status: Active → OnHold|Completed|Cancelled
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'engagements' | 'time' | 'new'

const ENG_NEXT: Record<string, string[]> = {
  Active: ['OnHold', 'Completed', 'Cancelled'],
  OnHold: ['Active', 'Cancelled'],
  Completed: [],
  Cancelled: [],
}

type TimeDraft = {
  employeeId: string
  date: string
  hours: string
  rate: string
  description: string
  billable: boolean
}

const emptyTime = (): TimeDraft => ({
  employeeId: '',
  date: new Date().toISOString().slice(0, 10),
  hours: '',
  rate: '',
  description: '',
  billable: true,
})

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
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function AnalyticsModuleFortySeven() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('engagements')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [time, setTime] = useState<TimeDraft>(emptyTime())
  const [form, setForm] = useState({
    code: `ENG-${Date.now().toString().slice(-6)}`,
    clientName: '',
    title: '',
    type: 'TimeMaterial',
    budget: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    manager: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave5/engagements')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #47')
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
      if (!form.clientName || !form.title) throw new Error('Client and title required')
      const r = await api('/api/wave5/engagements', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget) || 0,
          endDate: form.endDate || null,
          manager: form.manager || null,
        }),
      })
      setForm({
        ...form,
        code: `ENG-${Date.now().toString().slice(-6)}`,
        clientName: '',
        title: '',
        budget: '',
      })
      setMessage(`Engagement ${r.data?.code} started`)
      await load()
      setTab('engagements')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave5/engagements/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Engagement → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const logTime = async () => {
    if (!sel) return
    try {
      setError('')
      setMessage('')
      if (!time.employeeId || !time.hours) throw new Error('Employee and hours required')
      await api(`/api/wave5/engagements/${sel}/time`, {
        method: 'POST',
        body: JSON.stringify({
          employeeId: time.employeeId,
          date: time.date,
          hours: Number(time.hours),
          rate: Number(time.rate) || 0,
          description: time.description || null,
          billable: time.billable,
        }),
      })
      setTime(emptyTime())
      setMessage('Time logged')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const active = rows.filter((r) => r.status === 'Active').length
  const selected = rows.find((r) => r.id === sel)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #47 · Services</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Professional Services
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ engagements · time entries · Active → OnHold | Completed | Cancelled.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="PSA utilisation AI"
        subtitle="Flags engagement margin and staffing risk"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'professional-services', prompt: 'Advise on professional-services engagement health and utilisation.' }}
        cta="Advise PSA"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Engagements', value: rows.length },
          { label: 'Active', value: active },
          { label: 'Budget', value: fmt(rows.reduce((s, r) => s + (r.budget || 0), 0)) },
          { label: 'Spent', value: fmt(rows.reduce((s, r) => s + (r.spent || 0), 0)) },
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
            ['engagements', 'Engagements'],
            ['time', 'Time'],
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

      {!loading && tab === 'engagements' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Code', 'Client', 'Budget / Spent', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-harvics-burgundy/10">
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link href={`/${locale}/os/professional-services/${r.id}`} className="font-semibold underline">
                      {r.code}
                    </Link>
                    <div className="text-[11px] text-harvics-burgundy/50">{r.title}</div>
                  </td>
                  <td className="px-3 py-2">{r.clientName}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {fmt(r.budget)} / {fmt(r.spent)}
                  </td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.status === 'Active' || r.status === 'OnHold' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSel(r.id)
                            setTab('time')
                          }}
                          className="border border-harvics-gold/50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                        >
                          Time
                        </button>
                      ) : null}
                      {(ENG_NEXT[r.status] || []).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void setStatus(r.id, s)}
                          className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No engagements yet.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'time' ? (
        <div className="max-w-lg space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Log time</p>
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={sel || ''} onChange={(e) => setSel(e.target.value || null)}>
            <option value="">Select engagement…</option>
            {rows
              .filter((r) => r.status === 'Active' || r.status === 'OnHold')
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} — {r.clientName}
                </option>
              ))}
          </select>
          {selected ? (
            <p className="text-xs text-harvics-burgundy/60">
              Spent {fmt(selected.spent)} of {fmt(selected.budget)}
            </p>
          ) : null}
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Employee ID *" value={time.employeeId} onChange={(e) => setTime((t) => ({ ...t, employeeId: e.target.value }))} />
          <div className="grid grid-cols-3 gap-2">
            <input type="date" className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={time.date} onChange={(e) => setTime((t) => ({ ...t, date: e.target.value }))} />
            <input type="number" className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Hours *" value={time.hours} onChange={(e) => setTime((t) => ({ ...t, hours: e.target.value }))} />
            <input type="number" className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Rate" value={time.rate} onChange={(e) => setTime((t) => ({ ...t, rate: e.target.value }))} />
          </div>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Description" value={time.description} onChange={(e) => setTime((t) => ({ ...t, description: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={time.billable} onChange={(e) => setTime((t) => ({ ...t, billable: e.target.checked }))} />
            Billable
          </label>
          <button type="button" onClick={() => void logTime()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Log time
          </button>
          {selected?.timeEntries?.length ? (
            <div className="mt-2 border-t border-harvics-burgundy/15 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Recent entries</p>
              <ul className="mt-1 space-y-1 text-xs">
                {selected.timeEntries.map((e: any) => (
                  <li key={e.id}>
                    {e.date?.slice?.(0, 10) || e.date} · {e.hours}h · {fmt(e.amount)} · {e.employeeId}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'new' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New engagement</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Code *" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Client *" value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            {['FixedFee', 'TimeMaterial', 'Retainer'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input type="number" className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Budget" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
          <input type="date" className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Create
          </button>
        </div>
      ) : null}
    </div>
  )
}
