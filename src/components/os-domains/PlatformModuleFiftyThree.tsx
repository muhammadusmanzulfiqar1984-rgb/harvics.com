'use client'

/**
 * Module #53 — Admin & Security (SAP+ workspace)
 * Tabs: Users · Roles · New
 * Workflow: Active ↔ Disabled
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'users' | 'roles' | 'new'

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

export default function PlatformModuleFiftyThree() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('users')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [form, setForm] = useState({
    username: '',
    email: '',
    displayName: '',
    role: 'operator',
    active: 'true',
    mfaEnabled: 'false',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const url = q ? `/api/platform/admin/users?q=${encodeURIComponent(q)}` : '/api/platform/admin/users'
      const r = await api(url)
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #53')
    } finally {
      setLoading(false)
    }
  }, [q])

  useEffect(() => {
    void load()
  }, [load])

  const create = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.username) throw new Error('Username required')
      await api('/api/platform/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username,
          email: form.email || null,
          displayName: form.displayName || null,
          role: form.role,
          active: form.active === 'true',
          mfaEnabled: form.mfaEnabled === 'true',
        }),
      })
      setForm({ username: '', email: '', displayName: '', role: 'operator', active: 'true', mfaEnabled: 'false' })
      setMessage('User created')
      await load()
      setTab('users')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggleActive = async (u: any) => {
    try {
      setError('')
      setMessage('')
      if (u.active) {
        await api(`/api/platform/admin/users/${u.id}/deactivate`, { method: 'POST', body: '{}' })
        setMessage('User disabled')
      } else {
        await api(`/api/platform/admin/users/${u.id}/activate`, { method: 'POST', body: '{}' })
        setMessage('User enabled')
      }
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setRole = async (id: string, role: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/platform/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) })
      setMessage(`Role → ${role}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete user?')) return
    try {
      setError('')
      await api(`/api/platform/admin/users/${id}`, { method: 'DELETE' })
      setMessage('User deleted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const admins = rows.filter((r) => r.role === 'admin' || r.role === 'superadmin').length
  const byRole = ['operator', 'manager', 'admin', 'superadmin'].map((role) => ({
    role,
    count: rows.filter((r) => r.role === role).length,
  }))

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #53 · Platform</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Admin & Security
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ users · roles · Active ↔ Disabled · MFA flags.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Admin security AI"
        subtitle="Reviews privileged activity and access risk"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'admin', prompt: 'Advise on admin/security risk from recent privileged audit events.' }}
        cta="Advise security"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Users', value: rows.length },
          { label: 'Admins', value: admins },
          { label: 'Active', value: rows.filter((r) => r.active).length },
          { label: 'MFA on', value: rows.filter((r) => r.mfaEnabled).length },
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
            ['users', 'Users'],
            ['roles', 'Roles'],
            ['new', 'New'],
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

      {!loading && tab === 'users' ? (
        <>
          <div className="flex gap-2">
            <input
              className="max-w-xs flex-1 border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Search users…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Username', 'Role', 'MFA', 'Status', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t border-harvics-burgundy/10">
                    <td className="px-3 py-2">
                      <Link href={`/${locale}/os/admin-users/${u.id}`} className="font-semibold underline">
                        {u.username}
                      </Link>
                      <div className="text-[11px] text-harvics-burgundy/50">{u.email || u.displayName || '—'}</div>
                    </td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2">{u.mfaEnabled ? 'On' : '—'}</td>
                    <td className="px-3 py-2">{u.active ? 'Active' : 'Disabled'}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => void toggleActive(u)}
                          className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream"
                        >
                          {u.active ? 'Disable' : 'Enable'}
                        </button>
                        <button type="button" onClick={() => void remove(u.id)} className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No users.</p> : null}
          </div>
        </>
      ) : null}

      {!loading && tab === 'roles' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {byRole.map((b) => (
              <div key={b.role} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{b.role}</div>
                <div className="mt-1 font-mono text-lg font-semibold">{b.count}</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['User', 'Current', 'Grant'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t border-harvics-burgundy/10">
                    <td className="px-3 py-2 font-semibold">{u.username}</td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {['operator', 'manager', 'admin', 'superadmin']
                          .filter((r) => r !== u.role)
                          .map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => void setRole(u.id, r)}
                              className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                            >
                              {r}
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'new' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New user</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Username *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {['operator', 'manager', 'admin', 'superadmin'].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.mfaEnabled} onChange={(e) => setForm({ ...form, mfaEnabled: e.target.value })}>
            <option value="false">MFA off</option>
            <option value="true">MFA on</option>
          </select>
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Create
          </button>
        </div>
      ) : null}
    </div>
  )
}
