'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import LocalizationBar from '@/components/shared/LocalizationBar'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

export default function PriceLists() {
  const locale = useLocale()
  const [lists, setLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/wave5/price-lists', { cache: 'no-store', headers: authHeaders() })
      const json = await res.json()
      if (!res.ok || json.success === false) throw new Error(json.error || `HTTP ${res.status}`)
      setLists(json.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const rows = lists.flatMap((pl) =>
    (pl.entries || []).map((e: any) => ({
      sku: e.sku,
      listName: pl.name,
      currency: pl.currency,
      unitPrice: e.unitPrice,
      minQty: e.minQty,
      discount: e.discount,
      isDefault: pl.isDefault,
    })),
  )

  return (
    <div className="space-y-6">
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-harvics-gold">Price Lists</h1>
          <p className="text-sm text-harvics-gold/80">Live from CPQ Module #9 — manage lists in OS CPQ</p>
        </div>
        <a
          href={`/${locale}/os/cpq`}
          className="border border-harvics-gold/40 px-4 py-2 text-sm font-semibold text-harvics-burgundy"
        >
          Open CPQ
        </a>
      </div>

      {error && <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <div className="overflow-hidden border border-black200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-harvics-gold/90">Loading price lists…</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-harvics-gold/90">No SKUs priced yet — add entries in CPQ → Price lists.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  {['SKU', 'List', 'Min qty', 'Unit price', 'Discount %', 'Currency', 'Default'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase text-harvics-gold/90">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((item, i) => (
                  <tr key={`${item.sku}-${i}`} className="hover:bg-harvics-cream/30">
                    <td className="px-6 py-4 font-semibold text-harvics-gold/90">{item.sku}</td>
                    <td className="px-6 py-4 text-sm">{item.listName}</td>
                    <td className="px-6 py-4 text-sm">{item.minQty}</td>
                    <td className="px-6 py-4 font-semibold">{item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">{item.discount}%</td>
                    <td className="px-6 py-4 text-sm">{item.currency}</td>
                    <td className="px-6 py-4 text-sm">{item.isDefault ? 'Yes' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
