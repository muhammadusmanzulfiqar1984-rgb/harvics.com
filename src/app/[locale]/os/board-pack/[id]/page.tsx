'use client'

/**
 * Board pack document — Module #42 (SAP-style).
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

const NEXT: Record<string, string[]> = {"Draft":["Review","Approved"],"Review":["Approved","Draft"],"Approved":["Distributed"],"Distributed":[]}

export default function Module42DocumentPage() {
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
      const r = await api(`/api/wave5/board-packs/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void load() }, [load])

  const setStatus = async (status: string) => {
    try {
      setError(''); setMessage('')
      await api(`/api/wave5/board-packs/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) { setError(e.message) }
  }
  const next = doc ? NEXT[doc.status] || [] : []

  return (
    <HarvicsOSShell
      title={doc?.period || 'Board pack'}
      subtitle="Module #42 — SAP+ board pack document"
      activeDomain="bi"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Board Pack', href: '/os/board-pack' },
        { label: doc?.period || 'Board pack' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/board-pack`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Board Pack workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
              ['Period', doc.period ?? '—'],
              ['Title', doc.title ?? '—'],
              ['Status', doc.status ?? '—'],
              ['Generated', doc.generatedAt ? new Date(doc.generatedAt).toLocaleString() : '—'],
              ['Approved by', doc.approvedBy ?? '—'],
              ['Approved at', doc.approvedAt ? new Date(doc.approvedAt).toLocaleString() : '—']
              ].map(([k, v]) => (
                <div key={String(k)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold break-words">{String(v)}</div>
                </div>
              ))}
            </div>

            {next.length > 0 ? (
              <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
                {next.map((s) => (
                  <button key={s} type="button" onClick={() => void setStatus(s)} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">{s}</button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
