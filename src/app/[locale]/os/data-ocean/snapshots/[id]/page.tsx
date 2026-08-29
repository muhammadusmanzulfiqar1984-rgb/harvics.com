'use client'

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
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

export default function Module55DocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || params?.symbol || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave7/snapshots/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void load() }, [load])




  return (
    <HarvicsOSShell
      title={doc ? String(doc.tableName) : 'Document'}
      subtitle="Module #55 — SAP+ snapshot document"
      activeDomain="data-ocean"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Data Ocean', href: '/os/data-ocean' },
        { label: doc ? String(doc.tableName) : 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/data-ocean`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Data Ocean workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
              ['Table', doc.tableName ?? '—'],
              ['Records', doc.recordCount ?? '—'],
              ['Size bytes', doc.sizeBytes ?? '—'],
              ['Format', doc.format ?? '—'],
              ['Storage', doc.storageRef ?? '—'],
              ['Captured', doc.capturedAt ? new Date(doc.capturedAt).toLocaleString() : '—'],
              ['By', doc.capturedBy ?? '—']
              ].map(([k, v]) => (
                <div key={String(k)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold break-words">{String(v)}</div>
                </div>
              ))}
            </div>
            
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
