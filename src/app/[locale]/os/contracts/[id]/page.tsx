'use client'

/** Contract document — Module #15 */

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

export default function ContractDocumentPage() {
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
      const r = await api(`/api/wave5/contracts/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load contract')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const transition = async (action: string, label: string) => {
    try {
      setError('')
      await api(`/api/wave5/contracts/${id}/${action}`, { method: 'POST', body: '{}' })
      setMessage(label)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const d = (v: any) => (v ? new Date(v).toLocaleDateString() : '—')

  return (
    <HarvicsOSShell
      title={doc?.contractNo || 'Contract'}
      subtitle="Module #15 — contract document"
      activeDomain="contracts"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Contracts', href: '/os/contracts' },
        { label: doc?.contractNo || 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/contracts`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Contracts workspace
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
                ['Counterparty', doc.counterparty],
                ['Type', doc.type],
                ['Value', fmt(doc.value, doc.currency || 'USD')],
                ['Start', d(doc.startDate)],
                ['End', d(doc.endDate)],
                ['Signed', doc.signedAt ? new Date(doc.signedAt).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            {doc.notes ? <p className="border border-harvics-burgundy/10 bg-harvics-cream/40 px-4 py-3 text-sm">{doc.notes}</p> : null}
            <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4 sm:max-w-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
              {doc.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => void transition('negotiate', 'Negotiating')}
                  className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                >
                  Negotiate
                </button>
              ) : null}
              {['Draft', 'Negotiating'].includes(doc.status) ? (
                <button
                  type="button"
                  onClick={() => void transition('sign', 'Signed')}
                  className="border border-harvics-gold/50 px-3 py-2 text-[10px] font-bold uppercase"
                >
                  Sign
                </button>
              ) : null}
              {doc.status === 'Signed' ? (
                <button
                  type="button"
                  onClick={() => void transition('activate', 'Activated')}
                  className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                >
                  Activate
                </button>
              ) : null}
              {!['Expired', 'Terminated'].includes(doc.status) ? (
                <button
                  type="button"
                  onClick={() => void transition('terminate', 'Terminated')}
                  className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase text-red-800"
                >
                  Terminate
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
