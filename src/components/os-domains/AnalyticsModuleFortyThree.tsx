'use client'

/**
 * Module #43 — OKR Tracking (SAP+ workspace)
 * Tabs: OKRs · Check-in · New
 * Status: On Track | At Risk | Behind | Completed
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'okrs' | 'checkin' | 'new'

const STATUS_COLOR: Record<string, string> = {
  'On Track': '#2E7D32',
  'At Risk': '#B8860B',
  Behind: '#B71C1C',
  Completed: '#3D1212',
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

export default function AnalyticsModuleFortyThree() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('okrs')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [avg, setAvg] = useState(0)
  const [form, setForm] = useState({ objective: '', owner: '', keyResults: 3, period: '2026-H1' })
  const [checkin, setCheckin] = useState<{ id: string; progress: number; completed: number } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/t14/okr')
      setRows(r.data || [])
      setAvg(r.summary?.avgProgress || 0)
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #43')
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
      if (!form.objective || !form.owner) throw new Error('Objective and owner required')
      const r = await api('/api/t14/okr', {
        method: 'POST',
        body: JSON.stringify({
          objective: form.objective,
          owner: form.owner,
          keyResults: Number(form.keyResults) || 1,
          period: form.period,
        }),
      })
      setForm({ objective: '', owner: '', keyResults: 3, period: form.period })
      setMessage(`OKR created · ${r.data?.objective}`)
      await load()
      setTab('okrs')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const saveCheckin = async () => {
    if (!checkin) return
    try {
      setError('')
      setMessage('')
      await api(`/api/t14/okr/${checkin.id}/checkin`, {
        method: 'POST',
        body: JSON.stringify({ progress: checkin.progress, completed: checkin.completed }),
      })
      setMessage('Check-in saved')
      await load()
      setTab('okrs')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/t14/okr/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this OKR?')) return
    try {
      setError('')
      await api(`/api/t14/okr/${id}`, { method: 'DELETE' })
      setMessage('OKR deleted')
      if (checkin?.id === id) setCheckin(null)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const active = rows.filter((r) => r.status !== 'Completed').length
  const checkinOkr = checkin ? rows.find((r) => r.id === checkin.id) : null

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #43 · Analytics</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            OKR Tracking
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ objectives · check-ins · status workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="OKR risk AI"
        subtitle="Flags at-risk objectives and suggests interventions"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'okr', prompt: 'Identify at-risk OKRs and recommend recovery actions.' }}
        cta="Advise OKRs"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'OKRs', value: rows.length },
          { label: 'Active', value: active },
          { label: 'Avg progress', value: `${avg}%` },
          { label: 'Completed', value: rows.filter((r) => r.status === 'Completed').length },
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
            ['okrs', 'OKRs'],
            ['checkin', 'Check-in'],
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

      {!loading && tab === 'okrs' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Objective', 'Owner', 'Progress', 'Status', 'Act'].map((h) => (
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
                    <Link href={`/${locale}/os/okr/${r.id}`} className="font-semibold underline">
                      {r.objective}
                    </Link>
                    <div className="text-[11px] text-harvics-burgundy/50">
                      {r.period} · KR {r.completed}/{r.keyResults}
                    </div>
                  </td>
                  <td className="px-3 py-2">{r.owner}</td>
                  <td className="px-3 py-2 font-mono">{r.progress}%</td>
                  <td className="px-3 py-2">
                    <span style={{ color: STATUS_COLOR[r.status] || '#3D1212', fontWeight: 600 }}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.status !== 'Completed' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCheckin({ id: r.id, progress: r.progress, completed: r.completed })
                              setTab('checkin')
                            }}
                            className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream"
                          >
                            Check-in
                          </button>
                          <button
                            type="button"
                            onClick={() => void setStatus(r.id, 'Completed')}
                            className="border border-harvics-gold/50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                          >
                            Complete
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void remove(r.id)}
                        className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No OKRs yet.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'checkin' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          {!checkin || !checkinOkr ? (
            <p className="text-sm text-harvics-burgundy/50">Pick an OKR from the list to check in.</p>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Check-in</p>
              <p className="text-sm font-semibold">{checkinOkr.objective}</p>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">
                Progress %
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  value={checkin.progress}
                  onChange={(e) => setCheckin({ ...checkin, progress: Number(e.target.value) })}
                />
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">
                KRs completed
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  value={checkin.completed}
                  onChange={(e) => setCheckin({ ...checkin, completed: Number(e.target.value) })}
                />
              </label>
              <button
                type="button"
                onClick={() => void saveCheckin()}
                className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
              >
                Save check-in
              </button>
            </>
          )}
        </div>
      ) : null}

      {!loading && tab === 'new' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New OKR</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Objective *"
            value={form.objective}
            onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Owner *"
            value={form.owner}
            onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Period"
            value={form.period}
            onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
          />
          <input
            type="number"
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Key results count"
            value={form.keyResults}
            onChange={(e) => setForm((f) => ({ ...f, keyResults: Number(e.target.value) }))}
          />
          <button
            type="button"
            onClick={() => void create()}
            className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Create
          </button>
        </div>
      ) : null}
    </div>
  )
}
