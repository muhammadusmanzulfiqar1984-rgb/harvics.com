'use client'

/**
 * Module #55 — Data Ocean (SAP+ workspace)
 * Tabs: Snapshots · Capture · Lake
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'snapshots' | 'capture' | 'lake'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

export default function DataAIModuleFiftyFive() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('snapshots')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [snaps, setSnaps] = useState<any[]>([])
  const [tables, setTables] = useState<string[]>([])
  const [stats, setStats] = useState<any>(null)
  const [pick, setPick] = useState('Customer')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [a, s] = await Promise.all([api('/api/wave7/snapshots'), api('/api/wave7/lake-stats')])
      setSnaps(a.data || [])
      setTables(a.snapshottableTables || [])
      setStats(s.data || {})
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #55')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const snap = async () => {
    try {
      setError('')
      setMessage('')
      if (!pick) throw new Error('Pick a table')
      await api('/api/wave7/snapshots', {
        method: 'POST',
        body: JSON.stringify({ tableName: pick, capturedBy: 'os-user' }),
      })
      setMessage(`Snapshot captured for ${pick}`)
      await load()
      setTab('snapshots')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #55 · Data & AI</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Data Ocean
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ lake snapshots · warehouse telemetry · immutable artefacts.
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
        title="Data Ocean AI"
        subtitle="Ranks snapshots for freshness and coverage"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'data-ocean', prompt: 'Advise which data-ocean snapshots need refresh or governance.' }}
        cta="Advise ocean"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Snapshots', value: snaps.length },
          { label: 'Lake MB', value: stats?.totalMB ?? 0 },
          { label: 'Tables', value: stats?.byTable?.length ?? 0 },
          { label: 'Sources', value: tables.length },
        ].map((k) => (
          <div
            key={k.label}
            className="border border-harvics-burgundy/15 bg-white p-3"
            style={{ borderTop: '3px solid var(--harvics-gold)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['snapshots', 'Snapshots'],
            ['capture', 'Capture'],
            ['lake', 'Lake'],
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

      {!loading && tab === 'snapshots' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">When</th>
                <th className="p-2">Table</th>
                <th className="p-2">Records</th>
                <th className="p-2">Size</th>
                <th className="p-2">Ref</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {snaps.map((s) => (
                <tr key={s.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 text-[11px]">{new Date(s.capturedAt).toLocaleString()}</td>
                  <td className="p-2 font-semibold">{s.tableName}</td>
                  <td className="p-2 font-mono">{Number(s.recordCount).toLocaleString()}</td>
                  <td className="p-2">{(s.sizeBytes / 1024).toFixed(1)} KB</td>
                  <td className="p-2 font-mono text-[10px]">{s.storageRef}</td>
                  <td className="p-2">
                    <Link
                      href={`/${locale}/os/data-ocean/snapshots/${s.id}`}
                      className="text-[10px] font-bold uppercase underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {snaps.length === 0 ? (
            <p className="py-8 text-center text-sm text-harvics-burgundy/50">No snapshots yet.</p>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'capture' ? (
        <div className="max-w-lg space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Capture snapshot</p>
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
          >
            {tables.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void snap()}
            className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Snapshot now
          </button>
        </div>
      ) : null}

      {!loading && tab === 'lake' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">Table</th>
                <th className="p-2">Snaps</th>
                <th className="p-2">Records</th>
                <th className="p-2">Bytes</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.byTable || []).map((t: any) => (
                <tr key={t.table} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 font-semibold">{t.table}</td>
                  <td className="p-2 font-mono">{t.snapshots}</td>
                  <td className="p-2 font-mono">{Number(t.totalRecords).toLocaleString()}</td>
                  <td className="p-2 font-mono">{Number(t.totalBytes).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
