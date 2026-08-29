'use client'

/**
 * Module #40 — Neural Governance (SAP+ workspace)
 * Tabs: Policies · Decisions · Create
 * Toggle enabled = audited policy update
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'policies' | 'decisions' | 'create'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || json?.issues?.[0]?.message || `HTTP ${res.status}`)
  return json
}

export default function GovernanceModuleForty() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('policies')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [policies, setPolicies] = useState<any[]>([])
  const [decisions, setDecisions] = useState<any[]>([])
  const [summary, setSummary] = useState({ allow: 0, deny: 0, warn: 0 })
  const [form, setForm] = useState({
    name: '',
    scope: 'global',
    targetKey: '',
    severity: 'medium',
    enabled: true,
    rule: '{"type":"rate-limit","params":{"max":100}}',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [p, d] = await Promise.all([
        api('/api/platform/governance/policies'),
        api('/api/platform/governance/decisions?limit=50'),
      ])
      setPolicies(p.data || [])
      setDecisions(d.data || [])
      setSummary(d.summary || { allow: 0, deny: 0, warn: 0 })
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #40')
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
      let rule: any
      try {
        rule = JSON.parse(form.rule)
      } catch {
        throw new Error('Rule must be valid JSON')
      }
      const r = await api('/api/platform/governance/policies', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          scope: form.scope,
          targetKey: form.targetKey || null,
          severity: form.severity,
          enabled: form.enabled,
          rule,
        }),
      })
      setForm((f) => ({ ...f, name: '', targetKey: '' }))
      setMessage(`Policy ${r.data?.name} created`)
      await load()
      setTab('policies')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggle = async (p: any) => {
    try {
      setError('')
      await api(`/api/platform/governance/policies/${p.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: !p.enabled }),
      })
      setMessage(p.enabled ? 'Policy disabled' : 'Policy enabled')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: string) => {
    try {
      setError('')
      await api(`/api/platform/governance/policies/${id}`, { method: 'DELETE' })
      setMessage('Policy deleted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #40 · GRC</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Neural Governance
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ policy registry · decision log · audited enable/disable.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Policy governance AI"
        subtitle="Reviews neural governance policy coverage and drift"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'governance', prompt: 'Advise on governance policy coverage gaps and enforcement risks.' }}
        cta="Advise governance"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Policies', value: policies.length },
          { label: 'Allow', value: summary.allow },
          { label: 'Warn', value: summary.warn },
          { label: 'Deny', value: summary.deny },
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
            ['policies', 'Policies'],
            ['decisions', 'Decisions'],
            ['create', 'New policy'],
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
        <div className="max-w-lg space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New policy</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}>
            <option>global</option>
            <option>module</option>
            <option>route</option>
          </select>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Target key" value={form.targetKey} onChange={(e) => setForm((f) => ({ ...f, targetKey: e.target.value }))} />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
            <option>low</option>
            <option>medium</option>
            <option>high</option>
            <option>critical</option>
          </select>
          <textarea className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 font-mono text-xs" rows={3} value={form.rule} onChange={(e) => setForm((f) => ({ ...f, rule: e.target.value }))} />
          <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Create policy
          </button>
        </div>
      ) : null}

      {!loading && tab === 'policies' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Name', 'Scope', 'Severity', 'Enabled', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No policies.
                  </td>
                </tr>
              ) : (
                policies.map((p, i) => (
                  <tr key={p.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-semibold">
                      <Link href={`/${locale}/os/governance/policies/${p.id}`} className="underline decoration-harvics-gold/50">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      {p.scope}
                      {p.targetKey ? ` · ${p.targetKey}` : ''}
                    </td>
                    <td className="px-3 py-2">{p.severity}</td>
                    <td className="px-3 py-2">{p.enabled ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => void toggle(p)} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                          {p.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button type="button" onClick={() => void remove(p.id)} className="border border-red-300 px-2 py-0.5 text-[9px] font-bold uppercase text-red-800">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'decisions' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['When', 'Outcome', 'Module', 'Route', 'Reason'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {decisions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No decisions logged.
                  </td>
                </tr>
              ) : (
                decisions.map((d, i) => (
                  <tr key={d.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono text-xs">{d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}</td>
                    <td className="px-3 py-2 font-semibold uppercase">{d.outcome}</td>
                    <td className="px-3 py-2">{d.module || '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{d.route || '—'}</td>
                    <td className="max-w-[32ch] truncate px-3 py-2 text-xs">{d.reason || '—'}</td>
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
