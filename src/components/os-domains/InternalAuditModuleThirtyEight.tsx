'use client'

/**
 * Module #38 — Internal Audit (SAP+ workspace)
 * Tabs: Events · Log entry · Filters
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'events' | 'log' | 'filters'

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

export default function InternalAuditModuleThirtyEight() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('events')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [moduleFilter, setModuleFilter] = useState('')
  const [form, setForm] = useState({
    action: '',
    module: 'grc',
    entity: '',
    entityId: '',
    result: 'success',
    actorRole: 'auditor',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/v2/audit-events')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #38')
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
      if (!form.action) throw new Error('Action required')
      await api('/api/v2/audit-events', {
        method: 'POST',
        body: JSON.stringify({
          action: form.action,
          module: form.module || null,
          entity: form.entity || null,
          entityId: form.entityId || null,
          result: form.result,
          actorRole: form.actorRole || null,
        }),
      })
      setForm((f) => ({ ...f, action: '', entity: '', entityId: '' }))
      setMessage('Event logged')
      await load()
      setTab('events')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const modules = useMemo(() => {
    const s = new Set<string>()
    rows.forEach((e) => {
      if (e.module) s.add(e.module)
    })
    return Array.from(s).sort()
  }, [rows])

  const filtered = moduleFilter ? rows.filter((e) => e.module === moduleFilter) : rows

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #38 · GRC</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Internal Audit
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ immutable event ledger · /api/v2/audit-events · emitAudit sink.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Audit focus AI"
        subtitle="Concentrates auditors on hot modules from the event trail"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'internal-audit', prompt: 'Recommend internal-audit focus areas from recent audit-event volume.' }}
        cta="Advise audit"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Events', value: rows.length },
          { label: 'Failures', value: rows.filter((e) => e.result === 'failure' || e.result === 'denied').length },
          { label: 'Modules', value: modules.length },
          { label: 'Filtered', value: filtered.length },
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
            ['events', 'Events'],
            ['log', 'Log entry'],
            ['filters', 'By module'],
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

      {!loading && tab === 'log' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Manual audit entry</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Action *" value={form.action} onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Module" value={form.module} onChange={(e) => setForm((f) => ({ ...f, module: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Entity" value={form.entity} onChange={(e) => setForm((f) => ({ ...f, entity: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Entity ID" value={form.entityId} onChange={(e) => setForm((f) => ({ ...f, entityId: e.target.value }))} />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.result} onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}>
            <option>success</option>
            <option>failure</option>
            <option>denied</option>
          </select>
          <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Log event
          </button>
        </div>
      ) : null}

      {!loading && tab === 'filters' ? (
        <div className="space-y-3">
          <select className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
            <option value="">All modules</option>
            {modules.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <p className="text-xs text-harvics-burgundy/50">{filtered.length} events</p>
        </div>
      ) : null}

      {!loading && (tab === 'events' || tab === 'filters') ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['When', 'Action', 'Module', 'Entity', 'Result', 'Doc'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No audit events.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 200).map((e, i) => (
                  <tr key={e.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono text-xs">{e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}</td>
                    <td className="px-3 py-2 font-semibold">{e.action}</td>
                    <td className="px-3 py-2">{e.module || '—'}</td>
                    <td className="px-3 py-2">
                      {e.entity || '—'}
                      {e.entityId ? ` · ${String(e.entityId).slice(0, 10)}` : ''}
                    </td>
                    <td className="px-3 py-2">{e.result}</td>
                    <td className="px-3 py-2">
                      <Link href={`/${locale}/os/internal-audit/${e.id}`} className="text-[10px] font-bold uppercase underline decoration-harvics-gold/50">
                        Open
                      </Link>
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
