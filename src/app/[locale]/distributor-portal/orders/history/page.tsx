'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { fetchSalesOrders } from '@/lib/distributorPortal'

export default function OrderHistory() {
  const locale = useLocale()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('All')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        setOrders(await fetchSalesOrders())
      } catch (e: any) {
        setError(e.message)
        setOrders([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = status === 'All' ? orders : orders.filter((o) => String(o.status) === status)

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'DELIVERED':
      case 'INVOICED':
        return 'bg-green-100 text-green-800'
      case 'SHIPPED':
      case 'IN_FULFILLMENT':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-800'
      case 'CREDIT_HOLD':
        return 'bg-red-100 text-red-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-harvics-burgundy">Order History</h1>
        <Link href={`/${locale}/distributor-portal/orders/new`} className="bg-harvics-gold text-harvics-burgundy px-6 py-2 font-semibold">
          Place New Order
        </Link>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="bg-white p-4 border border-black/10">
        <label className="block text-sm font-semibold text-harvics-burgundy mb-2">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full max-w-xs px-4 py-2 border">
          {['All', 'DRAFT', 'CONFIRMED', 'CREDIT_HOLD', 'IN_FULFILLMENT', 'SHIPPED', 'DELIVERED', 'INVOICED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="bg-white border border-black/10 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-600">Loading sales orders…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-600">No orders yet — place one from New Order.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F5F0E8]">
              <tr>
                {['Order #', 'Customer', 'Date', 'Total', 'Status', 'Lines'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">${Number(o.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">{Array.isArray(o.lines) ? o.lines.length : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
