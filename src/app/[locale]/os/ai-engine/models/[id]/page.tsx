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

export default function Module56DocumentPage() {
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
      const r = await api(`/api/ai/models/${id}`)
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
      await api(`/api/ai/models/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) { setError(e.message) }
  }


  return (
    <HarvicsOSShell
      title={doc ? String(doc.name) : 'Document'}
      subtitle="Module #56 — SAP+ AI model document"
      activeDomain="ai-engine"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'AI Engine', href: '/os/ai-engine' },
        { label: doc ? String(doc.name) : 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/ai-engine`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← AI Engine workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
              ['Name', doc.name ?? '—'],
              ['Provider', doc.provider ?? '—'],
              ['Status', doc.status ?? '—'],
              ['Created', doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '—']
              ].map(([k, v]) => (
                <div key={String(k)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold break-words">{String(v)}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
              {doc.status !== 'Active' ? <button type="button" onClick={() => void setStatus('Active')} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">Enable</button> : null}
              {doc.status === 'Active' ? <button type="button" onClick={() => void setStatus('Disabled')} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">Disable</button> : null}
              {doc.status !== 'Deprecated' ? <button type="button" onClick={() => void setStatus('Deprecated')} className="border border-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Deprecate</button> : null}
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
