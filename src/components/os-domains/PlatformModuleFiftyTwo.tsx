'use client'

/**
 * Module #52 — Document Vault (SAP+ workspace)
 * Tabs: Vault · Workflow · Register
 * Status: Draft → Active → Signed → Expired → Archived
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'vault' | 'workflow' | 'register'

const DOC_NEXT: Record<string, string[]> = {
  Draft: ['Active', 'Archived'],
  Active: ['Signed', 'Expired', 'Archived'],
  Signed: ['Expired', 'Archived'],
  Expired: ['Archived'],
  Archived: [],
}

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

export default function PlatformModuleFiftyTwo() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('vault')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    type: 'Contract',
    category: 'legal',
    url: '',
    status: 'Draft',
    ownerId: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/v2/documents')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #52')
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
      if (!form.title || !form.type) throw new Error('Title + type required')
      await api('/api/v2/documents', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          url: form.url || null,
          ownerId: form.ownerId || null,
          category: form.category || null,
        }),
      })
      setForm({ title: '', type: 'Contract', category: 'legal', url: '', status: 'Draft', ownerId: '' })
      setMessage('Document registered')
      await load()
      setTab('vault')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/v2/documents/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Document → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete document?')) return
    try {
      setError('')
      await api(`/api/v2/documents/${id}`, { method: 'DELETE' })
      setMessage('Deleted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const live = rows.filter((r) => r.status === 'Signed' || r.status === 'Active').length
  const selected = rows.find((r) => r.id === sel)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #52 · Platform</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Document Vault
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ contracts · Draft → Active → Signed → Archived.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Document vault AI"
        subtitle="Flags stale or incomplete controlled documents"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'documents', prompt: 'Advise on document vault hygiene and missing controlled docs.' }}
        cta="Advise docs"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          { label: 'Documents', value: rows.length },
          { label: 'Signed/Active', value: live },
          { label: 'Draft', value: rows.filter((r) => r.status === 'Draft').length },
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
            ['vault', 'Vault'],
            ['workflow', 'Workflow'],
            ['register', 'Register'],
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

      {!loading && tab === 'vault' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Title', 'Type', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-t border-harvics-burgundy/10">
                  <td className="px-3 py-2">
                    <Link href={`/${locale}/os/document-vault/${d.id}`} className="font-semibold underline">
                      {d.title}
                    </Link>
                    <div className="text-[11px] text-harvics-burgundy/50">{d.category || '—'}</div>
                  </td>
                  <td className="px-3 py-2">{d.type}</td>
                  <td className="px-3 py-2">{d.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSel(d.id)
                          setTab('workflow')
                        }}
                        className="border border-harvics-gold/50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                      >
                        Flow
                      </button>
                      {(DOC_NEXT[d.status] || []).slice(0, 2).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void setStatus(d.id, s)}
                          className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream"
                        >
                          {s}
                        </button>
                      ))}
                      <button type="button" onClick={() => void remove(d.id)} className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]">
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">Vault empty.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'workflow' ? (
        <div className="max-w-lg space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Status workflow</p>
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={sel || ''} onChange={(e) => setSel(e.target.value || null)}>
            <option value="">Select document…</option>
            {rows.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.status})
              </option>
            ))}
          </select>
          {selected ? (
            <>
              <p className="text-sm">
                Current: <strong>{selected.status}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {(DOC_NEXT[selected.status] || []).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void setStatus(selected.id, s)}
                    className="bg-harvics-burgundy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                  >
                    → {s}
                  </button>
                ))}
                {(DOC_NEXT[selected.status] || []).length === 0 ? <span className="text-sm text-harvics-burgundy/50">Terminal status</span> : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'register' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Register document</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['Contract', 'Policy', 'Invoice', 'Certificate', 'Other'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Register
          </button>
        </div>
      ) : null}
    </div>
  )
}
