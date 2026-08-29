'use client'

/**
 * Notification document — Module #51 (SAP-style).
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

export default function Module51DocumentPage() {
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
      const r = await api(`/api/v2/notifications/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void load() }, [load])

  const markRead = async () => {
    try {
      setError(''); setMessage('')
      await api(`/api/v2/notifications/${id}/read`, { method: 'POST', body: '{}' })
      setMessage('Marked read')
      await load()
    } catch (e: any) { setError(e.message) }
  }

  return (
    <HarvicsOSShell
      title={doc?.title || 'Notification'}
      subtitle="Module #51 — SAP+ notification document"
      activeDomain="platform"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Notifications', href: '/os/notifications' },
        { label: doc?.title || 'Notification' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/notifications`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Notifications workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
              ['Title', doc.title ?? '—'],
              ['Message', doc.message ?? '—'],
              ['Channel', doc.channel ?? '—'],
              ['Severity', doc.severity ?? '—'],
              ['Category', doc.category ?? '—'],
              ['Read', doc.read == null ? '—' : String(doc.read)],
              ['Read at', doc.readAt ? new Date(doc.readAt).toLocaleString() : '—'],
              ['Created', doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '—']
              ].map(([k, v]) => (
                <div key={String(k)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold break-words">{String(v)}</div>
                </div>
              ))}
            </div>

            {!doc.read ? (
              <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
                <button type="button" onClick={() => void markRead()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">Mark read</button>
              </div>
            ) : <p className="text-sm text-harvics-gold font-semibold">Read</p>}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
