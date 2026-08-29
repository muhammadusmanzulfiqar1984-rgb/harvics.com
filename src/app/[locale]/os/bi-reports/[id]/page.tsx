'use client'

/**
 * BI report document — Module #41 (SAP-style).
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

export default function Module41DocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [runResult, setRunResult] = useState<any>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave5/reports/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void load() }, [load])

  const run = async () => {
    try {
      setError(''); setMessage('')
      const r = await api(`/api/wave5/reports/${id}/run`, { method: 'POST', body: '{}' })
      setRunResult(r.data)
      setMessage('Report ran')
      await load()
    } catch (e: any) { setError(e.message) }
  }

  return (
    <HarvicsOSShell
      title={doc?.name || 'BI report'}
      subtitle="Module #41 — SAP+ saved report document"
      activeDomain="bi"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'BI Reports', href: '/os/bi-reports' },
        { label: doc?.name || 'BI report' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/bi-reports`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← BI Reports workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
              ['Name', doc.name ?? '—'],
              ['Category', doc.category ?? '—'],
              ['Source', doc.sourceTable ?? '—'],
              ['Metric', doc.metric ?? '—'],
              ['Metric field', doc.metricField ?? '—'],
              ['Group by', doc.groupBy ?? '—'],
              ['Last run', doc.lastRunAt ? new Date(doc.lastRunAt).toLocaleString() : '—'],
              ['Description', doc.description ?? '—']
              ].map(([k, v]) => (
                <div key={String(k)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold break-words">{String(v)}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Actions</p>
              <button type="button" onClick={() => void run()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">Run report</button>
              {runResult ? <pre className="w-full mt-2 max-h-60 overflow-auto bg-white p-3 font-mono text-xs">{JSON.stringify(runResult, null, 2)}</pre> : null}
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
