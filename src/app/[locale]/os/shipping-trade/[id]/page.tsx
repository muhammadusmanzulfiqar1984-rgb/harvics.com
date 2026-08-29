'use client'

/**
 * Shipment document — Module #26 shipping track & status (SAP-style).
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
  Booked: ['InTransit', 'Exception'],
  InTransit: ['Delivered', 'Exception'],
  Delivered: [],
  Exception: ['InTransit'],
}

const STATUS_LABEL: Record<string, string> = {
  InTransit: 'In transit',
  Exception: 'Exception',
  Delivered: 'Delivered',
  Booked: 'Booked',
}

export default function ShipmentDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [evForm, setEvForm] = useState({ location: '', status: 'In Transit', description: '' })

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave3/shipping/shipments/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load shipment')
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
      await api(`/api/wave3/shipping/shipments/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      setMessage(`Status → ${STATUS_LABEL[status] || status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addEvent = async () => {
    try {
      setError('')
      setMessage('')
      if (!evForm.location || !evForm.status) throw new Error('Location and status required')
      await api(`/api/wave3/shipping/shipments/${id}/events`, {
        method: 'POST',
        body: JSON.stringify({
          location: evForm.location,
          status: evForm.status,
          description: evForm.description || null,
        }),
      })
      setEvForm({ location: '', status: 'In Transit', description: '' })
      setMessage('Tracking event added')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const next = doc ? NEXT[doc.status] || [] : []
  const events = doc?.events || []

  return (
    <HarvicsOSShell
      title={doc?.trackingNo || 'Shipment'}
      subtitle="Module #26 — SAP+ shipment document"
      activeDomain="shipping"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Shipping', href: '/os/shipping-trade' },
        { label: doc?.trackingNo || 'Shipment' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/os/shipping-trade`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← Shipping workspace
          </Link>
          <Link
            href={`/${locale}/os/import-export`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50"
          >
            Trade
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
                ['Tracking', doc.trackingNo],
                ['Origin', doc.origin],
                ['Destination', doc.destination],
                ['Carrier', doc.carrier || '—'],
                ['Service', doc.service || '—'],
                ['Weight kg', doc.weightKg ?? '—'],
                ['Booked', doc.bookedAt ? new Date(doc.bookedAt).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
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
                      s === 'Delivered'
                        ? 'bg-harvics-burgundy text-harvics-cream'
                        : 'border border-harvics-burgundy/30 bg-white'
                    }`}
                  >
                    {STATUS_LABEL[s] || s}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add event</p>
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Location *"
                  value={evForm.location}
                  onChange={(e) => setEvForm((f) => ({ ...f, location: e.target.value }))}
                />
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Status *"
                  value={evForm.status}
                  onChange={(e) => setEvForm((f) => ({ ...f, status: e.target.value }))}
                />
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Description"
                  value={evForm.description}
                  onChange={(e) => setEvForm((f) => ({ ...f, description: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => void addEvent()}
                  className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                >
                  Add event
                </button>
              </div>

              <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
                <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                  Tracking events
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                      {['Time', 'Status', 'Location', 'Description'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-harvics-burgundy/45">
                          No events.
                        </td>
                      </tr>
                    ) : (
                      events.map((e: any, i: number) => (
                        <tr key={e.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                          <td className="px-3 py-2 text-[12px]">
                            {e.eventTime ? new Date(e.eventTime).toLocaleString() : '—'}
                          </td>
                          <td className="px-3 py-2 font-semibold">{e.status}</td>
                          <td className="px-3 py-2">{e.location}</td>
                          <td className="px-3 py-2">{e.description || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
