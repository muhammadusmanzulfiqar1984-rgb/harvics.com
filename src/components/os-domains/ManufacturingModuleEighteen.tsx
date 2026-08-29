'use client'

/**
 * Module #18 — Shop Floor Control (SAP+ workspace)
 * Tabs: Queue · In progress · Completed · New op
 * Status: Queued → InProgress → Paused|Completed|Scrapped
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'queue' | 'active' | 'done' | 'create'

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

const STATUS_COLOR: Record<string, string> = {
  Queued: '#666',
  InProgress: '#1565C0',
  Paused: '#B8860B',
  Completed: '#2E7D32',
  Scrapped: '#B71C1C',
}

export default function ManufacturingModuleEighteen() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('queue')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    workOrderId: '',
    operationNo: '10',
    workCenter: '',
    description: '',
    setupMins: '5',
    runMins: '30',
    qtyPlanned: '100',
    operator: '',
  })
  const [report, setReport] = useState<Record<string, { qtyDone: string; qtyScrap: string }>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave5/shop-floor-ops')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #18')
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
      if (!form.workCenter) throw new Error('Work center required')
      const r = await api('/api/wave5/shop-floor-ops', {
        method: 'POST',
        body: JSON.stringify({
          workOrderId: form.workOrderId || null,
          operationNo: Number(form.operationNo) || 10,
          workCenter: form.workCenter,
          description: form.description || null,
          setupMins: Number(form.setupMins) || 0,
          runMins: Number(form.runMins) || 0,
          qtyPlanned: Number(form.qtyPlanned) || 0,
          operator: form.operator || null,
        }),
      })
      setForm({
        workOrderId: form.workOrderId,
        operationNo: String(Number(form.operationNo) + 10),
        workCenter: '',
        description: '',
        setupMins: '5',
        runMins: '30',
        qtyPlanned: '100',
        operator: form.operator,
      })
      setMessage(`Op ${r.data?.operationNo} queued at ${r.data?.workCenter}`)
      await load()
      setTab('queue')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const doReport = async (id: string, status?: string) => {
    try {
      setError('')
      const r = report[id] || { qtyDone: '0', qtyScrap: '0' }
      await api(`/api/wave5/shop-floor-ops/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({
          qtyDone: Number(r.qtyDone) || 0,
          qtyScrap: Number(r.qtyScrap) || 0,
          status,
        }),
      })
      setMessage(status ? `Status → ${status}` : 'Qty reported')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const viewRows = useMemo(() => {
    if (tab === 'queue') return rows.filter((r) => r.status === 'Queued')
    if (tab === 'active') return rows.filter((r) => ['InProgress', 'Paused'].includes(r.status))
    if (tab === 'done') return rows.filter((r) => ['Completed', 'Scrapped'].includes(r.status))
    return rows
  }, [rows, tab])

  const scrapTotal = rows.reduce((s, r) => s + (Number(r.qtyScrap) || 0), 0)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #18 · Manufacturing</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Shop Floor Control
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Operations queue · in-progress reporting · scrap tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/manufacturing`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Planning
          </Link>
          <Link
            href={`/${locale}/os/quality`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Quality
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Shop floor coach"
        subtitle="Operation bottlenecks and stalled ops"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'shopfloor' }}
        cta="Advise shop floor"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Ops', rows.length, '#3D1212'],
          ['Queued', rows.filter((r) => r.status === 'Queued').length, '#666'],
          ['Active', rows.filter((r) => ['InProgress', 'Paused'].includes(r.status)).length, '#1565C0'],
          ['Scrap qty', scrapTotal, '#B71C1C'],
        ].map(([label, n, color]) => (
          <div key={String(label)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: `3px solid ${color}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{n}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['queue', 'Queue'],
            ['active', 'In progress'],
            ['done', 'Completed'],
            ['create', 'New operation'],
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
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Queue operation</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="WO ID (optional)"
            value={form.workOrderId}
            onChange={(e) => setForm((f) => ({ ...f, workOrderId: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="number"
            placeholder="Op no *"
            value={form.operationNo}
            onChange={(e) => setForm((f) => ({ ...f, operationNo: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Work center *"
            value={form.workCenter}
            onChange={(e) => setForm((f) => ({ ...f, workCenter: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Setup min"
              value={form.setupMins}
              onChange={(e) => setForm((f) => ({ ...f, setupMins: e.target.value }))}
            />
            <input
              className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Run min"
              value={form.runMins}
              onChange={(e) => setForm((f) => ({ ...f, runMins: e.target.value }))}
            />
            <input
              className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Qty planned"
              value={form.qtyPlanned}
              onChange={(e) => setForm((f) => ({ ...f, qtyPlanned: e.target.value }))}
            />
          </div>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Operator"
            value={form.operator}
            onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void create()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Queue operation
          </button>
        </div>
      ) : null}

      {!loading && tab !== 'create' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Op', 'WC', 'Desc', 'Planned', 'Done', 'Scrap', 'Status', 'Report', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viewRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No operations in this view.
                  </td>
                </tr>
              ) : (
                viewRows.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link href={`/${locale}/os/shop-floor/${r.id}`} className="underline decoration-harvics-gold/50">
                        {r.operationNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.workCenter}</td>
                    <td className="px-3 py-2">{r.description || '—'}</td>
                    <td className="px-3 py-2 font-mono">{r.qtyPlanned}</td>
                    <td className="px-3 py-2 font-mono">{r.qtyDone}</td>
                    <td className={`px-3 py-2 font-mono ${r.qtyScrap > 0 ? 'text-red-800' : ''}`}>{r.qtyScrap}</td>
                    <td className="px-3 py-2">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                        style={{ background: STATUS_COLOR[r.status] || '#666' }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {r.status !== 'Completed' && r.status !== 'Scrapped' ? (
                        <div className="flex gap-1">
                          <input
                            type="number"
                            className="w-14 border border-harvics-burgundy/20 px-1 py-0.5 text-[11px]"
                            placeholder="done"
                            defaultValue={r.qtyDone}
                            onChange={(e) =>
                              setReport((prev) => ({
                                ...prev,
                                [r.id]: { qtyDone: e.target.value, qtyScrap: prev[r.id]?.qtyScrap ?? String(r.qtyScrap || 0) },
                              }))
                            }
                          />
                          <input
                            type="number"
                            className="w-14 border border-harvics-burgundy/20 px-1 py-0.5 text-[11px]"
                            placeholder="scrap"
                            defaultValue={r.qtyScrap}
                            onChange={(e) =>
                              setReport((prev) => ({
                                ...prev,
                                [r.id]: { qtyScrap: e.target.value, qtyDone: prev[r.id]?.qtyDone ?? String(r.qtyDone || 0) },
                              }))
                            }
                          />
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {r.status === 'Queued' ? (
                          <button
                            type="button"
                            onClick={() => void doReport(r.id, 'InProgress')}
                            className="border border-harvics-gold/50 px-2 py-0.5 text-[9px] font-bold uppercase"
                          >
                            Start
                          </button>
                        ) : null}
                        {r.status === 'InProgress' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void doReport(r.id, 'Paused')}
                              className="border border-harvics-burgundy/30 px-2 py-0.5 text-[9px] font-bold uppercase"
                            >
                              Pause
                            </button>
                            <button
                              type="button"
                              onClick={() => void doReport(r.id, 'Completed')}
                              className="border border-harvics-gold/50 px-2 py-0.5 text-[9px] font-bold uppercase"
                            >
                              Complete
                            </button>
                          </>
                        ) : null}
                        {r.status === 'Paused' ? (
                          <button
                            type="button"
                            onClick={() => void doReport(r.id, 'InProgress')}
                            className="border border-harvics-gold/50 px-2 py-0.5 text-[9px] font-bold uppercase"
                          >
                            Resume
                          </button>
                        ) : null}
                      </div>
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
