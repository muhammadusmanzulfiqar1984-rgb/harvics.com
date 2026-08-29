'use client'

/** Vendor scorecard document — Module #14 */

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

const REC_COLOR: Record<string, string> = {
  Promote: '#2E7D32',
  Maintain: '#1565C0',
  Warn: '#E65100',
  Drop: '#B71C1C',
}

export default function VendorScorecardDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [doc, setDoc] = useState<any>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave3/vendors/scorecards/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load scorecard')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <HarvicsOSShell
      title={doc?.vendorName || doc?.vendorId || 'Scorecard'}
      subtitle="Module #14 — vendor scorecard"
      activeDomain="procurement"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Scorecards', href: '/os/vendor-scorecards' },
        { label: doc?.vendorId || 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/vendor-scorecards`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Scorecards workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Vendor', doc.vendorName || doc.vendorId],
                ['Vendor ID', doc.vendorId],
                ['Period', doc.period],
                ['Overall', Number(doc.overallScore).toFixed(1)],
                ['On-time', `${doc.onTimePercent}%`],
                ['Quality', doc.qualityScore],
                ['Price', doc.priceScore],
                ['Response', doc.responseScore],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="border border-harvics-burgundy/15 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Recommendation</p>
              <span
                className="mt-2 inline-block px-3 py-1 text-sm font-bold uppercase text-white"
                style={{ background: REC_COLOR[doc.recommendation] || '#666' }}
              >
                {doc.recommendation}
              </span>
              {doc.notes ? <p className="mt-3 text-sm text-harvics-burgundy/70">{doc.notes}</p> : null}
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
