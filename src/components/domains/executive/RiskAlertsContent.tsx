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
      const [ordersInsightsRes, financeInsightsRes] = await Promise.all([
        apiClient.request('/intelligence/insights/orders'),
        apiClient.request('/intelligence/insights/finance')
      ])
      
      const orderInsights = (ordersInsightsRes?.data as any)?.insights || []
      const finInsights = (financeInsightsRes?.data as any)?.insights || []
      const allInsights = [...orderInsights, ...finInsights]
      
      // Categorize risks
      let highRisk = 0
      let mediumRisk = 0
      let lowRisk = 0
      let complianceIssues = 0
      
      allInsights.forEach((insight: any) => {
        if (insight.type === 'alert' && insight.severity === 'high') {
          highRisk++
        } else if (insight.type === 'alert' && insight.severity === 'medium') {
          mediumRisk++
        } else if (insight.type === 'alert') {
          lowRisk++
        }
        if (insight.message?.toLowerCase().includes('compliance')) {
          complianceIssues++
        }
      })
      
      setRiskData({
        highRisk,
        mediumRisk,
        lowRisk,
        complianceIssues,
        insights: allInsights
      })
    } catch (error) {
      console.error('Error loading risks:', error)
      setRiskData({
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        complianceIssues: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5E5EA]"></div>
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
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Risk Alerts</h3>
        <button className="px-4 py-2 bg-[#6B1F2B] text-white text-xs font-medium rounded-xl hover:bg-[#5a1a24] transition-colors">
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

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Risk Assessment</h4>
        <p className="text-black mb-4">Critical risk alerts and fraud detection monitoring.</p>
        <div className="mt-4 space-y-3">
          {(riskData?.insights || []).filter((i: any) => i.type === 'alert' || i.type === 'anomaly').map((insight: any, idx: number) => {
            const severity = insight.severity || (insight.type === 'anomaly' ? 'medium' : 'low')
            const bgColor = severity === 'high' ? 'bg-[#F5F5F7]' : severity === 'medium' ? 'bg-[#F5F5F7]' : 'bg-[#F5F5F7]'
            const borderColor = severity === 'high' ? 'border-red-500' : severity === 'medium' ? 'border-yellow-500' : 'border-green-500'
            const badgeBg = severity === 'high' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : severity === 'medium' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'
            return (
              <div key={idx} className={`p-4 ${bgColor} border-l-4 ${borderColor} rounded`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-black">{insight.message}</p>
                    {insight.confidence && <p className="text-sm text-black/70">Confidence: {(insight.confidence * 100).toFixed(0)}%</p>}
                  </div>
                  <span className={`px-2 py-1 ${badgeBg} rounded text-xs capitalize`}>{severity}</span>
                </div>
              </div>
            )
          })}
          {(riskData?.insights || []).filter((i: any) => i.type === 'recommendation').map((rec: any, idx: number) => (
            <div key={`rec-${idx}`} className="p-4 bg-[#F5F5F7] border-l-4 border-blue-500 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black">{rec.message}</p>
                  {rec.impact && <p className="text-sm text-black/70">Impact: {rec.impact}</p>}
                </div>
                <span className="px-2 py-1 bg-[#F5F5F7] text-[#1A1A1A] rounded text-xs">Recommendation</span>
              </div>
            </div>
          ))}
          {(!riskData?.insights || riskData.insights.length === 0) && (
            <p className="text-gray-500 text-center py-4">No risk data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

