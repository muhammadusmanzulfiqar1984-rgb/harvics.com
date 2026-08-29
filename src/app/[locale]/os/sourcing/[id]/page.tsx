'use client'

/** Sourcing supplier document — Module #16 */

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

export default function SourcingSupplierDocumentPage() {
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
      const r = await api(`/api/wave5/sourcing-suppliers/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load supplier')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const qualify = async (qualifiedStatus: string) => {
    try {
      setError('')
      await api(`/api/wave5/sourcing-suppliers/${id}/qualify`, {
        method: 'POST',
        body: JSON.stringify({ qualifiedStatus }),
      })
      setMessage(`Status → ${qualifiedStatus}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={doc?.name || 'Supplier'}
      subtitle="Module #16 — sourcing supplier"
      activeDomain="sourcing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Sourcing', href: '/os/sourcing' },
        { label: doc?.name || 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/sourcing`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Sourcing workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.qualifiedStatus],
                ['Country', doc.country || '—'],
                ['Category', doc.category || '—'],
                ['Rating', Number(doc.rating || 0).toFixed(1)],
                ['Email', doc.contactEmail || '—'],
                ['Phone', doc.contactPhone || '—'],
                ['Certifications', doc.certifications || '—'],
                ['Capabilities', doc.capabilities || '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4 sm:max-w-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Qualification</p>
              {doc.qualifiedStatus === 'Discovered' ? (
                <button
                  type="button"
                  onClick={() => void qualify('InReview')}
                  className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                >
                  Send to review
                </button>
              ) : null}
              {doc.qualifiedStatus === 'InReview' ? (
                <>
                  <button
                    type="button"
                    onClick={() => void qualify('Qualified')}
                    className="border border-harvics-gold/50 px-3 py-2 text-[10px] font-bold uppercase"
                  >
                    Qualify
                  </button>
                  <button
                    type="button"
                    onClick={() => void qualify('Rejected')}
                    className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase text-red-800"
                  >
                    Reject
                  </button>
                </>
              ) : null}
              {doc.qualifiedStatus === 'Rejected' ? (
                <button
                  type="button"
                  onClick={() => void qualify('InReview')}
                  className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                >
                  Re-open review
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
