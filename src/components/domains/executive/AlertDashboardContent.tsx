'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface AlertDashboardContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function AlertDashboardContent({ persona, locale }: AlertDashboardContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  interface AlertData {
    critical?: number
    warning?: number
    info?: number
    resolved?: number
  }
  const [alertData, setAlertData] = useState<AlertData | null>(null)

  useEffect(() => {
    loadAlerts()
  }, [selectedCountry, persona])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      setAlertData({
        critical: 3,
        warning: 12,
        info: 45,
        resolved: 234
      })
    } catch (error) {
      console.error('Error loading alerts:', error)
      setAlertData({
        critical: 3,
        warning: 12,
        info: 45,
        resolved: 234
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

  const critical = alertData?.critical || 0
  const warning = alertData?.warning || 0
  const info = alertData?.info || 0
  const resolved = alertData?.resolved || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Alert Dashboard</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          View All Alerts
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Critical"
          value={critical}
          icon="🚨"
        />
        <KPICard
          label="Warning"
          value={warning}
          icon="⚠️"
        />
        <KPICard
          label="Info"
          value={info}
          icon="ℹ️"
        />
        <KPICard
          label="Resolved"
          value={resolved}
          icon="✅"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Recent Alerts</h4>
        <p className="text-black mb-4">Real-time AI-generated alerts and exceptions requiring attention.</p>
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">Critical: Low Inventory Alert</p>
                <p className="text-sm text-black/70">5 SKUs below reorder point in Warehouse A</p>
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Critical</span>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">Warning: Payment Delay</p>
                <p className="text-sm text-black/70">3 invoices overdue {'>'} 60 days</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Warning</span>
            </div>
          </div>
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">Info: IPR Renewal</p>
                <p className="text-sm text-black/70">2 IPR renewals due in 30 days</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Info</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

