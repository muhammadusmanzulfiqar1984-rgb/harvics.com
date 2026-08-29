'use client'

/**
 * Module #16 — Sourcing Network (SAP+ workspace)
 * Tabs: Network · Pipeline · Qualified · Add
 * Status: Discovered → InReview → Qualified | Rejected
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'network' | 'pipeline' | 'qualified' | 'add'

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

const STATUS_COLOR: Record<string, string> = {
  Discovered: '#666',
  InReview: '#B8860B',
  Qualified: '#2E7D32',
  Rejected: '#B71C1C',
}

export default function ProcurementModuleSixteen() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('network')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [filter, setFilter] = useState({ status: '', category: '' })
  const [form, setForm] = useState({
    name: '',
    country: '',
    category: '',
    certifications: '',
    capabilities: '',
    rating: '0',
    contactEmail: '',
    contactPhone: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const q = new URLSearchParams()
      if (filter.status) q.set('status', filter.status)
      if (filter.category) q.set('category', filter.category)
      const r = await api(`/api/wave5/sourcing-suppliers?${q}`)
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #16')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    void load()
  }, [load])

  const create = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.name) throw new Error('Name required')
      const r = await api('/api/wave5/sourcing-suppliers', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          country: form.country || null,
          category: form.category || null,
          certifications: form.certifications || null,
          capabilities: form.capabilities || null,
          rating: Number(form.rating) || 0,
          contactEmail: form.contactEmail || null,
          contactPhone: form.contactPhone || null,
        }),
      })
      setForm({
        name: '',
        country: '',
        category: '',
        certifications: '',
        capabilities: '',
        rating: '0',
        contactEmail: '',
        contactPhone: '',
      })
      setMessage(`Supplier ${r.data?.name} added`)
      await load()
      setTab('network')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const qualify = async (id: string, qualifiedStatus: string) => {
    try {
      setError('')
      await api(`/api/wave5/sourcing-suppliers/${id}/qualify`, {
        method: 'POST',
        body: JSON.stringify({ qualifiedStatus }),
      })
      setMessage(`Status → ${qualifiedStatus}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const count = (s: string) => rows.filter((r) => r.qualifiedStatus === s).length

  const viewRows = useMemo(() => {
    if (tab === 'pipeline') return rows.filter((r) => ['Discovered', 'InReview'].includes(r.qualifiedStatus))
    if (tab === 'qualified') return rows.filter((r) => r.qualifiedStatus === 'Qualified')
    return rows
  }, [rows, tab])

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #16 · Procurement</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Sourcing Network
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Discover → review → qualify / reject · audited qualification pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/vendor-scorecards`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Scorecards
          </Link>
          <Link
            href={`/${locale}/os/contracts`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Contracts
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Sourcing network coach"
        subtitle="Supplier rating gaps and coverage opportunities"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'sourcing' }}
        cta="Advise sourcing"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Suppliers', rows.length, '#3D1212'],
          ['In review', count('InReview'), '#B8860B'],
          ['Qualified', count('Qualified'), '#2E7D32'],
          ['Rejected', count('Rejected'), '#B71C1C'],
        ].map(([label, n, color]) => (
          <div key={String(label)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: `3px solid ${color}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{n}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['network', 'Network'],
            ['pipeline', 'Pipeline'],
            ['qualified', 'Qualified'],
            ['add', 'Add supplier'],
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

      {tab === 'network' ? (
        <div className="flex flex-wrap gap-2">
          <select
            className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All statuses</option>
            {['Discovered', 'InReview', 'Qualified', 'Rejected'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Filter category"
            value={filter.category}
            onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}
          />
        </div>
      ) : null}

      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

      {!loading && tab === 'add' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add supplier</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Certifications"
            value={form.certifications}
            onChange={(e) => setForm((f) => ({ ...f, certifications: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Capabilities"
            value={form.capabilities}
            onChange={(e) => setForm((f) => ({ ...f, capabilities: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Email"
            value={form.contactEmail}
            onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Phone"
            value={form.contactPhone}
            onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Rating 0–5"
            type="number"
            min={0}
            max={5}
            step={0.5}
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void create()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Add supplier
          </button>
        </div>
      ) : null}

      {!loading && tab !== 'add' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Name', 'Country', 'Category', 'Rating', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viewRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No suppliers in this view.
                  </td>
                </tr>
              ) : (
                viewRows.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-semibold">
                      <Link href={`/${locale}/os/sourcing/${r.id}`} className="underline decoration-harvics-gold/50">
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.country || '—'}</td>
                    <td className="px-3 py-2">{r.category || '—'}</td>
                    <td className="px-3 py-2 font-mono">{Number(r.rating || 0).toFixed(1)}</td>
                    <td className="px-3 py-2">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                        style={{ background: STATUS_COLOR[r.qualifiedStatus] || '#666' }}
                      >
                        {r.qualifiedStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {r.qualifiedStatus === 'Discovered' ? (
                        <button
                          type="button"
                          onClick={() => void qualify(r.id, 'InReview')}
                          className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                        >
                          Review
                        </button>
                      ) : null}
                      {r.qualifiedStatus === 'InReview' ? (
                        <span className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => void qualify(r.id, 'Qualified')}
                            className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            Qualify
                          </button>
                          <button
                            type="button"
                            onClick={() => void qualify(r.id, 'Rejected')}
                            className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            Reject
                          </button>
                        </span>
                      ) : null}
                      {!['Discovered', 'InReview'].includes(r.qualifiedStatus) ? (
                        <span className="text-harvics-burgundy/30">—</span>
                      ) : null}
                    </td>
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
