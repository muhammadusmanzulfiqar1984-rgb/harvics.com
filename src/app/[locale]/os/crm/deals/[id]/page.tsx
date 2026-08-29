'use client'

/**
 * Deal detail — Wave3 GET /crm/deals/:id + stage advance.
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

const DEAL_STAGES = ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const

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

export default function DealDetailPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [deal, setDeal] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave3/crm/deals/${encodeURIComponent(id)}`)
      setDeal(r.data)
      setCustomer(r.customer || null)
      setActivities(r.activities || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load deal')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const advance = async (stage: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave3/crm/deals/${encodeURIComponent(id)}/stage`, {
        method: 'POST',
        body: JSON.stringify({ stage }),
      })
      setMessage(`Stage → ${stage}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={deal?.name || 'Deal'}
      subtitle="Module #8 — deal detail"
      activeDomain="crm"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'CRM', href: '/os/crm' },
        { label: deal?.name || 'Deal' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/crm`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← CRM workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? (
          <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div>
        ) : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && deal ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Value', fmt(deal.value)],
                ['Probability', `${deal.probability ?? 0}%`],
                ['Currency', deal.currency || 'USD'],
                ['Source', deal.source || '—'],
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
                value={deal.stage}
                onChange={(e) => void advance(e.target.value)}
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {customer ? (
                <Link
                  href={`/${locale}/os/crm/customers/${customer.id}`}
                  className="text-sm font-semibold underline-offset-2 hover:underline"
                >
                  Customer: {customer.name}
                </Link>
              ) : deal.customerId ? (
                <Link
                  href={`/${locale}/os/crm/customers/${deal.customerId}`}
                  className="text-sm underline-offset-2 hover:underline"
                >
                  Customer 360
                </Link>
              ) : null}
            </div>

            {deal.notes ? (
              <div className="border border-harvics-burgundy/15 bg-white px-4 py-3 text-sm">{deal.notes}</div>
            ) : null}

            <div className="border border-harvics-burgundy/15 bg-white">
              <div className="border-b border-harvics-burgundy/10 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">
                Stage history · activities
              </div>
              <ul className="divide-y divide-harvics-burgundy/10">
                {activities.map((a) => (
                  <li key={a.id} className="px-4 py-3 text-sm">
                    <span className="font-mono text-[10px] uppercase text-harvics-burgundy/45">{a.type}</span>
                    <span className="ml-2 font-semibold">{a.subject}</span>
                    {a.body ? <p className="mt-1 text-[13px] text-harvics-burgundy/60">{a.body}</p> : null}
                    <p className="mt-1 text-[11px] text-harvics-burgundy/40">
                      {a.occurredAt ? new Date(a.occurredAt).toLocaleString() : ''}
                    </p>
                  </li>
                ))}
                {!activities.length ? (
                  <li className="px-4 py-6 text-center text-sm text-harvics-burgundy/45">
                    No stage-change activities yet
                  </li>
                ) : null}
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
