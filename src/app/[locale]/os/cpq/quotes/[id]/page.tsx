'use client'

/**
 * CPQ quote document — send / accept / reject (SAP VA21/VA25 style).
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
  Draft: ['Sent', 'Expired', 'Rejected'],
  Sent: ['Accepted', 'Rejected', 'Expired'],
  Accepted: [],
  Rejected: [],
  Expired: [],
}

export default function CpqQuoteDocumentPage() {
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
      const r = await api(`/api/wave5/quotes/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load quote')
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
      const r = await api(`/api/wave5/quotes/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, createArInvoice: true, createSalesOrder: true }),
      })
      const parts = [`Status → ${status}`]
      if (r.salesOrder?.orderNumber) parts.push(`SO ${r.salesOrder.orderNumber}`)
      if (r.invoice?.invoiceNo) parts.push(`AR ${r.invoice.invoiceNo}`)
      setMessage(parts.join(' · '))
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const next = doc ? NEXT[doc.status] || [] : []

  return (
    <HarvicsOSShell
      title={doc?.quoteNo || 'Quote'}
      subtitle="Module #9 — CPQ quote document"
      activeDomain="cpq"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'CPQ', href: '/os/cpq' },
        { label: doc?.quoteNo || 'Quote' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/${locale}/os/cpq`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← CPQ workspace
          </Link>
          <Link
            href={`/${locale}/os/ar-aging`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50"
          >
            AR
          </Link>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['Customer', doc.customerName],
                ['Subtotal', fmt(doc.subtotal, doc.currency)],
                ['Tax', fmt(doc.taxAmount || 0, doc.currency)],
                ['Total', fmt(doc.total, doc.currency)],
                ['Tax country', `${doc.taxCountry || '—'} ${doc.taxType || ''}`],
                ['Valid until', doc.validUntil ? new Date(doc.validUntil).toLocaleDateString() : '—'],
                ['Currency', doc.currency || 'USD'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            {next.length > 0 ? (
              <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
                {next.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void setStatus(s)}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      s === 'Accepted'
                        ? 'bg-harvics-burgundy text-harvics-cream'
                        : 'border border-harvics-burgundy/30 bg-white'
                    }`}
                  >
                    {s === 'Sent' ? 'Send' : s}
                  </button>
                ))}
              </div>
            ) : null}

            {doc.notes ? (
              <div className="border border-harvics-burgundy/15 bg-white p-4 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Notes</p>
                <p className="mt-2">{doc.notes}</p>
              </div>
            ) : null}

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                Lines
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['SKU', 'Description', 'Qty', 'Unit', 'Disc %', 'Line total'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(doc.lines || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No lines.
                      </td>
                    </tr>
                  ) : (
                    (doc.lines || []).map((l: any, i: number) => (
                      <tr key={l.id || i} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono font-semibold">{l.sku}</td>
                        <td className="px-3 py-2">{l.description || '—'}</td>
                        <td className="px-3 py-2 font-mono">{l.qty}</td>
                        <td className="px-3 py-2 font-mono">{fmt(l.unitPrice, doc.currency)}</td>
                        <td className="px-3 py-2 font-mono">{l.discount || 0}</td>
                        <td className="px-3 py-2 font-mono font-semibold">{fmt(l.lineTotal, doc.currency)}</td>
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
