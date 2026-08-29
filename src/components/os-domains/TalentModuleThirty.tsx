'use client'

/**
 * Module #30 — Talent Acquisition
 * DoD: job postings + candidate pipeline via /api/wave5/postings
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

const STAGES = ['Applied', 'Screened', 'Interview', 'Offer', 'Hired', 'Rejected']
type Tab = 'pipeline' | 'postings'

const POSTING_NEXT: Record<string, string[]> = {
  Open: ['Paused', 'Filled', 'Cancelled'],
  Paused: ['Open', 'Cancelled'],
  Filled: [],
  Cancelled: [],
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
  if (!res.ok) throw new Error(json?.error || json?.issues?.[0]?.message || `HTTP ${res.status}`)
  return json
}

export default function TalentModuleThirty() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('pipeline')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [pForm, setPForm] = useState({
    reqNo: `REQ-${Date.now().toString().slice(-6)}`,
    title: '',
    department: '',
    location: '',
    level: 'Mid',
    description: '',
  })
  const [cForm, setCForm] = useState<Record<string, { name: string; email: string; phone: string; rating: string }>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave5/postings')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #30')
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
      if (!pForm.title) throw new Error('Title required')
      const r = await api('/api/wave5/postings', { method: 'POST', body: JSON.stringify(pForm) })
      setPForm({ ...pForm, reqNo: `REQ-${Date.now().toString().slice(-6)}`, title: '', description: '' })
      setMessage(`Posting ${r.data?.reqNo} opened`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addCandidate = async (pid: string) => {
    try {
      setError('')
      setMessage('')
      const c = cForm[pid]
      if (!c?.name) throw new Error('Candidate name required')
      await api(`/api/wave5/postings/${pid}/candidates`, {
        method: 'POST',
        body: JSON.stringify({
          name: c.name,
          email: c.email || null,
          phone: c.phone || null,
          rating: Number(c.rating) || 0,
        }),
      })
      setCForm((f) => ({ ...f, [pid]: { name: '', email: '', phone: '', rating: '0' } }))
      setMessage('Candidate added')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const move = async (id: string, stage: string) => {
    if (!stage) return
    try {
      setError('')
      await api(`/api/wave5/candidates/${id}/stage`, { method: 'POST', body: JSON.stringify({ stage }) })
      setMessage(`Stage → ${stage}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setPostingStatus = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/wave5/postings/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Posting → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const candCount = rows.reduce((s, p) => s + (p.candidates?.length || 0), 0)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #30 · Human Capital</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Talent Acquisition
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ postings · candidate stages · Open→Filled workflow · audited.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Hiring funnel AI"
        subtitle="Ranks open requisitions and time-to-fill risk — beyond classic SAP recruiting lists"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'talent', prompt: 'Prioritise open job postings by hiring urgency and recommend next recruiting actions.' }}
        cta="Advise talent"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Postings', value: rows.length },
          { label: 'Open', value: rows.filter((p) => p.status === 'Open').length },
          { label: 'Candidates', value: candCount },
          { label: 'Hired', value: rows.reduce((s, p) => s + (p.candidates || []).filter((c: any) => c.stage === 'Hired').length, 0) },
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
            ['pipeline', 'Hiring pipeline'],
            ['postings', 'Posting status'],
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

      {!loading && tab === 'postings' ? (
        <div className="space-y-2">
          {rows.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 border border-harvics-burgundy/15 bg-white px-4 py-3">
              <div>
                <Link href={`/${locale}/os/talent/postings/${p.id}`} className="font-mono font-semibold underline decoration-harvics-gold/50">
                  {p.reqNo}
                </Link>
                <span className="ml-2">{p.title}</span>
                <span className="ml-2 text-xs text-harvics-burgundy/50">{p.status}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(POSTING_NEXT[p.status] || []).map((s) => (
                  <button key={s} type="button" onClick={() => void setPostingStatus(p.id, s)} className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && tab === 'pipeline' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New posting</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Req # *" value={pForm.reqNo} onChange={(e) => setPForm((f) => ({ ...f, reqNo: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Title *" value={pForm.title} onChange={(e) => setPForm((f) => ({ ...f, title: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Department" value={pForm.department} onChange={(e) => setPForm((f) => ({ ...f, department: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Location" value={pForm.location} onChange={(e) => setPForm((f) => ({ ...f, location: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={pForm.level} onChange={(e) => setPForm((f) => ({ ...f, level: e.target.value }))}>
              {['Junior', 'Mid', 'Senior', 'Lead', 'Director'].map((l) => <option key={l}>{l}</option>)}
            </select>
            <textarea className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" rows={3} placeholder="Description" value={pForm.description} onChange={(e) => setPForm((f) => ({ ...f, description: e.target.value }))} />
            <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Post role
            </button>
          </div>
          <div className="space-y-4">
            {rows.length === 0 ? (
              <p className="border border-harvics-burgundy/15 bg-white px-3 py-8 text-center text-sm text-harvics-burgundy/45">No postings yet.</p>
            ) : (
              rows.map((p) => {
                const c = cForm[p.id] || { name: '', email: '', phone: '', rating: '0' }
                return (
                  <div key={p.id} className="border border-harvics-burgundy/15 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <Link href={`/${locale}/os/talent/postings/${p.id}`} className="font-mono text-xs font-semibold underline decoration-harvics-gold/50">
                          {p.reqNo}
                        </Link>
                        <span className="ml-2 font-semibold">{p.title}</span>
                        <span className="ml-2 text-xs text-harvics-burgundy/50">{p.department || '—'} · {p.location || '—'} · {p.level || '—'}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{p.status}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
                      <input className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm" placeholder="Name *" value={c.name} onChange={(e) => setCForm((f) => ({ ...f, [p.id]: { ...c, name: e.target.value } }))} />
                      <input className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm" placeholder="Email" value={c.email} onChange={(e) => setCForm((f) => ({ ...f, [p.id]: { ...c, email: e.target.value } }))} />
                      <input className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm" placeholder="Phone" value={c.phone} onChange={(e) => setCForm((f) => ({ ...f, [p.id]: { ...c, phone: e.target.value } }))} />
                      <input className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm" type="number" placeholder="Rating" value={c.rating} onChange={(e) => setCForm((f) => ({ ...f, [p.id]: { ...c, rating: e.target.value } }))} />
                      <button type="button" onClick={() => void addCandidate(p.id)} className="bg-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream">
                        Apply
                      </button>
                    </div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-harvics-burgundy/90 text-left text-harvics-cream">
                            {['Name', 'Email', 'Phone', '★', 'Stage', 'Move'].map((h) => (
                              <th key={h} className="px-2 py-1.5 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(p.candidates || []).length === 0 ? (
                            <tr><td colSpan={6} className="px-2 py-4 text-center text-xs text-harvics-burgundy/45">No candidates.</td></tr>
                          ) : (
                            (p.candidates || []).map((cand: any, i: number) => (
                              <tr key={cand.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                                <td className="px-2 py-1.5">{cand.name}</td>
                                <td className="px-2 py-1.5">{cand.email || '—'}</td>
                                <td className="px-2 py-1.5">{cand.phone || '—'}</td>
                                <td className="px-2 py-1.5 font-mono">{cand.rating}</td>
                                <td className="px-2 py-1.5">{cand.stage}</td>
                                <td className="px-2 py-1.5">
                                  <select className="border border-harvics-burgundy/20 bg-white px-1 py-0.5 text-xs" defaultValue="" onChange={(e) => { void move(cand.id, e.target.value); e.target.value = '' }}>
                                    <option value="">→</option>
                                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                                  </select>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
