'use client'

/**
 * Sales orders from CPQ Accept — Module #9 → Orders spine
 */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0)

export default function SalesOrdersContent({ locale }: { locale: string }) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/wave5/sales-orders?limit=100', {
        cache: 'no-store',
        headers: authHeaders(),
      })
      const j = await r.json()
      if (!r.ok || j.success === false) throw new Error(j.error || `HTTP ${r.status}`)
      setRows(j.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load sales orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const creditHold = rows.filter((o) => o.status === 'CREDIT_HOLD').length
  const confirmed = rows.filter((o) => o.status === 'CONFIRMED' || o.status === 'INVOICED').length
  const totalValue = rows.reduce((s, o) => s + (o.totalAmount || 0), 0)

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-harvics-burgundy">Sales Orders</h3>
          <p className="mt-1 text-sm text-harvics-burgundy/55">
            Created when CPQ quotes are accepted — credit hold when limit exceeded.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/cpq`}
            className="border border-harvics-gold/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy"
          >
            CPQ
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Orders', rows.length],
          ['Confirmed / invoiced', confirmed],
          ['Credit hold', creditHold],
          ['Total value', fmt(totalValue)],
        ].map(([label, val]) => (
          <div key={String(label)} className="border border-harvics-gold/25 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-harvics-burgundy/45">{label}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-harvics-burgundy">{val}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-harvics-burgundy/45">Loading…</p>
      ) : (
        <div className="overflow-x-auto border border-harvics-gold/25 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Order', 'Customer', 'Lines', 'Tax', 'Total', 'Status', 'Quote'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-harvics-burgundy/45">
                    No sales orders yet. Accept a quote in CPQ.
                  </td>
                </tr>
              ) : (
                rows.map((o, i) => (
                  <tr key={o.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">{o.orderNumber}</td>
                    <td className="px-3 py-2">{o.customerName}</td>
                    <td className="px-3 py-2">{(o.lines || []).length}</td>
                    <td className="px-3 py-2 font-mono">{fmt(o.taxAmount || 0, o.currency)}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{fmt(o.totalAmount || 0, o.currency)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          o.status === 'CREDIT_HOLD'
                            ? 'font-bold text-red-700'
                            : 'text-harvics-burgundy'
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-harvics-burgundy/50">
                      {o.quoteId ? o.quoteId.slice(0, 8) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
