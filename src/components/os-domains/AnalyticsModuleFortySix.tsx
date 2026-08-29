'use client'

/**
 * Module #46 — Service Management (SAP+ workspace)
 * Tabs: Tickets · Resolve · New
 * Status: Open → InProgress|OnHold|Resolved → Closed
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'tickets' | 'resolve' | 'new'

const TICKET_NEXT: Record<string, string[]> = {
  Open: ['InProgress', 'OnHold', 'Resolved'],
  InProgress: ['OnHold', 'Resolved'],
  OnHold: ['InProgress', 'Resolved'],
  Resolved: ['Closed', 'InProgress'],
  Closed: [],
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

export default function AnalyticsModuleFortySix() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('tickets')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [resolution, setResolution] = useState('')
  const [form, setForm] = useState({
    ticketNo: `T-${Date.now().toString().slice(-6)}`,
    customerName: '',
    subject: '',
    description: '',
    priority: 'Medium',
    category: '',
    assignedTo: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave5/service-tickets')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #46')
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
      if (!form.customerName || !form.subject) throw new Error('Customer and subject required')
      const r = await api('/api/wave5/service-tickets', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          description: form.description || null,
          category: form.category || null,
          assignedTo: form.assignedTo || null,
        }),
      })
      setForm({
        ...form,
        ticketNo: `T-${Date.now().toString().slice(-6)}`,
        customerName: '',
        subject: '',
        description: '',
      })
      setMessage(`Ticket ${r.data?.ticketNo} opened`)
      await load()
      setTab('tickets')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave5/service-tickets/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, resolution: resolution || undefined }),
      })
      setMessage(`Ticket → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const resolve = async () => {
    if (!sel) return
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/wave5/service-tickets/${sel}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution: resolution.trim() || 'Resolved' }),
      })
      setMessage(
        r.slaInfo?.breached
          ? `Resolved · SLA breached (${r.slaInfo.actualHrs}h > ${r.slaInfo.slaHrs}h)`
          : 'Ticket resolved',
      )
      setResolution('')
      await load()
      setTab('tickets')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const openCount = rows.filter((r) => r.status === 'Open' || r.status === 'InProgress').length
  const breached = rows.filter((r) => r.slaBreached).length
  const selected = rows.find((r) => r.id === sel)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #46 · Services</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Service Management
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ tickets · SLA on resolve · Open → InProgress → Resolved → Closed.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Service desk AI"
        subtitle="Triages open tickets by aging and impact"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'service', prompt: 'Triage open service tickets and recommend SLA recovery actions.' }}
        cta="Advise service"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Tickets', value: rows.length },
          { label: 'Open', value: openCount },
          { label: 'SLA breach', value: breached },
          { label: 'Resolved', value: rows.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length },
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
            ['tickets', 'Tickets'],
            ['resolve', 'Resolve'],
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

      {!loading && tab === 'tickets' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Ticket', 'Customer', 'Priority', 'Status', 'Act'].map((h) => (
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
                    <Link href={`/${locale}/os/service-tickets/${r.id}`} className="font-mono text-xs font-semibold underline">
                      {r.ticketNo}
                    </Link>
                    <div className="text-[11px] text-harvics-burgundy/50">{r.subject}</div>
                  </td>
                  <td className="px-3 py-2">{r.customerName}</td>
                  <td className="px-3 py-2">{r.priority}</td>
                  <td className="px-3 py-2">
                    {r.status}
                    {r.slaBreached ? <span className="ml-1 text-[10px] text-red-700">SLA</span> : null}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(TICKET_NEXT[r.status] || []).includes('Resolved') ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSel(r.id)
                            setTab('resolve')
                          }}
                          className="border border-harvics-gold/50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                        >
                          Resolve
                        </button>
                      ) : null}
                      {(TICKET_NEXT[r.status] || []).filter((s) => s !== 'Resolved').map((s) => (
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
          {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No tickets yet.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'resolve' ? (
        <div className="max-w-lg space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Resolve ticket</p>
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={sel || ''} onChange={(e) => setSel(e.target.value || null)}>
            <option value="">Select ticket…</option>
            {rows
              .filter((r) => (TICKET_NEXT[r.status] || []).includes('Resolved'))
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.ticketNo} — {r.subject}
                </option>
              ))}
          </select>
          {selected ? (
            <p className="text-xs text-harvics-burgundy/60">
              {selected.customerName} · {selected.priority} · opened {new Date(selected.openedAt).toLocaleString()}
            </p>
          ) : null}
          <textarea
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            rows={3}
            placeholder="Resolution notes *"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          />
          <button type="button" onClick={() => void resolve()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Resolve
          </button>
        </div>
      ) : null}

      {!loading && tab === 'new' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New ticket</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Ticket no *" value={form.ticketNo} onChange={(e) => setForm((f) => ({ ...f, ticketNo: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Customer *" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Subject *" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
            {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <textarea className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Open ticket
          </button>
        </div>
      ) : null}
    </div>
  )
}
