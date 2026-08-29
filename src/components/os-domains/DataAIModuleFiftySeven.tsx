'use client'

/**
 * Module #57 — Harvoice (SAP+ workspace)
 * Tabs: Console · History · Stats
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'console' | 'history' | 'stats'

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

const EXAMPLES = [
  'Search invoices over 5000',
  'Create new customer Acme Corp',
  'Open dashboard',
  'Generate sales report for May',
]

export default function DataAIModuleFiftySeven() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('console')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [commands, setCommands] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [transcript, setTranscript] = useState('')
  const [last, setLast] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, s] = await Promise.all([api('/api/wave7/voice/commands'), api('/api/wave7/voice/stats')])
      setCommands(c.data || [])
      setStats(s.data || {})
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #57')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const send = async () => {
    try {
      setError('')
      setMessage('')
      if (!transcript.trim()) throw new Error('Transcript required')
      const r = await api('/api/wave7/voice/transcribe', {
        method: 'POST',
        body: JSON.stringify({ transcript, userId: 'os-user' }),
      })
      setLast(r.data)
      setTranscript('')
      setMessage(`Intent: ${r.data.intent} (${Math.round((r.data.confidence || 0) * 100)}%)`)
      await load()
      setTab('history')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #57 · Data & AI</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Harvoice
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ voice/text NLU · intent routing · audited command ledger.
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
        title="Harvoice AI"
        subtitle="Improves voice-command success and coverage"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'harvoice', prompt: 'Advise on Harvoice command coverage and failure patterns.' }}
        cta="Advise Harvoice"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Commands', value: stats?.total ?? commands.length },
          { label: 'Avg conf', value: stats?.avgConfidence ?? '—' },
          { label: 'Avg ms', value: stats?.avgDurationMs ?? '—' },
          { label: 'Intents', value: stats?.byIntent?.length ?? 0 },
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
            ['console', 'Console'],
            ['history', 'History'],
            ['stats', 'Stats'],
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

      {!loading && tab === 'console' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Speak / type</p>
            <textarea
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Command transcript…"
            />
            <button
              type="button"
              onClick={() => void send()}
              className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Process
            </button>
            <div className="space-y-1">
              {EXAMPLES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setTranscript(e)}
                  className="block w-full border-l-4 border-harvics-gold bg-white px-3 py-2 text-left text-[11px]"
                >
                  “{e}”
                </button>
              ))}
            </div>
          </div>
          {last ? (
            <div className="border border-harvics-burgundy/15 bg-white p-4" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Last result</p>
              <p className="mt-2 text-sm font-semibold">{last.intent}</p>
              <p className="mt-1 text-[12px] text-harvics-burgundy/70">{last.responseText}</p>
              <p className="mt-2 font-mono text-[11px]">conf {(last.confidence * 100).toFixed(0)}%</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'history' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">When</th>
                <th className="p-2">Transcript</th>
                <th className="p-2">Intent</th>
                <th className="p-2">Conf</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {commands.map((c) => (
                <tr key={c.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 text-[11px]">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="p-2 text-[11px] italic">“{c.transcript}”</td>
                  <td className="p-2 font-semibold">{c.intent}</td>
                  <td className="p-2 font-mono">{Math.round((c.confidence || 0) * 100)}%</td>
                  <td className="p-2">
                    <Link
                      href={`/${locale}/os/harvoice/commands/${c.id}`}
                      className="text-[10px] font-bold uppercase underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'stats' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">Intent</th>
                <th className="p-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.byIntent || []).map((i: any) => (
                <tr key={i.intent} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 font-semibold">{i.intent}</td>
                  <td className="p-2 font-mono">{i.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
