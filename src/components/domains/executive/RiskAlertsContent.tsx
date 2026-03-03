'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface RiskAlertsContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function RiskAlertsContent({ persona, locale }: RiskAlertsContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [riskData, setRiskData] = useState<any>(null)

  useEffect(() => {
    loadRisks()
  }, [selectedCountry, persona])

  const loadRisks = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      setRiskData({
        highRisk: 5,
        mediumRisk: 15,
        lowRisk: 28,
        complianceIssues: 2
      })
    } catch (error) {
      console.error('Error loading risks:', error)
      setRiskData({
        highRisk: 5,
        mediumRisk: 15,
        lowRisk: 28,
        complianceIssues: 2
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

  const highRisk = riskData?.highRisk || 0
  const mediumRisk = riskData?.mediumRisk || 0
  const lowRisk = riskData?.lowRisk || 0
  const complianceIssues = riskData?.complianceIssues || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Risk Alerts</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          View Risk Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="High Risk"
          value={highRisk}
          icon="🔴"
        />
        <KPICard
          label="Medium Risk"
          value={mediumRisk}
          icon="🟡"
        />
        <KPICard
          label="Low Risk"
          value={lowRisk}
          icon="🟢"
        />
        <KPICard
          label="Compliance"
          value={complianceIssues}
          icon="🛡️"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Risk Assessment</h4>
        <p className="text-black mb-4">Critical risk alerts and fraud detection monitoring.</p>
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">High Risk: Suspicious Transaction</p>
                <p className="text-sm text-black/70">Unusual payment pattern detected in Region B</p>
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">High</span>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">Medium Risk: Compliance Review</p>
                <p className="text-sm text-black/70">Documentation required for Export License #4523</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Medium</span>
            </div>
          </div>
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-black">Low Risk: Regular Audit</p>
                <p className="text-sm text-black/70">Quarterly inventory audit scheduled</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

