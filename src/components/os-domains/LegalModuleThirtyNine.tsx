'use client'

/**
 * Module #39 — Legal & Compliance (SAP+ workspace)
 * Tabs: Cases · Create · Workflow
 * Status: open → in-progress → closed|cancelled
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'cases' | 'create' | 'workflow'

const NEXT: Record<string, string[]> = {
  open: ['in-progress', 'cancelled'],
  'in-progress': ['closed', 'cancelled'],
  closed: [],
  cancelled: [],
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

export default function LegalModuleThirtyNine() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('cases')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    caseTitle: '',
    caseType: 'Litigation',
    country: 'US',
    description: '',
    assignedTo: '',
    hearingDate: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/v2/legal/cases')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #39')
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
      if (!form.caseTitle) throw new Error('Title required')
      const r = await api('/api/v2/legal/cases', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          hearingDate: form.hearingDate || null,
          status: 'open',
        }),
      })
      setForm({ caseTitle: '', caseType: 'Litigation', country: 'US', description: '', assignedTo: '', hearingDate: '' })
      setMessage(`Case ${r.data?.caseTitle} opened`)
      await load()
      setTab('cases')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/v2/legal/cases/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Case → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #39 · GRC</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Legal & Compliance
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ case docket · open→closed workflow · IPR links.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/os/legal/trademarks`} className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
            IPR
          </Link>
          <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Legal risk AI"
        subtitle="Prioritises open cases and compliance deadlines"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'legal', prompt: 'Prioritise open legal cases and recommend next counsel actions.' }}
        cta="Advise legal"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Cases', value: rows.length },
          { label: 'Open', value: rows.filter((c) => c.status === 'open').length },
          { label: 'In progress', value: rows.filter((c) => c.status === 'in-progress').length },
          { label: 'Closed', value: rows.filter((c) => c.status === 'closed').length },
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
            ['cases', 'Cases'],
            ['create', 'Open case'],
            ['workflow', 'Workflow'],
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

      {!loading && tab === 'create' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New case</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Title *" value={form.caseTitle} onChange={(e) => setForm((f) => ({ ...f, caseTitle: e.target.value }))} />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.caseType} onChange={(e) => setForm((f) => ({ ...f, caseType: e.target.value }))}>
            {['Litigation', 'IPR', 'Regulatory', 'Contract', 'Employment'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Country (ISO)" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Assigned to" value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="date" value={form.hearingDate} onChange={(e) => setForm((f) => ({ ...f, hearingDate: e.target.value }))} />
          <textarea className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Open case
          </button>
        </div>
      ) : null}

      {!loading && tab === 'cases' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Title', 'Type', 'Country', 'Assigned', 'Status', 'Act'].map((h) => (
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
                    No cases.
                  </td>
                </tr>
              ) : (
                rows.map((c, i) => (
                  <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-semibold">
                      <Link href={`/${locale}/os/legal/cases/${c.id}`} className="underline decoration-harvics-gold/50">
                        {c.caseTitle}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{c.caseType}</td>
                    <td className="px-3 py-2">{c.country}</td>
                    <td className="px-3 py-2">{c.assignedTo || '—'}</td>
                    <td className="px-3 py-2">{c.status}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {(NEXT[c.status] || []).map((s) => (
                          <button key={s} type="button" onClick={() => void setStatus(c.id, s)} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                            {s}
                          </button>
                        ))}
                        {!NEXT[c.status]?.length ? '—' : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'workflow' ? (
        <div className="space-y-2">
          {rows.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border border-harvics-burgundy/15 bg-white px-4 py-3">
              <div>
                <Link href={`/${locale}/os/legal/cases/${c.id}`} className="font-semibold underline decoration-harvics-gold/50">
                  {c.caseTitle}
                </Link>
                <span className="ml-2 text-xs text-harvics-burgundy/50">{c.status}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(NEXT[c.status] || []).map((s) => (
                  <button key={s} type="button" onClick={() => void setStatus(c.id, s)} className="border border-harvics-gold/50 px-2 py-1 text-[9px] font-bold uppercase">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
