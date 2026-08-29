'use client'

/**
 * Delivery slot document — Scheduled → InTransit → Delivered|Failed.
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

const NEXT: Record<string, string[]> = {
  Scheduled: ['InTransit', 'Failed'],
  InTransit: ['Delivered', 'Failed'],
  Delivered: [],
  Failed: [],
}

export default function DeliverySlotDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [channel, setChannel] = useState<any>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave4/delivery-slots/${id}`)
      setDoc(r.data)
      if (r.data?.channelCode) {
        const ch = await api(`/api/wave4/channels/${encodeURIComponent(r.data.channelCode)}`).catch(() => null)
        setChannel(ch?.data || null)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load slot')
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
      await api(`/api/wave4/delivery-slots/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const next = doc ? NEXT[doc.status] || [] : []

  return (
    <HarvicsOSShell
      title={doc?.channelCode ? `Slot · ${doc.channelCode}` : 'Delivery slot'}
      subtitle="Module #10 — delivery slot document"
      activeDomain="sales"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Sales & Distribution', href: '/os/sales-distribution' },
        { label: 'Slot' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link
          href={`/${locale}/os/sales-distribution`}
          className="text-[10px] font-bold uppercase tracking-[0.14em] underline"
        >
          ← Sales workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['Channel', doc.channelCode],
                ['Channel name', channel?.name || '—'],
                ['Order', doc.orderId || '—'],
                ['Scheduled', doc.scheduledFor ? new Date(doc.scheduledFor).toLocaleDateString() : '—'],
                ['Window', `${doc.windowStart || '—'}–${doc.windowEnd || '—'}`],
                ['Driver', doc.driver || '—'],
                ['Vehicle', doc.vehicle || '—'],
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
                      s === 'Failed'
                        ? 'border border-red-300 text-red-800'
                        : s === 'Delivered'
                          ? 'bg-harvics-burgundy text-harvics-cream'
                          : 'border border-harvics-burgundy/30 bg-white'
                    }`}
                  >
                    {s}
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
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
