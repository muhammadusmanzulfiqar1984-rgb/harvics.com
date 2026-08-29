'use client'

/** NCR document — Module #20 */

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

export default function NcrDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [rootCause, setRootCause] = useState('')
  const [correctiveAction, setCorrectiveAction] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/v2/quality/ncrs/${id}`)
      setDoc(r.data)
      setRootCause(r.data?.rootCause || '')
      setCorrectiveAction(r.data?.correctiveAction || '')
    } catch (e: any) {
      setError(e.message || 'Failed to load NCR')
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
      await api(`/api/v2/quality/ncrs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          rootCause: rootCause || null,
          correctiveAction: correctiveAction || null,
        }),
      })
      setMessage(`NCR → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={doc?.ncrNo || 'NCR'}
      subtitle="Module #20 — non-conformance report"
      activeDomain="quality"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Quality', href: '/os/quality' },
        { label: doc?.ncrNo || 'NCR' },
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
                ['Severity', doc.severity],
                ['Assigned', doc.assignedTo || '—'],
                ['Check', doc.qualityCheckId || '—'],
                ['Closed', doc.closedAt ? new Date(doc.closedAt).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <p className="border border-harvics-burgundy/10 bg-harvics-cream/40 px-4 py-3 text-sm">{doc.description}</p>
            {doc.status !== 'Closed' ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
                <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Investigation</p>
                  <textarea
                    className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Root cause"
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                  />
                  <textarea
                    className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Corrective action"
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
                  {doc.status === 'Open' ? (
                    <button
                      type="button"
                      onClick={() => void setStatus('Investigating')}
                      className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                    >
                      Investigate
                    </button>
                  ) : null}
                  {['Open', 'Investigating'].includes(doc.status) ? (
                    <button
                      type="button"
                      onClick={() => void setStatus('Closed')}
                      className="border border-harvics-gold/50 px-3 py-2 text-[10px] font-bold uppercase"
                    >
                      Close
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-2 border border-harvics-burgundy/15 bg-white p-4 text-sm">
                <div>
                  <strong>Root cause:</strong> {doc.rootCause || '—'}
                </div>
                <div>
                  <strong>Corrective action:</strong> {doc.correctiveAction || '—'}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
