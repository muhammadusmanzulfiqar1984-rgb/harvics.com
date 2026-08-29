'use client'

/**
 * HPay payment run document — approve / release / mark paid / cancel.
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

const fmt = (n: number, ccy = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 2 }).format(n || 0)

export default function PaymentRunDocumentPage() {
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
      const r = await api(`/api/wave5/payment-runs/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load payment run')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const act = async (action: 'approve' | 'release' | 'mark-paid' | 'cancel') => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/wave5/payment-runs/${id}/${action}`, { method: 'POST', body: '{}' })
      setMessage(r.message || action)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const closed = doc && ['Paid', 'Cancelled'].includes(doc.status)

  return (
    <HarvicsOSShell
      title={doc?.runNo || 'Payment Run'}
      subtitle="Module #6 — HPay payment run"
      activeDomain="hpay"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'HPay', href: '/os/payment-runs' },
        { label: doc?.runNo || 'Run' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/os/payment-runs`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← HPay workspace
          </Link>
          <Link href={`/${locale}/os/ap-aging`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50">
            AP aging
          </Link>
          <Link href={`/${locale}/os/treasury-banking`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50">
            Treasury
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
                ['Total', fmt(doc.totalAmount, doc.currency || 'USD')],
                ['Items', String(doc.itemCount ?? doc.items?.length ?? 0)],
                ['Currency', doc.currency || 'USD'],
                ['Released', doc.releasedAt ? new Date(doc.releasedAt).toLocaleString() : '—'],
                ['Released by', doc.releasedBy || '—'],
                ['Created', doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'],
                ['Description', doc.description || '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            {!closed ? (
              <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-white p-4">
                <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
                {doc.status === 'Draft' ? (
                  <button
                    type="button"
                    onClick={() => void act('approve')}
                    className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                  >
                    Approve
                  </button>
                ) : null}
                {doc.status === 'Draft' || doc.status === 'Approved' ? (
                  <button
                    type="button"
                    onClick={() => void act('release')}
                    className="bg-harvics-gold/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                  >
                    Release
                  </button>
                ) : null}
                {doc.status === 'Released' ? (
                  <button
                    type="button"
                    onClick={() => void act('mark-paid')}
                    className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                  >
                    Mark paid
                  </button>
                ) : null}
                {doc.status === 'Draft' || doc.status === 'Approved' ? (
                  <button
                    type="button"
                    onClick={() => void act('cancel')}
                    className="border border-red-300 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-800"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                Line items
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Payee', 'Amount', 'Invoice ref', 'Account', 'Status'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!doc.items?.length ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No line items.
                      </td>
                    </tr>
                  ) : (
                    doc.items.map((it: any, i: number) => (
                      <tr key={it.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-semibold">{it.payeeName}</td>
                        <td className="px-3 py-2 font-mono">{fmt(it.amount, it.currency || doc.currency)}</td>
                        <td className="px-3 py-2 font-mono">{it.invoiceRef || '—'}</td>
                        <td className="px-3 py-2">{it.payeeAccount || '—'}</td>
                        <td className="px-3 py-2">{it.status}</td>
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
