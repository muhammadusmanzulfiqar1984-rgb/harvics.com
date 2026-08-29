'use client'

/** Module #40 — SAP+ document detail */

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

const NEXT: Record<string, string[]> = {

}

export default function DocumentPage() {
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
      const r = await api(`/api/platform/governance/policies/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void load() }, [load])

  const setStatus = async (status: string, path?: string, body?: any) => {
    try {
      setError('')
      setMessage('')
      const endpoint = path || `/api/platform/governance/policies/${id}/status`
      await api(endpoint, { method: 'POST', body: JSON.stringify(body ?? { status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const next = doc ? NEXT[doc.status] || [] : []
  const title = doc ? (doc.name || 'Policy') : 'Document'

  return (
    <HarvicsOSShell
      title={typeof title === 'string' ? title : String(title)}
      subtitle="Module #40 — SAP+ governance policy"
      activeDomain="governance"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Governance', href: '/os/governance' },
        { label: typeof title === 'string' ? title : 'Doc' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/governance`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Governance workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Name', doc.name],
                ['Scope', doc.scope],
                ['Severity', doc.severity],
                ['Enabled', doc.enabled ? 'Yes' : 'No'],
                ['Target', doc.targetKey || '—'],
                ['Created', doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            {next.length > 0 ? (
              <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
                {next.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void setStatus(s)}
                    className="border border-harvics-burgundy/30 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <button type="button" onClick={async () => { try { setError(''); await api(`/api/platform/governance/policies/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled: !doc.enabled }) }); setMessage(doc.enabled ? 'Disabled' : 'Enabled'); await load() } catch (e: any) { setError(e.message) } }} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase">{doc.enabled ? 'Disable' : 'Enable'}</button>
            </div>
            {doc.rule ? <pre className="overflow-x-auto border border-harvics-burgundy/15 bg-harvics-cream/40 p-4 font-mono text-[11px]">{JSON.stringify(doc.rule, null, 2)}</pre> : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
