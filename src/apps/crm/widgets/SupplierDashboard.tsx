'use client'

import { useEffect, useState } from 'react'
import { getSupplierDashboardViewModel } from '@/apps/crm/crm.controller'
import { DashboardCard } from './DashboardCard'

interface SupplierDashboardState {
  purchaseOrders: number
  shipments: number
  invoices: number
  paymentsPending: number
  qualityComplaints: number
  forecast: number
  currency: string
}

const initialState: SupplierDashboardState = {
  purchaseOrders: 0,
  shipments: 0,
  invoices: 0,
  paymentsPending: 0,
  qualityComplaints: 0,
  forecast: 0,
  currency: '',
}

export const SupplierDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(initialState)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const viewModel = await getSupplierDashboardViewModel()
        setData(viewModel)
      } catch (error) {
        console.error('Failed to load supplier dashboard', error)
        setData(initialState)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="bg-white text-center py-20 rounded-2xl text-[#6B1F2B]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C3A35E] mx-auto mb-4"></div>
        <p>Loading supplier cockpit…</p>
      </div>
    )
  }

  const formatCurrency = (value: number) =>
    `${data.currency || ''} ${Math.round(value).toLocaleString()}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Purchase orders" value={data.purchaseOrders} subtitle="Raised by Harvics" />
        <DashboardCard title="Shipments / GRN" value={data.shipments} subtitle="Accepted this week" accent="green" />
        <DashboardCard
          title="Invoices created"
          value={formatCurrency(data.invoices)}
          subtitle="Awaiting payment"
          accent="gold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="Payments pending"
          value={formatCurrency(data.paymentsPending)}
          subtitle="Scheduled for release"
          accent="red"
        />
        <DashboardCard
          title="Quality / complaints"
          value={data.qualityComplaints}
          subtitle="Open tickets"
          accent="red"
        />
        <DashboardCard
          title="Forecast (next 4 weeks)"
          value={formatCurrency(data.forecast)}
          subtitle="AI placeholder"
          accent="gold"
        />
      </div>

      <div className="bg-white/90 rounded-xl border border-[#C3A35E]/30 p-4 shadow">
        <h3 className="text-sm font-semibold text-black uppercase tracking-widest mb-2">Supplier actions</h3>
        <ul className="text-sm text-black/80 list-disc list-inside space-y-1">
          <li>Confirm upcoming shipments and update GRN schedule.</li>
          <li>Review outstanding invoices and share payment advice.</li>
          <li>Resolve open quality complaints with QA evidence.</li>
        </ul>
      </div>
    </div>
  )
}

