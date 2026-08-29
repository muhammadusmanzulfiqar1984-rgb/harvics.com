'use client'

/**
 * Module #15 — Contract Lifecycle (SAP+ workspace)
 * Tabs: Contracts · Expiring · Unsigned · New
 * Status: Draft → Negotiating → Signed → Active → Terminated/Expired
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'contracts' | 'expiring' | 'unsigned' | 'create'

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

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0)

const STATUS_COLOR: Record<string, string> = {
  Draft: '#666',
  Negotiating: '#1565C0',
  Signed: '#2E7D32',
  Active: '#2E7D32',
  Expired: '#999',
  Terminated: '#B71C1C',
}

const TYPES = ['MSA', 'SOW', 'NDA', 'Lease', 'Purchase', 'Service']

function newContractNo() {
  return `C-${Date.now().toString().slice(-6)}`
}

export default function ProcurementModuleFifteen() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('contracts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [expiring, setExpiring] = useState<any[]>([])
  const [form, setForm] = useState({
    contractNo: newContractNo(),
    title: '',
    counterparty: '',
    type: 'MSA',
    value: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
    notes: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [all, exp] = await Promise.all([
        api('/api/wave5/contracts'),
        api('/api/wave5/contracts/expiring?days=90'),
      ])
      setRows(all.data || [])
      setExpiring(exp.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #15')
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
      if (!form.title || !form.counterparty || !form.startDate || !form.endDate) {
        throw new Error('Title, counterparty, and dates required')
      }
      const r = await api('/api/wave5/contracts', {
        method: 'POST',
        body: JSON.stringify({
          contractNo: form.contractNo,
          title: form.title,
          counterparty: form.counterparty,
          type: form.type,
          value: Number(form.value) || 0,
          currency: form.currency || 'USD',
          startDate: form.startDate,
          endDate: form.endDate,
          notes: form.notes || null,
        }),
      })
      setForm({
        contractNo: newContractNo(),
        title: '',
        counterparty: '',
        type: 'MSA',
        value: '',
        currency: 'USD',
        startDate: '',
        endDate: '',
        notes: '',
      })
      setMessage(`Contract ${r.data?.contractNo} drafted`)
      await load()
      setTab('contracts')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const transition = async (id: string, action: 'negotiate' | 'sign' | 'activate' | 'terminate') => {
    try {
      setError('')
      await api(`/api/wave5/contracts/${id}/${action}`, { method: 'POST', body: '{}' })
      setMessage(`Contract → ${action}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const d = (v: string | Date | null | undefined) => (v ? new Date(v).toLocaleDateString() : '—')
  const unsigned = rows.filter((r) => ['Draft', 'Negotiating'].includes(r.status))

  const renderRows = (list: any[]) => (
    <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-harvics-burgundy text-left text-harvics-cream">
            {['No', 'Title', 'Party', 'Type', 'Value', 'Period', 'Status', 'Act'].map((h) => (
              <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-harvics-burgundy/45">
                No contracts in this view.
              </td>
            </tr>
          ) : (
            list.map((r, i) => (
              <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                <td className="px-3 py-2 font-mono font-semibold">
                  <Link href={`/${locale}/os/contracts/${r.id}`} className="underline decoration-harvics-gold/50">
                    {r.contractNo}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">{r.counterparty}</td>
                <td className="px-3 py-2">{r.type}</td>
                <td className="px-3 py-2 font-mono">{fmt(r.value, r.currency || 'USD')}</td>
                <td className="px-3 py-2 text-[12px] text-harvics-burgundy/60">
                  {d(r.startDate)} – {d(r.endDate)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                    style={{ background: STATUS_COLOR[r.status] || '#666' }}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {r.status === 'Draft' ? (
                      <button
                        type="button"
                        onClick={() => void transition(r.id, 'negotiate')}
                        className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        Negotiate
                      </button>
                    ) : null}
                    {['Draft', 'Negotiating'].includes(r.status) ? (
                      <button
                        type="button"
                        onClick={() => void transition(r.id, 'sign')}
                        className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        Sign
                      </button>
                    ) : null}
                    {r.status === 'Signed' ? (
                      <button
                        type="button"
                        onClick={() => void transition(r.id, 'activate')}
                        className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        Activate
                      </button>
                    ) : null}
                    {!['Expired', 'Terminated'].includes(r.status) ? (
                      <button
                        type="button"
                        onClick={() => void transition(r.id, 'terminate')}
                        className="border border-red-300 px-2 py-1 text-[10px] font-bold uppercase text-red-800"
                      >
                        Terminate
                      </button>
                    ) : (
                      <span className="text-harvics-burgundy/30">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #15 · Procurement</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Contract Lifecycle
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Draft → negotiate → sign → activate · expiry watch (90 days).
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/rfq`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            RFQs
          </Link>
          <Link
            href={`/${locale}/os/sourcing`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Sourcing
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
        title="Contract lifecycle coach"
        subtitle="Expiring and negotiation risk classic CLM screens miss"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'contracts' }}
        cta="Advise contracts"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #3D1212' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Contracts</div>
          <div className="mt-1 font-mono text-lg font-semibold">{rows.length}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #B71C1C' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Expiring (90d)</div>
          <div className="mt-1 font-mono text-lg font-semibold">{expiring.length}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #B8860B' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Unsigned</div>
          <div className="mt-1 font-mono text-lg font-semibold">{unsigned.length}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #2E7D32' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Active</div>
          <div className="mt-1 font-mono text-lg font-semibold">{rows.filter((r) => r.status === 'Active').length}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['contracts', 'All contracts'],
            ['expiring', 'Expiring'],
            ['unsigned', 'Unsigned'],
            ['create', 'New contract'],
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
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New contract</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Contract no *"
            value={form.contractNo}
            onChange={(e) => setForm((f) => ({ ...f, contractNo: e.target.value }))}
          />
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Counterparty *"
            value={form.counterparty}
            onChange={(e) => setForm((f) => ({ ...f, counterparty: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Value"
            type="number"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void create()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Draft contract
          </button>
        </div>
      ) : null}

      {!loading && tab === 'contracts' ? renderRows(rows) : null}
      {!loading && tab === 'expiring' ? renderRows(expiring) : null}
      {!loading && tab === 'unsigned' ? renderRows(unsigned) : null}
    </div>
  )
}
