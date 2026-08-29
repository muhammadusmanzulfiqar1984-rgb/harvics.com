'use client'

/** Quality check document — Module #20 */

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

export default function QualityCheckDocumentPage() {
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
      const r = await api(`/api/v2/quality/checks/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load check')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const passFail = async (status: 'Passed' | 'Failed') => {
    try {
      setError('')
      await api(`/api/v2/quality/checks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setMessage(`Check → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={doc?.checkNo || 'Quality check'}
      subtitle="Module #20 — quality check"
      activeDomain="quality"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Quality', href: '/os/quality' },
        { label: doc?.checkNo || 'Check' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/quality`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Quality workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['SKU', doc.productSku],
                ['Inspector', doc.inspector || '—'],
                ['Defects', doc.defectsFound],
                ['WO', doc.workOrderId || '—'],
                ['Inspected', doc.inspectedAt ? new Date(doc.inspectedAt).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            {doc.notes ? <p className="border border-harvics-burgundy/10 bg-harvics-cream/40 px-4 py-3 text-sm">{doc.notes}</p> : null}
            {doc.status === 'Pending' ? (
              <div className="flex gap-2 border border-harvics-burgundy/15 bg-white p-4">
                <button
                  type="button"
                  onClick={() => void passFail('Passed')}
                  className="border border-green-700 px-3 py-2 text-[10px] font-bold uppercase text-green-800"
                >
                  Pass
                </button>
                <button
                  type="button"
                  onClick={() => void passFail('Failed')}
                  className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase text-red-800"
                >
                  Fail
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
