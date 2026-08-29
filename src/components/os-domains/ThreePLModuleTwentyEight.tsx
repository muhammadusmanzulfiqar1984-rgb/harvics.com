'use client'

/**
 * Module #28 — 3PL Integration
 * DoD: partners + event ledger via /api/wave5/threepl-*
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'partners' | 'events' | 'ingest'

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

export default function ThreePLModuleTwentyEight() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('partners')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [partners, setPartners] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [pForm, setPForm] = useState({ code: '', name: '', apiBaseUrl: '', authMode: 'apikey', webhookUrl: '' })
  const [eForm, setEForm] = useState({ partnerCode: '', eventType: 'shipment_created', payloadText: '{}' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [p, e] = await Promise.all([api('/api/wave5/threepl-partners'), api('/api/wave5/threepl-events')])
      setPartners(p.data || [])
      setEvents(e.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load Module #28')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addP = async () => {
    try {
      setError('')
      setMessage('')
      if (!pForm.code || !pForm.name) throw new Error('Code and name required')
      await api('/api/wave5/threepl-partners', {
        method: 'POST',
        body: JSON.stringify({
          code: pForm.code,
          name: pForm.name,
          apiBaseUrl: pForm.apiBaseUrl || null,
          authMode: pForm.authMode,
          webhookUrl: pForm.webhookUrl || null,
        }),
      })
      setPForm((f) => ({ ...f, code: '', name: '' }))
      setMessage('Partner registered')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setActive = async (id: string, active: boolean) => {
    try {
      setError('')
      await api(`/api/wave5/threepl-partners/${id}/status`, { method: 'POST', body: JSON.stringify({ active }) })
      setMessage(active ? 'Partner activated' : 'Partner deactivated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addE = async () => {
    try {
      setError('')
      setMessage('')
      if (!eForm.partnerCode) throw new Error('Partner code required')
      let payload: unknown
      try {
        payload = JSON.parse(eForm.payloadText)
      } catch {
        throw new Error('Invalid JSON payload')
      }
      await api('/api/wave5/threepl-events', {
        method: 'POST',
        body: JSON.stringify({
          partnerCode: eForm.partnerCode,
          eventType: eForm.eventType,
          payload,
        }),
      })
      setMessage('Event ingested')
      await load()
      setTab('events')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const processEv = async (id: string) => {
    try {
      setError('')
      await api(`/api/wave5/threepl-events/${id}/process`, { method: 'POST', body: '{}' })
      setMessage('Event marked processed')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #28 · Logistics</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            3PL Integration
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Partner registry, inbound EDI/webhook ledger, and process workflow.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="3PL integration coach"
        subtitle="Partner events and integration health"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'threepl' }}
        cta="Advise 3PL"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Partners', value: partners.length },
          { label: 'Active', value: partners.filter((p) => p.active !== false).length },
          { label: 'Events', value: events.length },
          { label: 'Unprocessed', value: events.filter((e) => !e.processed).length },
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
            ['partners', 'Partners'],
            ['ingest', 'Ingest'],
            ['events', 'Event ledger'],
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

      {!loading && tab === 'partners' ? (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Register partner</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Code *" value={pForm.code} onChange={(e) => setPForm((f) => ({ ...f, code: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={pForm.name} onChange={(e) => setPForm((f) => ({ ...f, name: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="API base URL" value={pForm.apiBaseUrl} onChange={(e) => setPForm((f) => ({ ...f, apiBaseUrl: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Webhook URL" value={pForm.webhookUrl} onChange={(e) => setPForm((f) => ({ ...f, webhookUrl: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={pForm.authMode} onChange={(e) => setPForm((f) => ({ ...f, authMode: e.target.value }))}>
              {['apikey', 'oauth', 'none'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <button type="button" onClick={() => void addP()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Add partner
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'Name', 'Auth', 'Status', ''].map((h) => (
                    <th key={h || 'a'} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">No partners yet.</td>
                  </tr>
                ) : (
                  partners.map((p, i) => (
                    <tr key={p.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link href={`/${locale}/os/threepl/partners/${p.id}`} className="underline decoration-harvics-gold/50">
                          {p.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2">{p.authMode}</td>
                      <td className="px-3 py-2">{p.active !== false ? 'Active' : 'Inactive'}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => void setActive(p.id, p.active === false)}
                          className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          {p.active === false ? 'Activate' : 'Deactivate'}
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

      {!loading && tab === 'ingest' ? (
        <div className="mx-auto max-w-lg space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Ingest event</p>
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={eForm.partnerCode} onChange={(e) => setEForm((f) => ({ ...f, partnerCode: e.target.value }))}>
            <option value="">Partner code *</option>
            {partners.map((p) => (
              <option key={p.id} value={p.code}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={eForm.eventType} onChange={(e) => setEForm((f) => ({ ...f, eventType: e.target.value }))}>
            {['shipment_created', 'status_update', 'exception', 'pod', 'customs'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <textarea className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 font-mono text-sm" rows={5} value={eForm.payloadText} onChange={(e) => setEForm((f) => ({ ...f, payloadText: e.target.value }))} />
          <button type="button" onClick={() => void addE()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Ingest
          </button>
        </div>
      ) : null}

      {!loading && tab === 'events' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['When', 'Partner', 'Type', 'Processed', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">No events yet.</td>
                </tr>
              ) : (
                events.map((e, i) => (
                  <tr key={e.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 text-[11px]">{new Date(e.receivedAt).toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono">{e.partnerCode}</td>
                    <td className="px-3 py-2">{e.eventType}</td>
                    <td className="px-3 py-2">{e.processed ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2">
                      {!e.processed ? (
                        <button type="button" onClick={() => void processEv(e.id)} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                          Process
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
