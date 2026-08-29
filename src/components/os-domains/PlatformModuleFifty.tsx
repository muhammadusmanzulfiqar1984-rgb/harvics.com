'use client'

/**
 * Module #50 — Audit Log (SAP+ workspace)
 * Tabs: Events · Filters · Summary
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'events' | 'filters' | 'summary'

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

export default function PlatformModuleFifty() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('events')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<any>(null)
  const [filters, setFilters] = useState({ actorId: '', action: '', module: '', entity: '', result: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const q = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q.set(k, v)
      })
      q.set('limit', '200')
      const [j, s] = await Promise.all([api(`/api/platform/audit/search?${q}`), api('/api/platform/audit/summary')])
      setRows(j.data || [])
      setTotal(j.total || 0)
      setSummary(s.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #50')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void load()
  }, [load])

  const exportCsv = () => {
    const q = new URLSearchParams()
    if (filters.module) q.set('module', filters.module)
    window.open(`/api/platform/audit/export?${q}`, '_blank')
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #50 · Platform</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Audit Log
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ search · filter · export — every recorded action.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv} className="border border-harvics-gold/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
            Export CSV
          </button>
          <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}


      <OsSapAiPanel
        title="Audit log AI"
        subtitle="Detects anomalous admin/module activity patterns"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'audit-log', prompt: 'Scan recent audit-log activity for anomalies and recommend follow-ups.' }}
        cta="Advise audit log"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Events 24h', value: summary?.last24h ?? '…' },
          { label: 'Showing', value: rows.length },
          { label: 'Total match', value: total },
          { label: 'Failures 7d', value: summary?.failureRate7d ?? '…' },
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
            ['filters', 'Filters'],
            ['summary', 'Summary'],
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

      {!loading && tab === 'events' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['When', 'Actor', 'Action', 'Module', 'Result'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-harvics-burgundy/10">
                  <td className="px-3 py-2 font-mono text-[11px]">
                    <Link href={`/${locale}/os/audit-log/${e.id}`} className="underline">
                      {new Date(e.createdAt).toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {e.actorId || '—'}
                    <div className="text-harvics-burgundy/50">{e.actorRole || ''}</div>
                  </td>
                  <td className="px-3 py-2 font-semibold">{e.action}</td>
                  <td className="px-3 py-2 text-xs">
                    {e.module || '—'}
                    <div className="text-harvics-burgundy/50">
                      {e.entity || ''} {e.entityId ? `· ${String(e.entityId).slice(0, 8)}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2">{e.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="p-4 text-sm text-harvics-burgundy/50">No events yet. Module writes call emitAudit automatically.</p>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'filters' ? (
        <div className="max-w-xl space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Filters</p>
          {(
            [
              ['actorId', 'Actor'],
              ['action', 'Action contains'],
              ['module', 'Module'],
              ['entity', 'Entity'],
            ] as const
          ).map(([k, label]) => (
            <input
              key={k}
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder={label}
              value={filters[k]}
              onChange={(e) => setFilters({ ...filters, [k]: e.target.value })}
            />
          ))}
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={filters.result || 'all'}
            onChange={(e) => setFilters({ ...filters, result: e.target.value === 'all' ? '' : e.target.value })}
          >
            {['all', 'success', 'failure', 'denied'].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => void load()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Search
          </button>
        </div>
      ) : null}

      {!loading && tab === 'summary' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">By result (24h)</p>
            <ul className="mt-2 space-y-1 text-sm">
              {(summary?.byResult || []).map((b: any) => (
                <li key={b.result}>
                  {b.result}: <span className="font-mono font-semibold">{typeof b._count === 'number' ? b._count : b._count?._all ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Top modules (7d)</p>
            <ul className="mt-2 space-y-1 text-sm">
              {(summary?.byModule || []).map((b: any) => (
                <li key={b.module || 'null'}>
                  {b.module || '(none)'}: <span className="font-mono font-semibold">{b.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
