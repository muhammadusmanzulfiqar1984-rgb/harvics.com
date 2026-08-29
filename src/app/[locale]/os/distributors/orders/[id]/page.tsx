'use client'

/**
 * Distributor replenishment order document — Pending → … → Completed.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

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
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0)

const NEXT: Record<string, string[]> = {
  Pending: ['Processing', 'On Hold', 'Cancelled'],
  Processing: ['In Transit', 'On Hold', 'Cancelled'],
  'On Hold': ['Processing', 'Cancelled'],
  'In Transit': ['Delivered', 'Completed'],
  Delivered: ['Completed'],
  Completed: [],
  Cancelled: [],
}

export default function DistributorOrderDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/orders/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const setStatus = async (status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const next = doc ? NEXT[doc.status] || [] : []
  const items = Array.isArray(doc?.items) ? doc.items : []

  return (
    <HarvicsOSShell
      title={doc ? `Order · ${(doc.id || '').slice(0, 8)}` : 'Distributor order'}
      subtitle="Module #12 — replenishment order document"
      activeDomain="distributor"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Distributors', href: '/os/distributors' },
        { label: 'Order' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/os/distributors`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline"
          >
            ← Distributor HQ
          </Link>
          <Link
            href={`/${locale}/os/sales-distribution`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50"
          >
            Sales & Distribution
          </Link>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.statusText || doc.status],
                ['Distributor', doc.customerName || doc.customer || '—'],
                ['Channel', doc.channel || '—'],
                ['Amount', fmt(doc.amount, doc.currency)],
                ['City', doc.city || '—'],
                ['Currency', doc.currency || 'USD'],
                ['Created', doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '—'],
                ['Id', (doc.id || '').slice(0, 12)],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            {next.length > 0 ? (
              <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Fulfillment</p>
                {next.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void setStatus(s)}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      s === 'Cancelled'
                        ? 'border border-red-300 text-red-800'
                        : s === 'Completed' || s === 'Delivered'
                          ? 'bg-harvics-burgundy text-harvics-cream'
                          : 'border border-harvics-burgundy/30 bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                Lines
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['SKU', 'Qty', 'Unit price'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No line items stored.
                      </td>
                    </tr>
                  ) : (
                    items.map((l: any, i: number) => (
                      <tr key={i} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono font-semibold">{l.sku || '—'}</td>
                        <td className="px-3 py-2 font-mono">{l.qty ?? l.quantity ?? '—'}</td>
                        <td className="px-3 py-2 font-mono">{fmt(l.unitPrice || 0, doc.currency)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
