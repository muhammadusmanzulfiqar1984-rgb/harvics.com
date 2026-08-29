'use client'

/**
 * Module #42 — Board Pack Generator (SAP+ workspace)
 * Tabs: Packs · Sections · Generate
 * Status: Draft → Review → Approved → Distributed
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'packs' | 'sections' | 'generate'

const BOARD_NEXT: Record<string, string[]> = {
  Draft: ['Review', 'Approved'],
  Review: ['Approved', 'Draft'],
  Approved: ['Distributed'],
  Distributed: [],
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
  if (!res.ok) throw new Error(json?.error || json?.allowed ? `${json.error} [${(json.allowed || []).join(', ')}]` : `HTTP ${res.status}`)
  return json
}

export default function AnalyticsModuleFortyTwo() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('packs')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState<any>(null)
  const [form, setForm] = useState({ period: '2026-Q2', title: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave5/board-packs')
      setRows(r.data || [])
      if (open?.id) {
        const refreshed = (r.data || []).find((x: any) => x.id === open.id)
        if (refreshed) setOpen(refreshed)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #42')
    } finally {
      setLoading(false)
    }
  }, [open?.id])

  useEffect(() => {
    void load()
  }, [load])

  const generate = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.period) throw new Error('Period required')
      const r = await api('/api/wave5/board-packs/generate', {
        method: 'POST',
        body: JSON.stringify({ period: form.period, title: form.title || undefined }),
      })
      setMessage(`Pack generated for ${r.data?.period}`)
      setOpen(r.data)
      await load()
      setTab('sections')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave5/board-packs/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      setMessage(`Pack → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const approved = rows.filter((r) => r.status === 'Approved' || r.status === 'Distributed').length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #42 · Analytics</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Board Pack Generator
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ period packs · Draft → Review → Approved → Distributed.
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
        title="Board pack AI"
        subtitle="Checks pack completeness and narrative gaps before the meeting"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'board-pack', prompt: 'Advise on board-pack readiness and missing executive narratives.' }}
        cta="Advise board pack"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Packs', value: rows.length },
          { label: 'Draft', value: rows.filter((r) => r.status === 'Draft').length },
          { label: 'In review', value: rows.filter((r) => r.status === 'Review').length },
          { label: 'Approved+', value: approved },
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
            ['packs', 'Packs'],
            ['sections', 'Sections'],
            ['generate', 'Generate'],
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

      {!loading && tab === 'packs' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Period', 'Title', 'Status', 'Generated', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const next = BOARD_NEXT[r.status] || []
                return (
                  <tr key={r.id} className="border-t border-harvics-burgundy/10">
                    <td className="px-3 py-2 font-mono text-xs">
                      <Link href={`/${locale}/os/board-pack/${r.id}`} className="font-semibold underline">
                        {r.period}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.title}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2 text-xs">{r.generatedAt ? new Date(r.generatedAt).toLocaleString() : '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(r)
                            setTab('sections')
                          }}
                          className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                        >
                          View
                        </button>
                        {next.map((s) => (
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
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No board packs yet.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'sections' ? (
        <div className="space-y-3">
          {!open ? (
            <p className="text-sm text-harvics-burgundy/50">Select a pack from the Packs tab.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border border-harvics-burgundy/15 bg-white p-3">
                <div>
                  <Link href={`/${locale}/os/board-pack/${open.id}`} className="font-semibold underline">
                    {open.title}
                  </Link>
                  <div className="text-xs text-harvics-burgundy/50">
                    {open.period} · {open.status}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(BOARD_NEXT[open.status] || []).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void setStatus(open.id, s)}
                      className="bg-harvics-burgundy px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {(Array.isArray(open.sections) ? open.sections : []).map((sec: any, i: number) => (
                <div key={i} className="border border-harvics-burgundy/15 bg-harvics-cream/40 p-4" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">{sec.name}</p>
                  <p className="mt-1 text-sm">{sec.content}</p>
                  {sec.kpis ? (
                    <pre className="mt-2 overflow-auto bg-white p-2 font-mono text-[11px]">{JSON.stringify(sec.kpis, null, 2)}</pre>
                  ) : null}
                </div>
              ))}
            </>
          )}
        </div>
      ) : null}

      {!loading && tab === 'generate' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Generate pack</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Period * (e.g. 2026-Q2)"
            value={form.period}
            onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void generate()}
            className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Generate
          </button>
        </div>
      ) : null}
    </div>
  )
}
