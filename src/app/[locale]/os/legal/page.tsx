'use client'

import React, { useState, useEffect } from 'react'
import DashboardTemplate from '@/components/portals/templates/DashboardTemplate'
import { useCountry } from '@/contexts/CountryContext'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'

interface DashboardStats {
  ipr: {
    total: number
    pending: number
    expiring: any[]
  }
  counterfeit: {
    totalCases: number
    openCases: number
  }
  compliance: {
    activeIssues: any[]
    complianceScore: number
  }
  contracts: {
    total: number
    expiring: any[]
  }
  litigation: {
    active: any[]
    closed: any[]
  }
}

export default function LegalOSPage() {
  const locale = useLocale()
  const t = useTranslations('legal')
  const { selectedCountry, role } = useCountry()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation is handled by layout.tsx

  useEffect(() => {
    fetchDashboard()
  }, [selectedCountry])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/os-domains/legal/dashboard', { headers })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to load dashboard data')
      } else {
        setStats(result.data)
      }
    } catch (err) {
      console.error('Error fetching legal dashboard:', err)
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Prepare KPI cards
  const kpiCards = stats ? [
    {
      title: 'IPR Management',
      value: stats.ipr.total,
      icon: '™️',
      color: 'default' as const,
      subtitle: `${stats.ipr.pending} pending, ${stats.ipr.expiring.length} expiring soon`
    },
    {
      title: 'Counterfeit Cases',
      value: stats.counterfeit.totalCases,
      icon: '🚫',
      color: 'red' as const,
      subtitle: `${stats.counterfeit.openCases} open cases`
    },
    {
      title: 'Compliance Score',
      value: `${stats.compliance.complianceScore}%`,
      icon: '✅',
      color: (stats.compliance.complianceScore >= 80 ? 'green' : stats.compliance.complianceScore >= 60 ? 'yellow' : 'red') as 'green' | 'yellow' | 'red',
      subtitle: `${stats.compliance.activeIssues.length} active issues`
    },
    {
      title: 'Contracts & Litigation',
      value: stats.contracts.total,
      icon: '📄',
      color: 'blue' as const,
      subtitle: `${stats.contracts.expiring.length} expiring, ${stats.litigation.active.length} active cases`
    }
  ] : []

  return (
    <DashboardLayout
      portal="company"
      pageTitle="Legal OS"
    >
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1F2B]"></div>
          <p className="mt-4 text-[#C3A35E]/90">Loading...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={fetchDashboard}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#C3A35E]/90">{card.title}</h3>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className={`text-3xl font-bold mb-2 ${
                card.color === 'red' ? 'text-red-600' :
                card.color === 'green' ? 'text-green-600' :
                card.color === 'yellow' ? 'text-white' :
                card.color === 'blue' ? 'text-blue-600' :
                'text-[#C3A35E]/90'
              }`}>
                {card.value}
              </div>
              <p className="text-sm text-[#C3A35E]/90">{card.subtitle}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
