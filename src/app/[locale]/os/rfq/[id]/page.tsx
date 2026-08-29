'use client'

/**
 * RFQ document detail — Module #13
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
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0)

export default function RfqDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [resp, setResp] = useState({ vendorId: '', vendorName: '', amount: '', leadTimeDays: '14' })

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave3/procurement/rfqs/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load RFQ')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const action = async (path: string, label: string) => {
    try {
      setError('')
      await api(path, { method: 'POST', body: '{}' })
      setMessage(label)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const submitResponse = async () => {
    try {
      setError('')
      if (!resp.vendorId || !resp.amount) throw new Error('Vendor ID and amount required')
      await api(`/api/wave3/procurement/rfqs/${id}/responses`, {
        method: 'POST',
        body: JSON.stringify({
          vendorId: resp.vendorId,
          vendorName: resp.vendorName || null,
          amount: Number(resp.amount),
          leadTimeDays: Number(resp.leadTimeDays) || null,
        }),
      })
      setResp({ vendorId: '', vendorName: '', amount: '', leadTimeDays: '14' })
      setMessage('Response submitted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const award = async (respId: string) => {
    if (!confirm('Award this vendor?')) return
    await action(`/api/wave3/procurement/rfqs/${id}/award/${respId}`, 'RFQ awarded')
  }

  return (
    <HarvicsOSShell
      title={doc?.rfqNo || 'RFQ'}
      subtitle="Module #13 — RFQ document"
      activeDomain="procurement"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'RFQs', href: '/os/rfq' },
        { label: doc?.rfqNo || 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/rfq`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← RFQ workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['Title', doc.title],
                ['Category', doc.category || '—'],
                ['Due', doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : '—'],
                ['Awarded to', doc.awardedTo || '—'],
                ['Responses', String((doc.responses || []).length)],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            {doc.description ? (
              <p className="border border-harvics-burgundy/10 bg-harvics-cream/40 px-4 py-3 text-sm">{doc.description}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-white p-4">
              <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
              {doc.status === 'Draft' ? (
                <>
                  <button
                    type="button"
                    onClick={() => void action(`/api/wave3/procurement/rfqs/${id}/open`, 'Opened')}
                    className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => void action(`/api/wave3/procurement/rfqs/${id}/cancel`, 'Cancelled')}
                    className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase text-red-800"
                  >
                    Cancel
                  </button>
                </>
              ) : null}
              {doc.status === 'Open' ? (
                <>
                  <button
                    type="button"
                    onClick={() => void action(`/api/wave3/procurement/rfqs/${id}/close`, 'Closed')}
                    className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => void action(`/api/wave3/procurement/rfqs/${id}/cancel`, 'Cancelled')}
                    className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase text-red-800"
                  >
                    Cancel
                  </button>
                </>
              ) : null}
            </div>
            {doc.status === 'Open' ? (
              <div className="grid gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4 md:grid-cols-5">
                <input
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                  placeholder="Vendor ID *"
                  value={resp.vendorId}
                  onChange={(e) => setResp((f) => ({ ...f, vendorId: e.target.value }))}
                />
                <input
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                  placeholder="Vendor name"
                  value={resp.vendorName}
                  onChange={(e) => setResp((f) => ({ ...f, vendorName: e.target.value }))}
                />
                <input
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                  type="number"
                  placeholder="Amount *"
                  value={resp.amount}
                  onChange={(e) => setResp((f) => ({ ...f, amount: e.target.value }))}
                />
                <input
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                  type="number"
                  placeholder="Lead days"
                  value={resp.leadTimeDays}
                  onChange={(e) => setResp((f) => ({ ...f, leadTimeDays: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => void submitResponse()}
                  className="bg-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase text-harvics-cream"
                >
                  Submit response
                </button>
              </div>
            ) : null}
            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                Responses
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Vendor', 'Amount', 'Lead', 'Status', ''].map((h) => (
                      <th key={h || 'a'} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(doc.responses || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No responses.
                      </td>
                    </tr>
                  ) : (
                    [...(doc.responses || [])]
                      .sort((a: any, b: any) => a.amount - b.amount)
                      .map((rp: any, i: number) => (
                        <tr key={rp.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                          <td className="px-3 py-2">{rp.vendorName || rp.vendorId}</td>
                          <td className="px-3 py-2 font-mono">{fmt(rp.amount, rp.currency || 'USD')}</td>
                          <td className="px-3 py-2">{rp.leadTimeDays ?? '—'}d</td>
                          <td className="px-3 py-2">{rp.status}</td>
                          <td className="px-3 py-2">
                            {doc.status === 'Open' && rp.status === 'Submitted' ? (
                              <button
                                type="button"
                                onClick={() => void award(rp.id)}
                                className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase"
                              >
                                Award
                              </button>
                            ) : (
                              '—'
                            )}
                          </td>
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
