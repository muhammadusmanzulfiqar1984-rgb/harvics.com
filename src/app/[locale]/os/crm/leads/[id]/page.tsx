'use client'

/**
 * Lead detail — Wave8 GET / score / qualify / convert / timeline.
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

const LEAD_STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Converted'] as const

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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function LeadDetailPage() {
  const locale = useLocale()
  const router = useRouter()
  const params = useParams()
  const id = String(params?.id || '')

  const [lead, setLead] = useState<any>(null)
  const [timeline, setTimeline] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [l, t] = await Promise.all([
        api(`/api/wave8/leads/${encodeURIComponent(id)}`),
        api(`/api/wave8/leads/${encodeURIComponent(id)}/timeline`).catch(() => null),
      ])
      setLead(l.data)
      setTimeline(t)
    } catch (e: any) {
      setError(e.message || 'Failed to load lead')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const setStage = async (stage: string) => {
    try {
      setError('')
      setBusy('stage')
      await api(`/api/wave8/leads/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      })
      setMessage(`Stage → ${stage}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  const score = async () => {
    try {
      setError('')
      setBusy('score')
      const r = await api(`/api/wave8/leads/${encodeURIComponent(id)}/score`, {
        method: 'POST',
        body: '{}',
      })
      setMessage(`Scored ${r.data?.aiScore ?? r.insight?.score} · ${r.data?.aiTier || r.insight?.tier || ''}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  const qualify = async () => {
    try {
      setError('')
      setBusy('qualify')
      const r = await api(`/api/wave8/leads/${encodeURIComponent(id)}/qualify`, {
        method: 'POST',
        body: '{}',
      })
      setMessage(r.message || 'Qualified')
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  const convert = async () => {
    try {
      setError('')
      setBusy('convert')
      const r = await api(`/api/wave8/leads/${encodeURIComponent(id)}/convert`, {
        method: 'POST',
        body: '{}',
      })
      const customerId = r.customer?.id
      setMessage(r.message || 'Converted')
      if (customerId) {
        router.push(`/${locale}/os/crm/customers/${customerId}`)
        return
      }
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <HarvicsOSShell
      title={lead?.company || 'Lead'}
      subtitle="Module #8 — lead detail"
      activeDomain="crm"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'CRM', href: '/os/crm' },
        { label: lead?.company || 'Lead' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${locale}/os/crm`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline"
          >
            ← CRM workspace
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!busy || lead?.stage === 'Converted'}
              onClick={() => void score()}
              className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] disabled:opacity-40"
            >
              {busy === 'score' ? 'Scoring…' : 'AI Score'}
            </button>
            <button
              type="button"
              disabled={!!busy || lead?.stage === 'Converted' || lead?.stage === 'Qualified'}
              onClick={() => void qualify()}
              className="border border-harvics-gold/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] disabled:opacity-40"
            >
              {busy === 'qualify' ? '…' : 'Qualify'}
            </button>
            <button
              type="button"
              disabled={!!busy || lead?.stage === 'Converted' || lead?.stage === 'Lost'}
              onClick={() => void convert()}
              className="bg-harvics-burgundy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream disabled:opacity-40"
            >
              {busy === 'convert' ? '…' : 'Convert'}
            </button>
          </div>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? (
          <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div>
        ) : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && lead ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Contact', lead.contact || '—'],
                ['Email', lead.email || '—'],
                ['Value', fmt(lead.value)],
                ['Source', lead.source || '—'],
                ['AI score', lead.aiScore != null ? `${lead.aiScore} · ${lead.aiTier || '—'}` : '—'],
                ['Owner', lead.ownerId || '—'],
              ].map(([label, value]) => (
                <div key={label} className="border border-harvics-burgundy/15 bg-white px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/45">{label}</p>
                  <p className="mt-1 text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Stage</span>
              <select
                className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                value={lead.stage}
                disabled={lead.stage === 'Converted' || busy === 'stage'}
                onChange={(e) => void setStage(e.target.value)}
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {lead.notes ? <p className="text-sm text-harvics-burgundy/70">{lead.notes}</p> : null}
            </div>

            {timeline?.aiSummary ? (
              <div className="border border-harvics-gold/30 bg-white px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">AI timeline summary</p>
                <p className="mt-2 text-sm text-harvics-burgundy/80">
                  {typeof timeline.aiSummary === 'string'
                    ? timeline.aiSummary
                    : timeline.aiSummary?.summary || JSON.stringify(timeline.aiSummary)}
                </p>
              </div>
            ) : null}

            <div className="border border-harvics-burgundy/15 bg-white">
              <div className="border-b border-harvics-burgundy/10 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">
                Timeline · activities
              </div>
              <ul className="divide-y divide-harvics-burgundy/10">
                {(timeline?.activities || []).map((a: any) => (
                  <li key={a.id} className="px-4 py-3 text-sm">
                    <span className="font-mono text-[10px] uppercase text-harvics-burgundy/45">{a.type}</span>
                    <span className="ml-2 font-semibold">{a.subject}</span>
                    {a.body ? <p className="mt-1 text-[13px] text-harvics-burgundy/60">{a.body}</p> : null}
                    <p className="mt-1 text-[11px] text-harvics-burgundy/40">
                      {a.occurredAt ? new Date(a.occurredAt).toLocaleString() : ''}
                    </p>
                  </li>
                ))}
                {!(timeline?.activities || []).length ? (
                  <li className="px-4 py-6 text-center text-sm text-harvics-burgundy/45">No activities yet</li>
                ) : null}
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
