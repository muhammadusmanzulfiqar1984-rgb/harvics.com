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

export default function Module72DocumentPage() {
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
      const r = await api(`/api/executive/goals/${id}`)
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
      await api(`/api/executive/goals/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) { setError(e.message) }
  }


  return (
    <HarvicsOSShell
      title={doc ? String(doc.title) : 'Document'}
      subtitle="Module #72 — SAP+ executive goal document"
      activeDomain="executive"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Executive', href: '/os/executive' },
        { label: doc ? String(doc.title) : 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/executive`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Executive workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
              ['Title', doc.title ?? '—'],
              ['Metric', doc.metric ?? '—'],
              ['Progress', (doc.currentValue ?? 0) + ' / ' + (doc.targetValue ?? '—') + ' ' + (doc.unit || '')],
              ['Period', doc.period ?? '—'],
              ['Status', doc.status ?? '—']
              ].map(([k, v]) => (
                <div key={String(k)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold break-words">{String(v)}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
              {['active','achieved','at_risk','cancelled'].map((s) => (
                <button key={s} type="button" onClick={() => void setStatus(s)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${doc.status===s?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy'}`}>{s}</button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
