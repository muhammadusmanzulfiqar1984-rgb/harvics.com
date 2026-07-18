'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import KPICard from '@/components/shared/KPICard'
import LineChartCard from '@/components/charts/LineChartCard'
import BarChartCard from '@/components/charts/BarChartCard'
import AIInsightsPanel from '@/components/shared/AIInsightsPanel'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import DomainGrid, { DomainItem } from '@/components/shared/DomainGrid'
import DomainQuickNav from '@/components/shared/DomainQuickNav'
import DashboardLayout from '@/components/layouts/DashboardLayout'

interface DashboardData {
  kpis: {
    totalRevenue: number
    totalOrders: number
    regionsCovered: number
    departments: number
    activeDistributors: number
    avgFillRate: number
    inventoryValue: number
    logisticsEfficiency: number
    cashFlowStatus: string
    complianceScore: number
  }
  trendData: Array<{ date: string; revenue: number; orders: number }>
}

export default function V16CompanyDashboard() {
  const locale = useLocale()
  const router = useRouter()
  const { selectedCountry } = useCountry()
  
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTier, setActiveTier] = useState<'tier0' | 'tier1' | null>(null)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [chartView, setChartView] = useState<'revenue' | 'orders'>('revenue')
  const [filters, setFilters] = useState({
    scope: 'global' as const,
    period: '30d' as const,
    currency: 'USD' as const
  })

  // Demo data fallback
  const getDemoData = (): DashboardData => ({
    kpis: {
      totalRevenue: 4523000000,
      totalOrders: 15678,
      regionsCovered: 45,
      departments: 89,
      activeDistributors: 234,
      avgFillRate: 96.5,
      inventoryValue: 125000000,
      logisticsEfficiency: 94.2,
      cashFlowStatus: 'Positive',
      complianceScore: 98.5
    },
    trendData: [
      { date: '2024-01-01', revenue: 120000000, orders: 450 },
      { date: '2024-01-08', revenue: 135000000, orders: 520 },
      { date: '2024-01-15', revenue: 142000000, orders: 580 },
      { date: '2024-01-22', revenue: 155000000, orders: 620 },
      { date: '2024-01-29', revenue: 168000000, orders: 680 }
    ]
  })

  useEffect(() => {
    loadDashboardData()
  }, [selectedCountry, filters])

  const loadDashboardData = async () => {
    setLoading(true)
    
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false)
      // Use demo data if timeout
      setData(getDemoData())
    }, 5000)

    try {
      const response = await apiClient.getCompanyDashboard({
        scope: filters.scope,
        country: selectedCountry || 'global',
        period: filters.period === '30d' ? 'last30days' : filters.period === '7d' ? 'last7days' : filters.period === '90d' ? 'last90days' : 'last30days',
        currency: filters.currency
      })

      clearTimeout(timeoutId)

      if ((response as any).data?.data || (response as any).data) {
        const apiData = (response as any).data?.data || (response as any).data
        setData({
          kpis: {
            totalRevenue: apiData.kpis?.totalRevenue || 4523000000,
            totalOrders: apiData.kpis?.totalOrders || 15678,
            regionsCovered: apiData.kpis?.activeCountries || 45,
            departments: apiData.kpis?.departments || 89,
            activeDistributors: apiData.kpis?.activeDistributors || 234,
            avgFillRate: apiData.kpis?.avgFillRate || 96.5,
            inventoryValue: apiData.kpis?.inventoryValue || 125000000,
            logisticsEfficiency: apiData.kpis?.logisticsEfficiency || 94.2,
            cashFlowStatus: apiData.kpis?.cashFlowStatus || 'Positive',
            complianceScore: apiData.kpis?.complianceScore || 98.5
          },
          trendData: apiData.trendData || getDemoData().trendData
        })
      } else {
        // No data from API, use demo data
        setData(getDemoData())
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      clearTimeout(timeoutId)
      // Use demo data on error
      setData(getDemoData())
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters({
      scope: newFilters.scope || filters.scope,
      period: newFilters.period || filters.period,
      currency: newFilters.currency || filters.currency
    })
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
    return `$${amount.toFixed(0)}`
  }

  // Tier-0 Foundational Engines
  const tier0Engines = [
    { id: 'identity', label: 'Identity & Access Engine', description: 'User management, roles, permissions, SSO', href: `/${locale}/os/identity`, icon: '🔐' },
    { id: 'localization', label: 'Localization Engine', description: '38 languages, 8-level geographic hierarchy', href: `/${locale}/os/localization`, icon: '🌍' },
    { id: 'geo', label: 'Geo Engine', description: 'Territory maps, GPS trails, heatmaps', href: `/${locale}/os/geo`, icon: '📍' }
  ]

  // Tier-1 Core OS Domains
  const tier1Domains = [
    { id: 'market-distribution', label: 'Market & Distribution OS', description: 'Distributor management, territories, pricing', href: `/${locale}/os/market-distribution`, icon: '📦' },
    { id: 'supplier-procurement', label: 'Supplier & Procurement OS', description: 'Supplier master, RFQ, GRN, performance', href: `/${locale}/os/supplier-procurement`, icon: '🏭' },
    { id: 'orders-sales', label: 'Orders / Sales OS', description: 'Order management, sales workflows', href: `/${locale}/os/orders-sales`, icon: '📋' },
    { id: 'inventory', label: 'Inventory OS', description: 'Warehouse, SKU tracking, replenishment', href: `/${locale}/os/inventory`, icon: '📦' },
    { id: 'finance', label: 'Finance OS', description: 'AR, AP, GL, Tax, Cash management', href: `/${locale}/os/finance`, icon: '💰' },
    { id: 'crm', label: 'Customer & Brand CRM OS', description: 'Retailer master, tickets, campaigns', href: `/${locale}/os/crm`, icon: '👥' },
    { id: 'hr', label: 'HR & Talent OS', description: 'Workforce, attendance, KPIs, payroll', href: `/${locale}/os/hr`, icon: '👔' },
    { id: 'logistics', label: 'Logistics & Transport OS', description: 'Fleet, routes, GPS tracking, delivery', href: `/${locale}/os/logistics`, icon: '🚚' },
    { id: 'executive', label: 'Executive Control Tower', description: 'P&L, KPIs, risk alerts, dashboards', href: `/${locale}/os/executive`, icon: '🎯' },
    { id: 'legal', label: 'Legal / IPR & Compliance OS', description: 'IPR, counterfeit, compliance, contracts', href: `/${locale}/os/legal`, icon: '⚖️' },
    { id: 'competitor', label: 'Competitor Intelligence OS', description: 'Product tracking, price intelligence', href: `/${locale}/os/competitor`, icon: '🔍' },
    { id: 'import-export', label: 'Import / Export OS', description: 'Import/export orders, customs, trade docs', href: `/${locale}/os/import-export`, icon: '🌐' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvics-gold mx-auto mb-4"></div>
          <p className="text-harvics-burgundy">Loading Harvics Global OS...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout portal="company" pageTitle="Company Dashboard">
      <GlobalFilters onFilterChange={handleFilterChange} defaultFilters={filters} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <KPICard label="Total Revenue" value={formatCurrency(data?.kpis.totalRevenue || 0)} change={{ value: 5.2, trend: 'up' }} />
        <KPICard label="Total Orders" value={data?.kpis.totalOrders.toLocaleString() || '0'} change={{ value: 8.1, trend: 'up' }} />
        <KPICard label="Regions Covered" value={data?.kpis.regionsCovered.toString() || '0'} />
        <KPICard label="Active Distributors" value={data?.kpis.activeDistributors.toLocaleString() || '0'} />
        <KPICard label="Compliance Score" value={`${data?.kpis.complianceScore || 0}%`} change={{ value: 1.5, trend: 'up' }} />
      </div>

      <div className="mb-6">
        <LineChartCard 
          title="Revenue & Orders Trend" 
          data={data?.trendData || []}
          dataKeys={[chartView]}
        />
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setActiveTier('tier0')}
            className={`px-4 py-2 text-sm font-medium ${activeTier === 'tier0' ? 'bg-harvics-burgundy text-white' : 'bg-white text-harvics-burgundy'} border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-harvics-gold`}
          >
            Tier-0 Foundational Engines
          </button>
          <button
            onClick={() => setActiveTier('tier1')}
            className={`px-4 py-2 text-sm font-medium ${activeTier === 'tier1' ? 'bg-harvics-burgundy text-white' : 'bg-white text-harvics-burgundy'} border-t border-b border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-harvics-gold`}
          >
            Tier-1 Core OS Domains
          </button>
          <button
            onClick={() => setActiveTier(null)}
            className={`px-4 py-2 text-sm font-medium ${activeTier === null ? 'bg-harvics-burgundy text-white' : 'bg-white text-harvics-burgundy'} border border-gray-200 rounded-r-md hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-harvics-gold`}
          >
            All Tiers
          </button>
        </div>
      </div>

      {(activeTier === null || activeTier === 'tier0') && (
        <SectionCard title="Tier-0 Foundational Engines">
          <DomainGrid domains={tier0Engines} />
        </SectionCard>
      )}

      {(activeTier === null || activeTier === 'tier1') && (
        <SectionCard title="Tier-1 Core OS Domains" className="mt-6">
          <DomainGrid domains={tier1Domains} />
        </SectionCard>
      )}

      <AIInsightsPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} insights={[]} />
    </DashboardLayout>
  )
}
