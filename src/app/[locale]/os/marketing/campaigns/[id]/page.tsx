'use client'

/**
 * Email campaign document — Draft → Scheduled → Sent (mints CRM leads).
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

export default function MarketingCampaignDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [scheduledAt, setScheduledAt] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/v2/marketing/email-campaigns/${id}`)
      setDoc(r.data)
      if (r.data?.scheduledAt) setScheduledAt(String(r.data.scheduledAt).slice(0, 16))
    } catch (e: any) {
      setError(e.message || 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const schedule = async () => {
    try {
      setError('')
      setMessage('')
      await api(`/api/v2/marketing/email-campaigns/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: 'Scheduled', scheduledAt: scheduledAt || undefined }),
      })
      setMessage('Campaign scheduled')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const cancel = async () => {
    try {
      setError('')
      setMessage('')
      await api(`/api/v2/marketing/email-campaigns/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: 'Cancelled' }),
      })
      setMessage('Campaign cancelled')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const send = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/v2/marketing/email-campaigns/${id}/send`, { method: 'POST', body: '{}' })
      setMessage(`Sent to ${r.sentCount || 0} · CRM leads +${r.leadsCreated || 0}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const open = doc && (doc.status === 'Draft' || doc.status === 'Scheduled')

  return (
    <HarvicsOSShell
      title={doc?.name || 'Campaign'}
      subtitle="Module #11 — email campaign document"
      activeDomain="marketing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Marketing', href: '/os/marketing' },
        { label: doc?.name || 'Campaign' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/os/marketing`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← Marketing workspace
          </Link>
          <Link
            href={`/${locale}/os/crm`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50"
          >
            CRM leads
          </Link>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['Subject', doc.subject],
                ['Segment', doc.segment || '—'],
                ['Sent count', String(doc.sentCount || 0)],
                ['Opens', String(doc.openCount || 0)],
                ['Clicks', String(doc.clickCount || 0)],
                ['Scheduled', doc.scheduledAt ? new Date(doc.scheduledAt).toLocaleString() : '—'],
                ['Sent at', doc.sentAt ? new Date(doc.sentAt).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            {open ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
                <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Schedule</p>
                  <input
                    type="datetime-local"
                    className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => void schedule()}
                    className="border border-harvics-burgundy/30 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                  >
                    Mark scheduled
                  </button>
                </div>
                <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
                  <button
                    type="button"
                    onClick={() => void send()}
                    className="bg-harvics-burgundy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream"
                  >
                    Send now
                  </button>
                  <button
                    type="button"
                    onClick={() => void cancel()}
                    className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-red-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
