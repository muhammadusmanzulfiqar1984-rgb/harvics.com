'use client'

/**
 * Module #51 — Notifications (SAP+ workspace)
 * Tabs: Inbox · Unread · Compose
 * Workflow: Unread → Read
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'inbox' | 'unread' | 'compose'

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

export default function PlatformModuleFiftyOne() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('inbox')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    title: '',
    message: '',
    channel: 'in-app',
    category: 'system',
    severity: 'info',
    userId: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/v2/notifications')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #51')
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
      if (!form.title || !form.message) throw new Error('Title + message required')
      await api('/api/v2/notifications', {
        method: 'POST',
        body: JSON.stringify({ ...form, userId: form.userId || null }),
      })
      setForm({ title: '', message: '', channel: 'in-app', category: 'system', severity: 'info', userId: '' })
      setMessage('Notification sent')
      await load()
      setTab('inbox')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const markRead = async (id: string) => {
    try {
      setError('')
      await api(`/api/v2/notifications/${id}/read`, { method: 'POST', body: '{}' })
      setMessage('Marked read')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete notification?')) return
    try {
      setError('')
      await api(`/api/v2/notifications/${id}`, { method: 'DELETE' })
      setMessage('Deleted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const unread = rows.filter((r) => !r.read)
  const list = tab === 'unread' ? unread : rows

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #51 · Platform</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Notifications
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ channels · severity · Unread → Read.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Notification AI"
        subtitle="Prioritises unread critical alerts"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'notifications', prompt: 'Prioritise unread notifications and recommend which to clear first.' }}
        cta="Advise alerts"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          { label: 'Total', value: rows.length },
          { label: 'Unread', value: unread.length },
          { label: 'Read', value: rows.length - unread.length },
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
            ['inbox', 'Inbox'],
            ['unread', 'Unread'],
            ['compose', 'Compose'],
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

      {!loading && (tab === 'inbox' || tab === 'unread') ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['When', 'Title', 'Channel', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((n) => (
                <tr key={n.id} className="border-t border-harvics-burgundy/10">
                  <td className="px-3 py-2 text-xs">{new Date(n.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <Link href={`/${locale}/os/notifications/${n.id}`} className="font-semibold underline">
                      {n.title}
                    </Link>
                    <div className="text-[11px] text-harvics-burgundy/50">{n.message?.slice(0, 80)}</div>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {n.channel} · {n.severity}
                  </td>
                  <td className="px-3 py-2">{n.read ? 'Read' : 'Unread'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {!n.read ? (
                        <button type="button" onClick={() => void markRead(n.id)} className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream">
                          Mark read
                        </button>
                      ) : null}
                      <button type="button" onClick={() => void remove(n.id)} className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]">
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No notifications.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'compose' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Compose</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" rows={3} placeholder="Message *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
            {['in-app', 'email', 'sms', 'push'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            {['info', 'success', 'warning', 'error'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="User ID" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} />
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Send
          </button>
        </div>
      ) : null}
    </div>
  )
}
