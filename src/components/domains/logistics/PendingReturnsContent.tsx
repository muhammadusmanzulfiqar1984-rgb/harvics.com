'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface PendingReturnsContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function PendingReturnsContent({ persona, locale }: PendingReturnsContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [returnData, setReturnData] = useState<any>(null)

  useEffect(() => {
    loadReturns()
  }, [selectedCountry, persona])

  const loadReturns = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      // Mock return data structure
      setReturnData({
        pending: 45,
        processed: 234,
        totalValue: 125000
      })
    } catch (error) {
      console.error('Error loading returns:', error)
      setReturnData({
        pending: 45,
        processed: 234,
        totalValue: 125000
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

  const pending = returnData?.pending || 0
  const processed = returnData?.processed || 0
  const totalValue = returnData?.totalValue || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Pending Returns</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          Process Return
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Pending"
          value={pending}
          icon="⏳"
        />
        <KPICard
          label="Processed"
          value={processed}
          icon="✅"
        />
        <KPICard
          label="Total Value"
          value={`$${(totalValue / 1000).toFixed(1)}K`}
          icon="💰"
        />
        <KPICard
          label="Avg. Time"
          value="2.5 days"
          icon="⏱️"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Returns Awaiting Processing</h4>
        <p className="text-black mb-4">Returns that need to be processed and handled.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black200">
                <th className="text-left py-2 font-medium text-black">Return ID</th>
                <th className="text-left py-2 font-medium text-black">Order ID</th>
                <th className="text-left py-2 font-medium text-black">Reason</th>
                <th className="text-left py-2 font-medium text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">RET-001</td>
                <td className="py-2 text-black">ORD-001</td>
                <td className="py-2 text-black">Damaged</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pending</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">RET-002</td>
                <td className="py-2 text-black">ORD-002</td>
                <td className="py-2 text-black">Expired</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pending</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">RET-003</td>
                <td className="py-2 text-black">ORD-003</td>
                <td className="py-2 text-black">Wrong Item</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Processed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

