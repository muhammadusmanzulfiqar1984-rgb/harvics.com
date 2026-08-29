'use client'

/**
 * 3PL partner document — activate / deactivate + events (Module #28).
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

export default function ThreePLPartnerDocumentPage() {
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
      const r = await api(`/api/wave5/threepl-partners/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load partner')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const setActive = async (active: boolean) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave5/threepl-partners/${id}/status`, { method: 'POST', body: JSON.stringify({ active }) })
      setMessage(active ? 'Activated' : 'Deactivated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const processEv = async (eventId: string) => {
    try {
      setError('')
      await api(`/api/wave5/threepl-events/${eventId}/process`, { method: 'POST', body: '{}' })
      setMessage('Event processed')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={doc?.code || '3PL Partner'}
      subtitle="Module #28 — 3PL partner document"
      activeDomain="logistics"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: '3PL', href: '/os/threepl' },
        { label: doc?.code || 'Partner' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/threepl`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← 3PL workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.active !== false ? 'Active' : 'Inactive'],
                ['Name', doc.name],
                ['Auth', doc.authMode],
                ['API', doc.apiBaseUrl || '—'],
                ['Webhook', doc.webhookUrl || '—'],
                ['Events', String(doc.events?.length || 0)],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 break-all text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
              {doc.active !== false ? (
                <button type="button" onClick={() => void setActive(false)} className="border border-harvics-burgundy/30 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
                  Deactivate
                </button>
              ) : (
                <button type="button" onClick={() => void setActive(true)} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
                  Activate
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Partner events</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['When', 'Type', 'Processed', 'Act'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(doc.events || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-harvics-burgundy/45">No events.</td>
                    </tr>
                  ) : (
                    (doc.events || []).map((e: any, i: number) => (
                      <tr key={e.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 text-[11px]">{new Date(e.receivedAt).toLocaleString()}</td>
                        <td className="px-3 py-2">{e.eventType}</td>
                        <td className="px-3 py-2">{e.processed ? 'Yes' : 'No'}</td>
                        <td className="px-3 py-2">
                          {!e.processed ? (
                            <button type="button" onClick={() => void processEv(e.id)} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                              Process
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
