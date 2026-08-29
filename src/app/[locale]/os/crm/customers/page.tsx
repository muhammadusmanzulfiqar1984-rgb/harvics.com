'use client'

/**
 * Customer directory — bridges Smart CRM ↔ Customer 360.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

type Customer = {
  id: string
  name: string
  segment?: string
  country?: string
  contactEmail?: string
}

async function api(path: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const r = await fetch(path, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token || 'demo-token-company_admin'}`,
    },
  })
  const j = await r.json()
  if (!r.ok || j.success === false) throw new Error(j.error || `HTTP ${r.status}`)
  return j
}

export default function CustomersIndexPage() {
  const locale = useLocale()
  const [rows, setRows] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const j = await api('/api/crm/customers?limit=100')
        if (!cancelled) setRows(j.data || [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load customers')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">CRM · Accounts</p>
          <h2 className="mt-1 font-serif text-2xl text-harvics-burgundy">Customers</h2>
        </div>
        <Link
          href={`/${locale}/os/crm`}
          className="border border-harvics-gold/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy"
        >
          Smart CRM
        </Link>
      </div>

      {error && (
        <div className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error} — start backend with BACKEND_URL set for live data.
        </div>
      )}

      <div className="border border-harvics-gold/25 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-harvics-gold/20 text-[10px] uppercase tracking-[0.14em] text-harvics-burgundy/50">
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Segment</th>
              <th className="px-4 py-3 font-bold">Country</th>
              <th className="px-4 py-3 font-bold">Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-harvics-gold/10 hover:bg-harvics-cream/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/${locale}/os/crm/customers/${c.id}`}
                    className="font-medium text-harvics-burgundy underline-offset-2 hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-harvics-burgundy/70">{c.segment || '—'}</td>
                <td className="px-4 py-3 text-harvics-burgundy/70">{c.country || '—'}</td>
                <td className="px-4 py-3 text-harvics-burgundy/70">{c.contactEmail || '—'}</td>
              </tr>
            ))}
            {!error && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-harvics-burgundy/50">
                  No customers yet — convert a lead in Smart CRM or seed the backend.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
