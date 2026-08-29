'use client'

/**
 * AP bill document — pay / overdue / write-off / credit note.
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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

export default function ApBillDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Bank Transfer')
  const [postToGl, setPostToGl] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/finance/invoices/${id}`)
      setDoc(r.data)
      if (r.data?.outstanding != null) setPayAmount(String(r.data.outstanding))
    } catch (e: any) {
      setError(e.message || 'Failed to load bill')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const pay = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/payments', {
        method: 'POST',
        body: JSON.stringify({
          invoiceNo: doc.invoiceNo,
          amount: Number(payAmount),
          method: payMethod,
          postToGl,
        }),
      })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`Payment recorded · ${r.invoiceStatus}${glBit}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const markOverdue = async () => {
    try {
      setError('')
      await api(`/api/finance/invoices/${id}/mark-overdue`, { method: 'POST' })
      setMessage('Marked overdue')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const writeOff = async () => {
    const reason = window.prompt('Write-off reason', 'Vendor settlement') || undefined
    try {
      setError('')
      const r = await api(`/api/finance/invoices/${id}/write-off`, {
        method: 'POST',
        body: JSON.stringify({ reason, postToGl }),
      })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`${r.message}${glBit}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const creditNote = async () => {
    const reason = window.prompt('Credit note reason', 'Vendor credit') || undefined
    try {
      setError('')
      const r = await api(`/api/finance/invoices/${id}/credit-note`, {
        method: 'POST',
        body: JSON.stringify({ reason, postToGl }),
      })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`${r.message}${glBit}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const closed = doc && ['Paid', 'WrittenOff', 'CreditNote', 'Cancelled'].includes(doc.status)

  return (
    <HarvicsOSShell
      title={doc?.invoiceNo || 'AP Bill'}
      subtitle="Module #4 — payable document"
      activeDomain="ap"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'AP', href: '/os/ap-aging' },
        { label: doc?.invoiceNo || 'Bill' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/ap-aging`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← AP workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['Vendor', doc.customer || doc.customerName || '—'],
                ['Amount', fmt(doc.amount)],
                ['Outstanding', fmt(doc.outstanding)],
                ['Paid', fmt(doc.paid)],
                ['Due', doc.dueDate || '—'],
                ['Currency', doc.currency || 'USD'],
                ['Type', doc.type || 'AP'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            {!closed ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Pay vendor</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                    />
                    <select
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                    >
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Cheque</option>
                      <option>Card</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void pay()}
                      className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                    >
                      Post payment
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-[12px]">
                    <input type="checkbox" checked={postToGl} onChange={(e) => setPostToGl(e.target.checked)} />
                    Post to Module #1 GL
                  </label>
                </div>
                <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
                  <button
                    type="button"
                    onClick={() => void markOverdue()}
                    className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                  >
                    Mark overdue
                  </button>
                  <button
                    type="button"
                    onClick={() => void creditNote()}
                    className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                  >
                    Credit note
                  </button>
                  <button
                    type="button"
                    onClick={() => void writeOff()}
                    className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-red-800"
                  >
                    Write off
                  </button>
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                Payment history
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Amount', 'Method', 'Reference', 'Date'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!doc.payments?.length ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No payments applied.
                      </td>
                    </tr>
                  ) : (
                    doc.payments.map((p: any, i: number) => (
                      <tr key={p.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono">{fmt(p.amount)}</td>
                        <td className="px-3 py-2">{p.method || '—'}</td>
                        <td className="px-3 py-2">{p.reference || '—'}</td>
                        <td className="px-3 py-2">{p.receivedDate || '—'}</td>
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
