'use client'

/**
 * Module #54 — Integration Bus (SAP+ workspace)
 * Tabs: Endpoints · Deliveries · Dispatch
 * Workflow: toggle active · retry → DLQ
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'endpoints' | 'deliveries' | 'dispatch'

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

export default function PlatformModuleFiftyFour() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('endpoints')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [form, setForm] = useState({ code: '', name: '', url: '', method: 'POST', authType: 'none', authValue: '' })
  const [dispatch, setDispatch] = useState({
    event: 'order.created',
    endpointCode: '',
    payload: '{"orderId":"ORD-001","amount":1500}',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [e, d] = await Promise.all([api('/api/wave7/endpoints'), api('/api/wave7/deliveries')])
      setEndpoints(e.data || [])
      setDeliveries(d.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load Module #54')
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
      if (!form.code || !form.url) throw new Error('Code + URL required')
      await api('/api/wave7/endpoints', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          name: form.name || form.code,
          authValue: form.authType === 'none' ? null : form.authValue || null,
        }),
      })
      setForm({ ...form, code: '', name: '', url: '' })
      setMessage('Endpoint registered')
      await load()
      setTab('endpoints')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggle = async (id: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/wave7/endpoints/${id}/toggle`, { method: 'POST', body: '{}' })
      setMessage(`Endpoint ${r.data?.active ? 'activated' : 'deactivated'}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const send = async () => {
    try {
      setError('')
      setMessage('')
      const payload = JSON.parse(dispatch.payload || '{}')
      const r = await api('/api/wave7/dispatch', {
        method: 'POST',
        body: JSON.stringify({
          event: dispatch.event,
          endpointCode: dispatch.endpointCode || undefined,
          payload,
        }),
      })
      setMessage(`Dispatched ${r.dispatched}: ${r.delivered} ok, ${r.failed} failed`)
      await load()
      setTab('deliveries')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const retry = async (id: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/wave7/deliveries/${id}/retry`, { method: 'POST', body: '{}' })
      setMessage(r.message || `Retry → ${r.data?.status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const active = endpoints.filter((e) => e.active).length
  const failed = deliveries.filter((d) => d.status === 'Failed' || d.status === 'DLQ').length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #54 · Platform</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Integration Bus
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ webhooks · dispatch · retries · DLQ.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Integration health AI"
        subtitle="Surfaces failed deliveries and endpoint drift"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'integration-bus', prompt: 'Triage integration-bus failures and recommend remediation order.' }}
        cta="Advise bus"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Endpoints', value: endpoints.length },
          { label: 'Active', value: active },
          { label: 'Deliveries', value: deliveries.length },
          { label: 'Failed/DLQ', value: failed },
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
            ['endpoints', 'Endpoints'],
            ['deliveries', 'Deliveries'],
            ['dispatch', 'Dispatch'],
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

      {!loading && tab === 'endpoints' ? (
        <div className="space-y-4">
          <div className="max-w-lg space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Register endpoint</p>
            <div className="grid grid-cols-2 gap-2">
              <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="URL *" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <select className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {['POST', 'PUT', 'PATCH', 'GET'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.authType} onChange={(e) => setForm({ ...form, authType: e.target.value })}>
                {['none', 'bearer', 'basic', 'hmac'].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            {form.authType !== 'none' ? (
              <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Auth value" value={form.authValue} onChange={(e) => setForm({ ...form, authValue: e.target.value })} />
            ) : null}
            <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Register
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'URL', 'Auth', 'Status', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {endpoints.map((e) => (
                  <tr key={e.id} className="border-t border-harvics-burgundy/10">
                    <td className="px-3 py-2">
                      <Link href={`/${locale}/os/integration-bus/${e.id}`} className="font-semibold underline">
                        {e.code}
                      </Link>
                      <div className="text-[11px] text-harvics-burgundy/50">{e._count?.deliveries || 0} deliveries</div>
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2 font-mono text-[11px]">{e.url}</td>
                    <td className="px-3 py-2 text-xs">
                      {e.method} · {e.authType}
                    </td>
                    <td className="px-3 py-2">{e.active ? 'Active' : 'Off'}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => void toggle(e.id)} className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream">
                        {e.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {endpoints.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No endpoints.</p> : null}
          </div>
        </div>
      ) : null}

      {!loading && tab === 'deliveries' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['When', 'Endpoint', 'Event', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="border-t border-harvics-burgundy/10">
                  <td className="px-3 py-2 text-xs">{new Date(d.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 font-mono text-xs">{d.endpoint?.code || '—'}</td>
                  <td className="px-3 py-2">{d.event}</td>
                  <td className="px-3 py-2">
                    {d.status} · {d.attempts}x
                    {d.responseCode ? ` · HTTP ${d.responseCode}` : ''}
                  </td>
                  <td className="px-3 py-2">
                    {['Failed', 'Pending'].includes(d.status) ? (
                      <button type="button" onClick={() => void retry(d.id)} className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream">
                        Retry
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deliveries.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No deliveries yet.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'dispatch' ? (
        <div className="max-w-lg space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Dispatch event</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={dispatch.event} onChange={(e) => setDispatch({ ...dispatch, event: e.target.value })} placeholder="Event name" />
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={dispatch.endpointCode}
            onChange={(e) => setDispatch({ ...dispatch, endpointCode: e.target.value })}
          >
            <option value="">All active endpoints</option>
            {endpoints.map((e) => (
              <option key={e.id} value={e.code}>
                {e.code}
              </option>
            ))}
          </select>
          <textarea
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 font-mono text-xs"
            rows={4}
            value={dispatch.payload}
            onChange={(e) => setDispatch({ ...dispatch, payload: e.target.value })}
          />
          <button type="button" onClick={() => void send()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Dispatch
          </button>
        </div>
      ) : null}
    </div>
  )
}
