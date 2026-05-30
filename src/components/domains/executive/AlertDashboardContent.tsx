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
    anomalies?: any[]
  }
  const [alertData, setAlertData] = useState<AlertData | null>(null)

  useEffect(() => {
    loadAlerts()
  }, [selectedCountry, persona])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const anomaliesRes = await apiClient.request('/intelligence/anomalies')
      const anomalies = (anomaliesRes?.data as any)?.anomalies || []
      
      // Categorize anomalies by severity
      let critical = 0
      let warning = 0
      let info = 0
      
      anomalies.forEach((anomaly: any) => {
        if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
          critical++
        } else if (anomaly.severity === 'medium' || anomaly.severity === 'warning') {
          warning++
        } else {
          info++
        }
      })
      
      setAlertData({
        critical,
        warning,
        info,
        resolved: 234, // Mock resolved count
        anomalies: anomalies
      })
    } catch (error) {
      console.error('Error loading alerts:', error)
      setAlertData({
        critical: 0,
        warning: 0,
        info: 0,
        resolved: 0
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

  const critical = alertData?.critical || 0
  const warning = alertData?.warning || 0
  const info = alertData?.info || 0
  const resolved = alertData?.resolved || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Alert Dashboard</h3>
        <button className="px-4 py-2 bg-[#6B1F2B] text-white text-xs font-medium rounded-xl hover:bg-[#5a1a24] transition-colors">
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
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M8 2L1.5 13.5h13L8 2z"/><path d="M8 7v3M8 11.5v.5"/></svg>}
        />
        <KPICard
          label="Info"
          value={info}
          icon="ℹ️"
        />
        <KPICard
          label="Resolved"
          value={resolved}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>}
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Recent Alerts</h4>
        <p className="text-black mb-4">Real-time AI-generated alerts and exceptions requiring attention.</p>
        <div className="mt-4 space-y-3">
          {(alertData?.anomalies || []).map((anomaly: any, idx: number) => {
            const severity = anomaly.severity || 'low'
            const bgColor = severity === 'high' || severity === 'critical' ? 'bg-[#F5F5F7]' : severity === 'medium' || severity === 'warning' ? 'bg-[#F5F5F7]' : 'bg-[#F5F5F7]'
            const borderColor = severity === 'high' || severity === 'critical' ? 'border-red-500' : severity === 'medium' || severity === 'warning' ? 'border-yellow-500' : 'border-blue-500'
            const badgeBg = severity === 'high' || severity === 'critical' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : severity === 'medium' || severity === 'warning' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'
            return (
              <div key={idx} className={`p-4 ${bgColor} border-l-4 ${borderColor} rounded`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-black">{anomaly.domain}: {anomaly.message}</p>
                    <p className="text-sm text-black/70">Confidence: {((anomaly.confidence || 0) * 100).toFixed(0)}% — {anomaly.detectedAt ? new Date(anomaly.detectedAt).toLocaleString() : ''}</p>
                  </div>
                  <span className={`px-2 py-1 ${badgeBg} rounded text-xs capitalize`}>{severity}</span>
                </div>
              </div>
            )
          })}
          {(!alertData?.anomalies || alertData.anomalies.length === 0) && (
            <p className="text-gray-500 text-center py-4">No active alerts</p>
          )}
        </div>
      </div>
    </div>
  )
}

