'use client'

/**
 * Module #37 — GRC Core
 * DoD: incident lifecycle Open → In Progress → Resolved → Closed via /api/t14/incidents
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

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

export default function GRCModuleThirtySeven() {
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [summary, setSummary] = useState({ open: 0, critical: 0 })
  const [form, setForm] = useState({ title: '', severity: 'Medium' })
  const [resolveFor, setResolveFor] = useState<string | null>(null)
  const [resolution, setResolution] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/t14/incidents')
      setRows(r.data || [])
      setSummary(r.summary || { open: 0, critical: 0 })
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #37')
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
      if (!form.title) throw new Error('Title required')
      const r = await api('/api/t14/incidents', { method: 'POST', body: JSON.stringify(form) })
      setForm({ title: '', severity: 'Medium' })
      setMessage(`Incident ${r.data?.title} reported`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const act = async (id: string, what: 'start' | 'close') => {
    try {
      setError('')
      await api(`/api/t14/incidents/${id}/${what}`, { method: 'POST', body: '{}' })
      setMessage(what === 'start' ? 'Triage started' : 'Incident closed')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const resolve = async () => {
    try {
      setError('')
      if (!resolveFor || !resolution) throw new Error('Resolution notes required')
      await api(`/api/t14/incidents/${resolveFor}/resolve`, { method: 'POST', body: JSON.stringify({ resolution }) })
      setResolveFor(null)
      setResolution('')
      setMessage('Marked resolved')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #37 · GRC</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            GRC Core — Incidents
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ Open→In Progress→Resolved→Closed · audited triage.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Incident triage AI"
        subtitle="Severity × age triage for GRC incidents — classic SAP GRC lacks narrative coach"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'grc', prompt: 'Triage open GRC incidents by severity and age; list next containment actions.' }}
        cta="Triage incidents"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Incidents', value: rows.length },
          { label: 'Open', value: summary.open },
          { label: 'Critical open', value: summary.critical },
          { label: 'Closed', value: rows.filter((r) => r.status === 'Closed').length },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

      {!loading ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Report incident</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
              {['Critical', 'High', 'Medium', 'Low'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Report
            </button>
            {resolveFor ? (
              <div className="space-y-2 border-t border-harvics-burgundy/15 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Resolution notes</p>
                <textarea className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" rows={3} value={resolution} onChange={(e) => setResolution(e.target.value)} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => void resolve()} className="flex-1 bg-harvics-burgundy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream">Mark resolved</button>
                  <button type="button" onClick={() => { setResolveFor(null); setResolution('') }} className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase">Cancel</button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Title', 'Severity', 'Reported', 'Status', 'Resolution', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">No incidents.</td></tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-semibold">
                        <Link href={`/${locale}/os/incidents/${r.id}`} className="underline decoration-harvics-gold/50">
                          {r.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{r.severity}</td>
                      <td className="px-3 py-2 text-xs">{r.reportedDate ? new Date(r.reportedDate).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-2">{r.status}</td>
                      <td className="max-w-[24ch] truncate px-3 py-2 text-xs">{r.resolution || '—'}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {r.status === 'Open' ? (
                            <button type="button" onClick={() => void act(r.id, 'start')} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">Start</button>
                          ) : null}
                          {r.status === 'Open' || r.status === 'In Progress' ? (
                            <button type="button" onClick={() => { setResolveFor(r.id); setResolution('') }} className="border border-green-700 px-2 py-0.5 text-[9px] font-bold uppercase text-green-800">Resolve</button>
                          ) : null}
                          {r.status === 'Resolved' ? (
                            <button type="button" onClick={() => void act(r.id, 'close')} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">Close</button>
                          ) : null}
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
    </div>
  )
}
