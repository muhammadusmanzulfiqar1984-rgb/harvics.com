'use client'

/**
 * Module #58 — Globalisation (SAP+ workspace)
 * Tabs: Locales · Add · Formats
 * Workflow: Enabled ↔ Disabled
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'locales' | 'add' | 'formats'

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

export default function DataAIModuleFiftyEight() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('locales')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    code: '',
    name: '',
    direction: 'ltr',
    enabled: 'true',
    fallback: 'en',
    dateFormat: 'YYYY-MM-DD',
    currency: 'USD',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/platform/locales')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #58')
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
      if (!form.code || !form.name) throw new Error('Code + name required')
      await api('/api/platform/locales', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          direction: form.direction,
          enabled: form.enabled === 'true',
          fallback: form.fallback || null,
          dateFormat: form.dateFormat || null,
          currency: form.currency || null,
        }),
      })
      setForm({
        code: '',
        name: '',
        direction: 'ltr',
        enabled: 'true',
        fallback: 'en',
        dateFormat: 'YYYY-MM-DD',
        currency: 'USD',
      })
      setMessage('Locale added')
      await load()
      setTab('locales')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggle = async (id: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/platform/locales/${id}/toggle`, { method: 'POST', body: '{}' })
      setMessage(`Locale ${r.data?.enabled ? 'enabled' : 'disabled'}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete locale?')) return
    try {
      setError('')
      await api(`/api/platform/locales/${id}`, { method: 'DELETE' })
      setMessage('Locale deleted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const rtl = rows.filter((r) => r.direction === 'rtl').length
  const enabled = rows.filter((r) => r.enabled).length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #58 · Data & AI</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Globalisation
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ locale registry · LTR/RTL · enable/disable workflow · audited.
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
        title="Globalisation AI"
        subtitle="Flags locale coverage gaps for go-live markets"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'locales', prompt: 'Advise on locale enablement gaps for global rollout.' }}
        cta="Advise locales"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Locales', value: rows.length },
          { label: 'Enabled', value: enabled },
          { label: 'RTL', value: rtl },
          { label: 'LTR', value: rows.length - rtl },
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
            ['locales', 'Locales'],
            ['add', 'Add'],
            ['formats', 'Formats'],
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

      {!loading && tab === 'locales' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">Code</th>
                <th className="p-2">Name</th>
                <th className="p-2">Dir</th>
                <th className="p-2">Status</th>
                <th className="p-2">Workflow</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 font-mono font-semibold">
                    <Link href={`/${locale}/os/locales/${l.id}`} className="underline">
                      {l.code}
                    </Link>
                  </td>
                  <td className="p-2">{l.name}</td>
                  <td className="p-2 uppercase">{l.direction}</td>
                  <td className="p-2 font-semibold">{l.enabled ? 'Enabled' : 'Disabled'}</td>
                  <td className="p-2 space-x-1">
                    <button
                      type="button"
                      onClick={() => void toggle(l.id)}
                      className="border border-harvics-burgundy px-2 py-0.5 text-[10px] font-bold uppercase"
                    >
                      {l.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(l.id)}
                      className="border border-red-400 px-2 py-0.5 text-[10px] font-bold uppercase text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'add' ? (
        <div className="max-w-lg space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add locale</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Code *"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={form.direction}
              onChange={(e) => setForm({ ...form, direction: e.target.value })}
            >
              <option value="ltr">ltr</option>
              <option value="rtl">rtl</option>
            </select>
            <input
              className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Fallback"
              value={form.fallback}
              onChange={(e) => setForm({ ...form, fallback: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Date format"
              value={form.dateFormat}
              onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
            />
            <input
              className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
            />
          </div>
          <button
            type="button"
            onClick={() => void create()}
            className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            + Add locale
          </button>
        </div>
      ) : null}

      {!loading && tab === 'formats' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">Code</th>
                <th className="p-2">Date</th>
                <th className="p-2">Currency</th>
                <th className="p-2">Fallback</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 font-mono font-semibold">{l.code}</td>
                  <td className="p-2 font-mono text-[11px]">{l.dateFormat || '—'}</td>
                  <td className="p-2">{l.currency || '—'}</td>
                  <td className="p-2">{l.fallback || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
