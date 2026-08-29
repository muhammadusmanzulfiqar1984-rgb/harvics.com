'use client'

/**
 * Cost center 360 — period + YTD plan/actual, postings, allocations.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function CostCenterDetailPage() {
  const locale = useLocale()
  const params = useParams()
  const search = useSearchParams()
  const code = decodeURIComponent(String(params?.code || ''))
  const period = search.get('period') || new Date().toISOString().slice(0, 7)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [doc, setDoc] = useState<any>(null)

  const load = useCallback(async () => {
    if (!code) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/finance/cost-centers/${encodeURIComponent(code)}?period=${encodeURIComponent(period)}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load cost center')
    } finally {
      setLoading(false)
    }
  }, [code, period])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <HarvicsOSShell
      title={doc?.code || code || 'Cost center'}
      subtitle="Module #2 — cost center document"
      activeDomain="controlling"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Controlling', href: '/os/controlling' },
        { label: code || 'Center' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/controlling`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Controlling workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div>
              <h3 className="text-xl" >
                {doc.name}
              </h3>
              <p className="text-[13px] text-harvics-burgundy/60">
                Manager: {doc.manager || '—'} · {doc.active ? 'Active' : 'Inactive'} · Period {period}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Period plan', fmt(doc.periodPlan)],
                ['Period actual', fmt(doc.periodActual)],
                ['Period variance', fmt(doc.periodVariance)],
                ['YTD variance', fmt(doc.ytdVariance)],
              ].map(([k, v]) => (
                <div key={String(k)} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 font-mono text-lg font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                Postings · {period}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Type', 'Account', 'Amount', 'Description'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!doc.postings?.length ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No postings this period.
                      </td>
                    </tr>
                  ) : (
                    doc.postings.map((p: any, i: number) => (
                      <tr key={p.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2">{p.type}</td>
                        <td className="px-3 py-2 font-mono">{p.account}</td>
                        <td className="px-3 py-2 font-mono">{fmt(p.amount)}</td>
                        <td className="px-3 py-2 text-harvics-burgundy/60">{p.description || '—'}</td>
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
