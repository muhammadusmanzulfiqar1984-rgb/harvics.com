'use client'

/**
 * Module #44 — AI Variance Commentary (SAP+ workspace)
 * Tabs: Lines · Generate · Approved
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'lines' | 'generate' | 'approved'

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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function AnalyticsModuleFortyFour() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('lines')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [rows, setRows] = useState<any[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave5/variance-commentary?period=${encodeURIComponent(period)}`)
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #44')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    void load()
  }, [load])

  const generate = async () => {
    try {
      setError('')
      setMessage('')
      if (!period) throw new Error('Period required')
      const r = await api('/api/wave5/variance-commentary/generate', {
        method: 'POST',
        body: JSON.stringify({ period }),
      })
      setMessage(`Generated ${r.total ?? 0} commentary lines for ${period}`)
      await load()
      setTab('lines')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const approve = async (id: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave5/variance-commentary/${id}/approve`, { method: 'POST', body: '{}' })
      setMessage('Commentary approved')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const over = rows.filter((r) => r.variance > 0).length
  const under = rows.filter((r) => r.variance < 0).length
  const approved = rows.filter((r) => r.approved)
  const pending = rows.filter((r) => !r.approved)
  const list = tab === 'approved' ? approved : pending

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #44 · Analytics</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            AI Variance Commentary
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ budget vs actual · classify · approve narrative.
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
        title="Variance coach AI"
        subtitle="CFO-grade commentary priorities across variance rows"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'variance-ai', prompt: 'Prioritise variance commentaries that need CFO attention.' }}
        cta="Advise variance"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Lines', value: rows.length },
          { label: 'Over', value: over },
          { label: 'Under', value: under },
          { label: 'Approved', value: approved.length },
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
            ['lines', 'Pending'],
            ['approved', 'Approved'],
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

      {!loading && (tab === 'lines' || tab === 'approved') ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Account', 'Variance', 'Class', 'Commentary', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-harvics-burgundy/10">
                  <td className="px-3 py-2">
                    <Link href={`/${locale}/os/variance-ai/${r.id}`} className="font-semibold underline">
                      {r.account}
                    </Link>
                    <div className="text-[11px] text-harvics-burgundy/50">{r.costCenter || '—'}</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {fmt(r.variance)}
                    {r.variancePct != null ? ` (${r.variancePct}%)` : ''}
                  </td>
                  <td className="px-3 py-2">{r.classification}</td>
                  <td className="max-w-xs px-3 py-2 text-xs">{r.commentary}</td>
                  <td className="px-3 py-2">
                    {!r.approved ? (
                      <button
                        type="button"
                        onClick={() => void approve(r.id)}
                        className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-harvics-gold">Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No lines in this view.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'generate' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Generate for period</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
          <p className="text-xs text-harvics-burgundy/50">Uses Controlling Base budgets + cost allocations for the period.</p>
          <button
            type="button"
            onClick={() => void generate()}
            className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Generate commentary
          </button>
        </div>
      ) : null}
    </div>
  )
}
