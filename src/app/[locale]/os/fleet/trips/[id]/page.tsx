'use client'

/**
 * Fleet trip document — start / complete / cancel (Module #25).
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

const NEXT: Record<string, { label: string; act: 'start' | 'complete' | 'cancel' }[]> = {
  Planned: [
    { label: 'Start', act: 'start' },
    { label: 'Cancel', act: 'cancel' },
  ],
  Active: [
    { label: 'Complete', act: 'complete' },
    { label: 'Cancel', act: 'cancel' },
  ],
  Completed: [],
  Cancelled: [],
}

export default function FleetTripDocumentPage() {
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
      const r = await api(`/api/wave4/trips/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load trip')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const act = async (a: 'start' | 'complete' | 'cancel') => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave4/trips/${id}/${a}`, { method: 'POST', body: '{}' })
      setMessage(`Trip → ${a}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const next = doc ? NEXT[doc.status] || [] : []
  const stops = Array.isArray(doc?.stops) ? doc.stops : []

  return (
    <HarvicsOSShell
      title={doc ? `Trip ${doc.id.slice(-8)}` : 'Trip'}
      subtitle="Module #25 — fleet trip document"
      activeDomain="fleet"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Fleet', href: '/os/fleet' },
        { label: doc ? doc.id.slice(-8) : 'Trip' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/fleet`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Fleet workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['Vehicle', doc.vehicle?.plate || doc.vehicleId],
                ['Driver', doc.driver || '—'],
                ['Optimized', `${doc.optimizedKm} km`],
                ['Naive', `${doc.distanceKm} km`],
                ['Savings', `${doc.savingsKm} km`],
                ['Started', doc.startedAt ? new Date(doc.startedAt).toLocaleString() : '—'],
                ['Completed', doc.completedAt ? new Date(doc.completedAt).toLocaleString() : '—'],
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
                {next.map((n) => (
                  <button
                    key={n.act}
                    type="button"
                    onClick={() => void act(n.act)}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      n.act === 'complete' || n.act === 'start'
                        ? 'bg-harvics-burgundy text-harvics-cream'
                        : 'border border-harvics-burgundy/30 bg-white'
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Stops</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Seq', 'Address', 'Lat', 'Lng'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stops.map((s: any, i: number) => (
                    <tr key={i} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">{s.seq ?? i + 1}</td>
                      <td className="px-3 py-2">{s.address}</td>
                      <td className="px-3 py-2 font-mono">{s.lat}</td>
                      <td className="px-3 py-2 font-mono">{s.lng}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
