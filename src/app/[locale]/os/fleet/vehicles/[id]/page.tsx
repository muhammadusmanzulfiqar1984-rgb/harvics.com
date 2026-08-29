'use client'

/**
 * Fleet vehicle document (Module #25).
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

const STATUSES = ['Available', 'InRoute', 'Maintenance', 'OffDuty'] as const

export default function FleetVehicleDocumentPage() {
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
      const r = await api(`/api/wave4/vehicles/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load vehicle')
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
      await api(`/api/wave4/vehicles/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={doc?.plate || 'Vehicle'}
      subtitle="Module #25 — fleet vehicle document"
      activeDomain="fleet"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Fleet', href: '/os/fleet' },
        { label: doc?.plate || 'Vehicle' },
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
                ['Type', doc.type],
                ['Capacity', `${doc.capacityKg} kg`],
                ['Driver', doc.driver || '—'],
                ['Depot', doc.homeDepot || '—'],
                ['Fuel', doc.fuelType || '—'],
                ['Odometer', `${doc.odometerKm || 0} km`],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
              {STATUSES.filter((s) => s !== doc.status).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void setStatus(s)}
                  className="border border-harvics-burgundy/30 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Recent trips</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Trip', 'Status', 'Opt km', 'Save'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(doc.trips || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-harvics-burgundy/45">No trips.</td>
                    </tr>
                  ) : (
                    (doc.trips || []).map((t: any, i: number) => (
                      <tr key={t.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono">
                          <Link href={`/${locale}/os/fleet/trips/${t.id}`} className="underline decoration-harvics-gold/50">
                            {t.id.slice(-8)}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{t.status}</td>
                        <td className="px-3 py-2 font-mono">{t.optimizedKm}</td>
                        <td className="px-3 py-2 font-mono">{t.savingsKm}</td>
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
