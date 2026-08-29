'use client'

/** Module #36 — SAP+ document detail */

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
  'Active': ['Vacant', 'UnderRenovation', 'Sold'],
    'Vacant': ['Active', 'UnderRenovation', 'Sold'],
    'UnderRenovation': ['Active', 'Vacant'],
    'Sold': []
}

export default function DocumentPage() {
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
      const r = await api(`/api/wave5/properties/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void load() }, [load])

  const setStatus = async (status: string, path?: string, body?: any) => {
    try {
      setError('')
      setMessage('')
      const endpoint = path || `/api/wave5/properties/${id}/status`
      await api(endpoint, { method: 'POST', body: JSON.stringify(body ?? { status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const next = doc ? NEXT[doc.status] || [] : []
  const title = doc ? (doc.code || 'Property') : 'Document'

  return (
    <HarvicsOSShell
      title={typeof title === 'string' ? title : String(title)}
      subtitle="Module #36 — SAP+ property document"
      activeDomain="inventory"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Properties', href: '/os/properties' },
        { label: typeof title === 'string' ? title : 'Doc' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/properties`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Properties workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Code', doc.code],
                ['Name', doc.name],
                ['Status', doc.status],
                ['Type', doc.type],
                ['Sqft', doc.sqft],
                ['Occupancy', `${doc.occupancyPct}%`],
                ['Rent', `${doc.currency} ${Number(doc.monthlyRent || 0).toLocaleString()}`],
                ['Lease end', doc.leaseEnd ? new Date(doc.leaseEnd).toLocaleDateString() : '—'],
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
                    className="border border-harvics-burgundy/30 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
            {doc.address ? <p className="border border-harvics-burgundy/10 bg-harvics-cream/40 px-4 py-3 text-sm">{doc.address}</p> : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
