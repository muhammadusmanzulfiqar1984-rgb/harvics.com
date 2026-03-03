'use client'

import React, { useState, useEffect } from 'react'
import OSLayout, { NavigationItem } from '@/components/portals/OSLayout'
import DashboardTemplate from '@/components/portals/templates/DashboardTemplate'
// API calls use fetch directly - apiClient methods for OS domains to be added
import { useCountry } from '@/contexts/CountryContext'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

interface DashboardData {
  imports: {
    pending: number
    inTransit: number
    customs: number
    totalValue: number
  }
  exports: {
    pending: number
    inTransit: number
    customs: number
    totalValue: number
  }
  customs: {
    pending: number
    cleared: number
  }
  documents: {
    pending: number
    expiring: number
  }
}

export default function ImportExportOSPage() {
  const locale = useLocale()
  const t = useTranslations('importExport')
  const { selectedCountry, role } = useCountry()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation structure per V16 spec
  const navigation: NavigationItem[] = [
    {
      label: t('dashboard') || 'Dashboard',
      href: `/${locale}/os/import-export`,
      icon: '📊'
    },
    {
      label: t('importOrders') || 'Import Orders',
      href: `/${locale}/os/import-export/imports`,
      icon: '📥'
    },
    {
      label: t('exportOrders') || 'Export Orders',
      href: `/${locale}/os/import-export/exports`,
      icon: '📤'
    },
    {
      label: t('customs') || 'Customs & Tariffs',
      href: `/${locale}/os/import-export/customs`,
      icon: '🏛️'
    },
    {
      label: t('documents') || 'Trade Documents',
      href: `/${locale}/os/import-export/documents`,
      icon: '📄'
    },
    {
      label: t('countryRules') || 'Country Rules',
      href: `/${locale}/os/import-export/rules`,
      icon: '🌍'
    },
    {
      label: t('compliance') || 'Compliance',
      href: `/${locale}/os/import-export/compliance`,
      icon: '✅'
    }
  ]

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

      const response = await fetch('/api/os-domains/import-export/dashboard', { headers })
      const result = await response.json()
      
      if (response.ok && result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Error fetching import/export dashboard:', err)
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Prepare KPI cards
  const kpiCards = data ? [
    {
      title: 'Import Orders',
      value: data.imports.pending + data.imports.inTransit,
      icon: '📥',
      color: 'blue' as const,
      subtitle: `${data.imports.pending} pending, ${data.imports.inTransit} in transit`
    },
    {
      title: 'Export Orders',
      value: data.exports.pending + data.exports.inTransit,
      icon: '📤',
      color: 'green' as const,
      subtitle: `${data.exports.pending} pending, ${data.exports.inTransit} in transit`
    },
    {
      title: 'Customs',
      value: data.customs.pending,
      icon: '🏛️',
      color: 'yellow' as const,
      subtitle: `${data.customs.cleared} cleared`
    },
    {
      title: 'Documents',
      value: data.documents.pending,
      icon: '📄',
      color: 'purple' as const,
      subtitle: `${data.documents.expiring} expiring soon`
    }
  ] : []

  return (
    <OSLayout
      module="import-export"
      title={t('title') || 'Import/Export OS'}
      sidebarTitle={t('sidebarTitle') || 'Import/Export OS'}
      navigation={navigation}
      allowedRoles={['import_export_admin', 'admin', 'super_admin', 'hq']}
    >
      <DashboardTemplate
        title={t('dashboard') || 'Import/Export OS Dashboard'}
        subtitle="Monitor import and export operations, customs, and trade documentation"
        kpiCards={kpiCards}
        loading={loading}
        error={error}
        onRetry={fetchDashboard}
        actions={
          <>
            <Link
              href={`/${locale}/os/import-export/imports`}
              className="px-4 py-2 bg-white text-white rounded-md hover:bg-white transition-colors font-medium"
            >
              Import Orders
            </Link>
            <Link
              href={`/${locale}/os/import-export/exports`}
              className="px-4 py-2 bg-white text-[#C3A35E]/90 border border-[#6B1F2B] rounded-md hover:bg-white transition-colors font-medium"
            >
              Export Orders
            </Link>
          </>
        }
      />
    </OSLayout>
  )
}

