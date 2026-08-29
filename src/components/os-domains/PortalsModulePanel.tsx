'use client'

/**
 * Shared portal session CRUD for Modules #69–71.
 * portalType: customer | vendor | field
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { authHeaders } from '@/components/os/w5ui'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

export type PortalType = 'customer' | 'vendor' | 'field'

type PortalTab = 'sessions' | 'start' | 'actions'

export const PORTAL_META: Record<
  PortalType,
  {
    no: string
    title: string
    status: 'demo' | 'live'
    path: string
    actions: string[]
  }
> = {
  customer: {
    no: '#69',
    title: 'Customer Portal',
    status: 'live',
    path: '/os/portal-customer',
    actions: ['viewed_invoices', 'placed_order', 'raised_ticket', 'updated_profile', 'downloaded_report'],
  },
  vendor: {
    no: '#70',
    title: 'Vendor Portal',
    status: 'live',
    path: '/os/portal-vendor',
    actions: ['viewed_pos', 'submitted_invoice', 'updated_asn', 'raised_ticket', 'downloaded_report'],
  },
  field: {
    no: '#71',
    title: 'Field Officer Portal',
    status: 'live',
    path: '/os/portal-field',
    actions: ['check_in', 'visit_logged', 'sample_collected', 'geo_tag', 'photo_upload', 'order_taken', 'stock_count'],
  },
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

export default function PortalsModulePanel({
  portalType,
  showSiblingLinks = true,
}: {
  portalType: PortalType
  showSiblingLinks?: boolean
}) {
  const [tab, setTab] = useState<PortalTab>('sessions')
  const [sessions, setSessions] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ externalId: '', externalName: '' })
  const [act, setAct] = useState<Record<string, string>>({})

  const meta = PORTAL_META[portalType]
  const locale = useLocale()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const typeQ = `portalType=${portalType}`
      const [sess, acts] = await Promise.all([
        api(`/api/wave6/portal-sessions?${typeQ}`),
        api(`/api/wave6/portal-actions?${typeQ}`),
      ])
      let sessionRows = sess.data || []
      let actionRows = acts.data || []
      if (portalType === 'vendor') {
        const [suppS, suppA] = await Promise.all([
          api('/api/wave6/portal-sessions?portalType=supplier'),
          api('/api/wave6/portal-actions?portalType=supplier'),
        ])
        const ids = new Set(sessionRows.map((s: any) => s.id))
        for (const s of suppS.data || []) if (!ids.has(s.id)) sessionRows.push(s)
        const aids = new Set(actionRows.map((a: any) => a.id))
        for (const a of suppA.data || []) if (!aids.has(a.id)) actionRows.push(a)
      }
      setSessions(sessionRows)
      setActions(actionRows)
    } catch (e: any) {
      setError(e.message || 'Failed to load portal sessions')
    } finally {
      setLoading(false)
    }
  }, [portalType])

  useEffect(() => {
    void load()
  }, [load])

  const start = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.externalId.trim() || !form.externalName.trim()) throw new Error('ID + name required')
      await api('/api/wave6/portal-sessions', {
        method: 'POST',
        body: JSON.stringify({ portalType, ...form }),
      })
      setForm({ externalId: '', externalName: '' })
      setMessage(`${meta.title} session started for ${form.externalName}`)
      await load()
      setTab('sessions')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const logAction = async (id: string) => {
    try {
      setError('')
      const a = act[id]
      if (!a) throw new Error('Pick an action')
      await api(`/api/wave6/portal-sessions/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action: a }),
      })
      setAct({ ...act, [id]: '' })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const loadDemoOfficer = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/wave6/portal-sessions', {
        method: 'POST',
        body: JSON.stringify({
          portalType: 'field',
          externalId: 'fo-001',
          externalName: 'Omar Farouk',
        }),
      })
      const sid = r.data?.id
      if (sid) {
        for (const action of ['check_in', 'visit_logged', 'sample_collected', 'geo_tag']) {
          await api(`/api/wave6/portal-sessions/${sid}/action`, {
            method: 'POST',
            body: JSON.stringify({ action, payload: { territory: 'AE', demo: true } }),
          })
        }
      }
      setMessage('Demo field officer Omar Farouk loaded (check-in + 3 actions)')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">
            Module {meta.no} · Portals · {meta.status}
          </p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            {meta.title}
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ portal sessions · action ledger · detail documents · portalType=
            <b>{portalType}</b>.
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

      {showSiblingLinks ? (
        <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
          {(Object.keys(PORTAL_META) as PortalType[]).map((t) => {
            const m = PORTAL_META[t]
            const active = t === portalType
            return (
              <Link
                key={t}
                href={`/${locale}${m.path}`}
                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] ${
                  active
                    ? 'bg-harvics-burgundy text-harvics-cream'
                    : 'border border-harvics-burgundy/30 text-harvics-burgundy'
                }`}
              >
                {m.no} {m.title.replace(' Portal', '')}
              </Link>
            )
          })}
        </div>
      ) : null}

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? (
        <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div>
      ) : null}


      <OsSapAiPanel
        title={
          portalType === 'customer'
            ? 'Customer portal AI'
            : portalType === 'vendor'
              ? 'Vendor portal AI'
              : 'Field portal AI'
        }
        subtitle="Session health and action-funnel coaching for portal operators"
        endpoint="/api/intelligence/advise"
        body={{
          domain: `portal-${portalType}`,
          prompt:
            portalType === 'customer'
              ? 'Advise on customer portal session health and self-service conversion.'
              : portalType === 'vendor'
                ? 'Advise on vendor portal ASN/invoice action backlog.'
                : 'Advise on field-officer portal check-ins and visit completion risk.',
        }}
        cta="Advise portal"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Sessions', value: sessions.length },
          { label: 'Actions', value: actions.length },
          { label: 'Avg acts', value: sessions.length ? Math.round(sessions.reduce((s, x) => s + (x.actionsCount || 0), 0) / sessions.length) : 0 },
          { label: 'Type', value: portalType },
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
            ['sessions', 'Sessions'],
            ['start', 'Start'],
            ['actions', 'Actions'],
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

      {tab === 'start' ? (
        <div className="max-w-lg border border-harvics-burgundy/15 bg-white p-4">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">Start {meta.title} session</div>
          <div className="mb-3 border-l-4 border-harvics-gold bg-harvics-cream px-3 py-2 text-[11px]">
            Type <b>{portalType}</b> · status <b>{meta.status}</b>
          </div>
          <label className="mb-2 block text-[11px]">
            External ID *
            <input
              className="mt-1 w-full border border-harvics-burgundy/30 px-2 py-1.5 text-sm"
              value={form.externalId}
              onChange={(e) => setForm({ ...form, externalId: e.target.value })}
            />
          </label>
          <label className="mb-3 block text-[11px]">
            External name *
            <input
              className="mt-1 w-full border border-harvics-burgundy/30 px-2 py-1.5 text-sm"
              value={form.externalName}
              onChange={(e) => setForm({ ...form, externalName: e.target.value })}
            />
          </label>
          <button
            type="button"
            onClick={() => void start()}
            className="bg-harvics-gold px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-harvics-burgundy"
          >
            + Start session
          </button>
          {portalType === 'field' ? (
            <button
              type="button"
              onClick={() => void loadDemoOfficer()}
              className="ml-2 border border-harvics-burgundy px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em]"
            >
              Load demo officer
            </button>
          ) : null}
        </div>
      ) : null}

      {tab === 'sessions' ? (
        <div className="border border-harvics-burgundy/15 bg-white p-4">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">
            Sessions — {portalType} ({loading ? '…' : sessions.length})
          </div>
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="bg-harvics-burgundy text-harvics-cream">
                  <th className="p-2">External</th>
                  <th className="p-2">Login</th>
                  <th className="p-2">Actions</th>
                  <th className="p-2">Last</th>
                  <th className="p-2">Log</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-harvics-burgundy/10">
                    <td className="p-2">
                      <Link href={`/${locale}${meta.path}/${s.id}`} className="font-semibold underline">
                        {s.externalId}
                      </Link>
                      <br />
                      <span className="text-[11px] text-harvics-burgundy/60">{s.externalName}</span>
                    </td>
                    <td className="p-2 text-[11px]">{new Date(s.loginAt).toLocaleString()}</td>
                    <td className="p-2 font-mono font-semibold">{s.actionsCount}</td>
                    <td className="p-2 text-[11px]">
                      {s.lastActionAt ? new Date(s.lastActionAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="p-2">
                      <select
                        className="mr-1 border border-harvics-burgundy/30 px-1 py-0.5 text-[10px]"
                        value={act[s.id] || ''}
                        onChange={(e) => setAct({ ...act, [s.id]: e.target.value })}
                      >
                        <option value="">--</option>
                        {meta.actions.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="border border-harvics-burgundy px-2 py-0.5 text-[10px] font-bold"
                        onClick={() => void logAction(s.id)}
                      >
                        Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && sessions.length === 0 ? (
              <p className="py-6 text-center text-sm text-harvics-burgundy/50">No sessions for this portal yet.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === 'actions' ? (
        <div className="border border-harvics-burgundy/15 bg-white p-4">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">Recent actions</div>
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">When</th>
                <th className="p-2">External</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 text-[11px]">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="p-2">{a.externalId}</td>
                  <td className="p-2 font-semibold">{a.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
