'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface DeliveryQueueContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function DeliveryQueueContent({ persona, locale }: DeliveryQueueContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [deliveryData, setDeliveryData] = useState<any>(null)

  useEffect(() => {
    loadDeliveries()
  }, [selectedCountry, persona])

  const loadDeliveries = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      setDeliveryData((response as any)?.data?.data?.logistics || (response as any)?.data?.logistics || null)
    } catch (error) {
      console.error('Error loading deliveries:', error)
      setDeliveryData({
        pending: 156,
        scheduled: 234,
        inProgress: 89,
        completed: 23400
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
      </div>
    )
  }

  const pending = deliveryData?.pending || 0
  const scheduled = deliveryData?.scheduled || 0
  const inProgress = deliveryData?.inProgress || 0
  const completed = deliveryData?.deliveries || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Delivery Queue</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + Schedule Delivery
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Pending"
          value={pending}
          icon="⏳"
        />
        <KPICard
          label="Scheduled"
          value={scheduled}
          icon="📅"
        />
        <KPICard
          label="In Progress"
          value={inProgress}
          icon="🚚"
        />
        <KPICard
          label="Completed"
          value={completed.toLocaleString()}
          icon="✅"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Pending Deliveries</h4>
        <p className="text-black mb-4">Deliveries awaiting assignment and scheduling.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black200">
                <th className="text-left py-2 font-medium text-black">Order ID</th>
                <th className="text-left py-2 font-medium text-black">Destination</th>
                <th className="text-left py-2 font-medium text-black">Priority</th>
                <th className="text-left py-2 font-medium text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">ORD-001</td>
                <td className="py-2 text-black">North Warehouse</td>
                <td className="py-2 text-black">High</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pending</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">ORD-002</td>
                <td className="py-2 text-black">City Center</td>
                <td className="py-2 text-black">Medium</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Scheduled</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">ORD-003</td>
                <td className="py-2 text-black">Airport Zone</td>
                <td className="py-2 text-black">Low</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">In Progress</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

