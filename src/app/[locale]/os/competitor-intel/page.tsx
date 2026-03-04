'use client'

import React, { useState, useEffect } from 'react'
import OSLayout, { NavigationItem } from '@/components/portals/OSLayout'
import DashboardTemplate from '@/components/portals/templates/DashboardTemplate'
// API calls use fetch directly - apiClient methods for OS domains to be added
import { useCountry } from '@/contexts/CountryContext'
import { useLocale, useTranslations } from 'next-intl'

interface CompetitorDashboard {
  totalProducts: number
  totalCompetitors: number
  priceAlerts: number
  marketShareData: any
}

export default function CompetitorIntelOSPage() {
  const locale = useLocale()
  const t = useTranslations('competitor')
  const { selectedCountry, role } = useCountry()
  const [dashboard, setDashboard] = useState<CompetitorDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation structure per V16 spec
  const navigation: NavigationItem[] = [
    {
      label: t('dashboard') || 'Dashboard',
      href: `/${locale}/os/competitor-intel`,
      icon: '📊'
    },
    {
      label: t('products') || 'Product Tracking',
      href: `/${locale}/os/competitor-intel/products`,
      icon: '📦'
    },
    {
      label: t('pricing') || 'Price Intelligence',
      href: `/${locale}/os/competitor-intel/pricing`,
      icon: '💰'
    },
    {
      label: t('market') || 'Market Analysis',
      href: `/${locale}/os/competitor-intel/market`,
      icon: '📈'
    },
    {
      label: t('profiles') || 'Competitor Profiles',
      href: `/${locale}/os/competitor-intel/profiles`,
      icon: '🏢'
    },
    {
      label: t('reports') || 'Reports',
      href: `/${locale}/os/competitor-intel/reports`,
      icon: '📄'
    }
  ]

  useEffect(() => {
    loadDashboard()
  }, [selectedCountry])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/os-domains/competitor-intel/dashboard', { headers })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to load competitor dashboard')
      } else {
        setDashboard(result.data)
      }
    } catch (err) {
      console.error('Error loading competitor dashboard:', err)
      setError('Failed to load competitor dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Prepare KPI cards
  const kpiCards = dashboard ? [
    {
      title: 'Tracked Products',
      value: dashboard.totalProducts || 0,
      icon: '📦',
      color: 'default' as const
    },
    {
      title: 'Competitors',
      value: dashboard.totalCompetitors || 0,
      icon: '🏢',
      color: 'blue' as const
    },
    {
      title: 'Price Alerts',
      value: dashboard.priceAlerts || 0,
      icon: '⚠️',
      color: 'yellow' as const,
      subtitle: 'Price changes detected'
    }
  ] : []

  return (
    <OSLayout
      module="competitor-intel"
      title={t('title') || 'Competitor Intelligence OS'}
      sidebarTitle={t('sidebarTitle') || 'Competitor Intel'}
      navigation={navigation}
      allowedRoles={['competitor_admin', 'admin', 'super_admin', 'hq', 'country_manager']}
    >
      <DashboardTemplate
        title={t('dashboard') || 'Competitor Intelligence Dashboard'}
        subtitle="Market share, pricing, and trend analysis"
        kpiCards={kpiCards}
        loading={loading}
        error={error}
        onRetry={loadDashboard}
        charts={
          <>
            <div className="bg-white shadow p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Market Share</h2>
              {dashboard?.marketShareData ? (
                <div className="text-[#C3A35E]/90">Market share analysis data available</div>
              ) : (
                <p className="text-[#C3A35E]/90">Market share analysis coming soon</p>
              )}
            </div>
            <div className="bg-white shadow p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Pricing Analysis</h2>
              <p className="text-[#C3A35E]/90">Pricing analysis coming soon</p>
            </div>
          </>
        }
      />
    </OSLayout>
  )
}

