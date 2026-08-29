'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'
import KPICard from '@/components/shared/KPICard'
import { fetchSalesOrders } from '@/lib/distributorPortal'

export default function DistributorOrdersPage() {
  const locale = useLocale()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchSalesOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false))
  }, [])

  const pending = orders.filter((o) => ['DRAFT', 'CONFIRMED', 'CREDIT_HOLD', 'IN_FULFILLMENT'].includes(o.status)).length
  const delivered = orders.filter((o) => ['DELIVERED', 'INVOICED', 'SHIPPED'].includes(o.status)).length
  const fillRate = orders.length ? Math.round((delivered / orders.length) * 1000) / 10 : 0

  return (
    <PortalSubPageLayout
      portal="distributor"
      allowedRoles={['distributor', 'sales_officer']}
      currentPage="Orders"
      pageTitle="Orders Management"
      pageDescription="Live sales orders from Module #12 / CPQ"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Orders" value={String(orders.length)} icon="📦" />
        <KPICard label="Pending" value={String(pending)} icon="⏳" />
        <KPICard label="Delivered/Shipped" value={String(delivered)} icon="✅" />
        <KPICard label="Fill Rate" value={orders.length ? `${fillRate}%` : '—'} icon="📊" />
      </div>
      <div className="flex gap-3 mb-4">
        <Link href={`/${locale}/distributor-portal/orders/new`} className="px-4 py-2 bg-harvics-burgundy text-white text-sm font-semibold">
          Place New Order
        </Link>
        <Link href={`/${locale}/os/distributors`} className="px-4 py-2 border text-sm font-semibold">
          HQ Admin
        </Link>
      </div>
      <div className="bg-white border overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-gray-600">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-sm text-gray-600">No sales orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F5F0E8]">
              <tr>
                {['Order #', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">${Number(o.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{o.status}</td>
                  <td className="px-4 py-3">{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PortalSubPageLayout>
  )
}
