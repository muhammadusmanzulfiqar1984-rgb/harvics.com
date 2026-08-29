'use client'

/**
 * Module #56 — AI Engine (SAP+ workspace)
 * Tabs: Models · Register · Intelligence
 * Workflow: Active ↔ Disabled ↔ Deprecated
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'models' | 'register' | 'intelligence'

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

export default function DataAIModuleFiftySix() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('models')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [intel, setIntel] = useState<any>(null)
  const [form, setForm] = useState({ name: '', provider: 'openai', status: 'Active' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [models, anomalies, automation, insights] = await Promise.all([
        api('/api/ai/models'),
        api('/api/intelligence/anomalies').catch(() => ({ anomalies: [] })),
        api('/api/intelligence/automation-score').catch(() => ({})),
        api('/api/intelligence/insights').catch(() => ({ domains: {} })),
      ])
      setRows(models.data || [])
      setIntel({
        anomalies: anomalies.anomalies || [],
        automation,
        insights: insights.domains || {},
      })
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #56')
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
      if (!form.name || !form.provider) throw new Error('Name + provider required')
      await api('/api/ai/models', { method: 'POST', body: JSON.stringify(form) })
      setForm({ name: '', provider: 'openai', status: 'Active' })
      setMessage('Model registered')
      await load()
      setTab('models')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/ai/models/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete model?')) return
    try {
      setError('')
      await api(`/api/ai/models/${id}`, { method: 'DELETE' })
      setMessage('Model deleted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const active = rows.filter((r) => r.status === 'Active').length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #56 · Data & AI</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            AI Engine
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ model registry · Active→Disabled→Deprecated · live intelligence.
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
        title="AI Engine coach"
        subtitle="Checks model registry health and inactive models"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'ai-engine', prompt: 'Advise on AI model registry health and which models to activate or retire.' }}
        cta="Advise AI engine"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Models', value: rows.length },
          { label: 'Active', value: active },
          { label: 'Anomalies', value: intel?.anomalies?.length ?? 0 },
          { label: 'Automation', value: intel?.automation?.overall ?? '—' },
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
            ['models', 'Models'],
            ['register', 'Register'],
            ['intelligence', 'Intelligence'],
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

      {!loading && tab === 'models' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">Name</th>
                <th className="p-2">Provider</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
                <th className="p-2">Workflow</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2">
                    <Link href={`/${locale}/os/ai-engine/models/${m.id}`} className="font-semibold underline">
                      {m.name}
                    </Link>
                  </td>
                  <td className="p-2">{m.provider}</td>
                  <td className="p-2 font-semibold">{m.status}</td>
                  <td className="p-2 text-[11px]">{m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}</td>
                  <td className="p-2 space-x-1">
                    {m.status !== 'Active' ? (
                      <button
                        type="button"
                        onClick={() => void setStatus(m.id, 'Active')}
                        className="border border-harvics-burgundy px-2 py-0.5 text-[10px] font-bold uppercase"
                      >
                        Enable
                      </button>
                    ) : null}
                    {m.status === 'Active' ? (
                      <button
                        type="button"
                        onClick={() => void setStatus(m.id, 'Disabled')}
                        className="border border-harvics-burgundy px-2 py-0.5 text-[10px] font-bold uppercase"
                      >
                        Disable
                      </button>
                    ) : null}
                    {m.status !== 'Deprecated' ? (
                      <button
                        type="button"
                        onClick={() => void setStatus(m.id, 'Deprecated')}
                        className="border border-harvics-burgundy/40 px-2 py-0.5 text-[10px] font-bold uppercase"
                      >
                        Deprecate
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void remove(m.id)}
                      className="border border-red-400 px-2 py-0.5 text-[10px] font-bold uppercase text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-harvics-burgundy/50">No models yet.</p>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'register' ? (
        <div className="max-w-lg space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Register model</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
          >
            {['openai', 'anthropic', 'groq', 'workers-ai', 'custom'].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {['Active', 'Disabled', 'Deprecated'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void create()}
            className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            + Register
          </button>
        </div>
      ) : null}

      {!loading && tab === 'intelligence' ? (
        <div className="space-y-3">
          {(intel?.anomalies || []).length === 0 ? (
            <p className="border border-harvics-burgundy/15 bg-harvics-cream/40 p-4 text-sm text-harvics-burgundy/60">
              No anomalies from operational data.
            </p>
          ) : (
            <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead>
                  <tr className="bg-harvics-burgundy text-harvics-cream">
                    <th className="p-2">Domain</th>
                    <th className="p-2">Severity</th>
                    <th className="p-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {(intel?.anomalies || []).slice(0, 12).map((a: any, i: number) => (
                    <tr key={i} className="border-b border-harvics-burgundy/10">
                      <td className="p-2">{a.domain}</td>
                      <td className="p-2 font-semibold">{a.severity}</td>
                      <td className="p-2 text-[11px]">{a.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
