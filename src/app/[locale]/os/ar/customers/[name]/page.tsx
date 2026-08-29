'use client'

/**
 * Customer AR statement — open items + history.
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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

export default function ArCustomerStatementPage() {
  const locale = useLocale()
  const params = useParams()
  const name = decodeURIComponent(String(params?.name || ''))

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stmt, setStmt] = useState<any>(null)

  const load = useCallback(async () => {
    if (!name) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/finance/ar/customers/${encodeURIComponent(name)}/statement`)
      setStmt(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load statement')
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <HarvicsOSShell
      title={name || 'Customer'}
      subtitle="Module #3 — customer statement"
      activeDomain="ar"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'AR', href: '/os/ar-aging' },
        { label: name || 'Customer' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/ar-aging`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← AR workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && stmt ? (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['As of', stmt.asOf],
                ['Invoices', stmt.invoiceCount],
                ['Open', stmt.openCount],
                ['Outstanding', fmt(stmt.outstanding)],
              ].map(([k, v]) => (
                <div key={String(k)} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Invoice', 'Amount', 'Paid', 'Outstanding', 'Status', 'Due'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stmt.invoices || []).map((inv: any, i: number) => (
                    <tr key={inv.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link className="underline decoration-harvics-gold/50" href={`/${locale}/os/ar/invoices/${inv.id}`}>
                          {inv.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-mono">{fmt(inv.amount)}</td>
                      <td className="px-3 py-2 font-mono">{fmt(inv.paid)}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{fmt(inv.outstanding)}</td>
                      <td className="px-3 py-2">{inv.status}</td>
                      <td className="px-3 py-2">{inv.dueDate || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
