'use client'

/**
 * Module #41 — BI & Reporting (SAP+ workspace)
 * Tabs: Reports · Run · New
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'reports' | 'run' | 'new'

const SOURCES = ['Order', 'Invoice', 'Customer', 'InventoryItem', 'PurchaseOrder', 'Employee', 'Lead', 'Deal']
const METRICS = ['count', 'sum', 'avg', 'min', 'max']

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

export default function AnalyticsModuleFortyOne() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('reports')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [resultName, setResultName] = useState('')
  const [sel, setSel] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    category: 'sales',
    sourceTable: 'Order',
    metric: 'count',
    metricField: '',
    groupBy: '',
    description: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave5/reports')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #41')
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
      if (!form.name) throw new Error('Name required')
      if (form.metric !== 'count' && !form.metricField) throw new Error('Metric field required for sum/avg/min/max')
      const r = await api('/api/wave5/reports', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          metricField: form.metricField || null,
          groupBy: form.groupBy || null,
          description: form.description || null,
        }),
      })
      setForm({ ...form, name: '', description: '' })
      setMessage(`Report “${r.data?.name}” saved`)
      await load()
      setTab('reports')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const run = async (id: string, name: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/wave5/reports/${id}/run`, { method: 'POST', body: '{}' })
      setResult(r.data)
      setResultName(name)
      setSel(id)
      setMessage(`Ran “${name}”`)
      setTab('run')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this report?')) return
    try {
      setError('')
      await api(`/api/wave5/reports/${id}`, { method: 'DELETE' })
      setMessage('Report deleted')
      if (sel === id) {
        setSel(null)
        setResult(null)
      }
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const ran = rows.filter((r) => r.lastRunAt).length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #41 · Analytics</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            BI & Reporting
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ saved reports · live aggregates · run history.
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
        title="BI narrative AI"
        subtitle="Turns saved reports into an executive reading list"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'bi', prompt: 'Recommend which BI reports leadership should open first and why.' }}
        cta="Advise BI"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          { label: 'Saved', value: rows.length },
          { label: 'Ever run', value: ran },
          { label: 'Last result', value: resultName || '—' },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 truncate font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['reports', 'Reports'],
            ['run', 'Run result'],
            ['new', 'New report'],
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

      {!loading && tab === 'reports' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Name', 'Source', 'Metric', 'Last run', 'Act'].map((h) => (
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
                    <Link href={`/${locale}/os/bi-reports/${r.id}`} className="font-semibold underline">
                      {r.name}
                    </Link>
                    <div className="text-[11px] text-harvics-burgundy/50">{r.category || '—'}</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{r.sourceTable}</td>
                  <td className="px-3 py-2">
                    {r.metric}
                    {r.metricField ? `.${r.metricField}` : ''}
                    {r.groupBy ? ` / ${r.groupBy}` : ''}
                  </td>
                  <td className="px-3 py-2 text-xs">{r.lastRunAt ? new Date(r.lastRunAt).toLocaleString() : '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => void run(r.id, r.name)}
                        className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream"
                      >
                        Run
                      </button>
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
          {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No saved reports yet.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'run' ? (
        <div className="border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">
            Result · {resultName || '—'}
          </p>
          {result == null ? (
            <p className="mt-3 text-sm text-harvics-burgundy/50">Run a report from the Reports tab.</p>
          ) : (
            <pre className="mt-3 max-h-80 overflow-auto bg-white p-3 font-mono text-xs">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      ) : null}

      {!loading && tab === 'new' ? (
        <div className="max-w-xl space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New saved report</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={form.sourceTable}
            onChange={(e) => setForm((f) => ({ ...f, sourceTable: e.target.value }))}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={form.metric}
            onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))}
          >
            {METRICS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {form.metric !== 'count' ? (
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Metric field (e.g. amount)"
              value={form.metricField}
              onChange={(e) => setForm((f) => ({ ...f, metricField: e.target.value }))}
            />
          ) : null}
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Group by (optional)"
            value={form.groupBy}
            onChange={(e) => setForm((f) => ({ ...f, groupBy: e.target.value }))}
          />
          <textarea
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void create()}
            className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Save report
          </button>
        </div>
      ) : null}
    </div>
  )
}
