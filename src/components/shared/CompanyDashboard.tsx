'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import MarketHeatmap from './MarketHeatmap'
import StrategyValidator from './StrategyValidator'

interface FilterState {
  scope: 'global' | 'region' | 'country' | 'city'
  country: string
  period: 'last30days' | 'lastquarter' | 'ytd' | 'custom'
  currency: string
}

interface KPIData {
  totalRevenue: number
  totalOrders: number
  activeDistributors: number
  activeCountries: number
}

interface TrendData {
  date: string
  revenue: number
  orders: number
}

interface AIInsight {
  id: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

interface MarketData {
  country: string
  revenue: number
  change: number
}

interface DistributorData {
  name: string
  country: string
  revenue: number
  onTimePercentage: number
}

interface RiskAlert {
  id: string
  domain: string
  title: string
  severity: 'critical' | 'warning' | 'info'
  date: string
}

export default function CompanyDashboard() {
  const locale = useLocale()
  const router = useRouter()
  const { selectedCountry, countryData } = useCountry()
  
  // Get currency from countryData or default to USD
  const defaultCurrency = countryData?.currency?.code || 'USD'
  
  const [filters, setFilters] = useState<FilterState>({
    scope: 'global',
    country: selectedCountry || 'global',
    period: 'last30days',
    currency: defaultCurrency
  })
  
  // Update currency when countryData changes
  useEffect(() => {
    if (countryData?.currency?.code) {
      setFilters(prev => ({
        ...prev,
        currency: countryData.currency!.code,
        country: selectedCountry || prev.country
      }))
    }
  }, [countryData?.currency?.code, selectedCountry])
  
  const [kpiData, setKpiData] = useState<KPIData>({
    totalRevenue: 4523000000,
    totalOrders: 15678,
    activeDistributors: 234,
    activeCountries: 45
  })
  
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [topMarkets, setTopMarkets] = useState<MarketData[]>([])
  const [topDistributors, setTopDistributors] = useState<DistributorData[]>([])
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [chartView, setChartView] = useState<'revenue' | 'orders'>('revenue')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Format numbers with K/M abbreviations
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Format currency based on selected currency
  const formatCurrency = (amount: number): string => {
    // Use currency symbol from countryData if available, otherwise use fallback
    const currencySymbol = countryData?.currency?.symbol || 
      (filters.currency === 'USD' ? '$' :
       filters.currency === 'EUR' ? '€' :
       filters.currency === 'PKR' ? 'Rs' :
       filters.currency === 'AED' ? 'د.إ' :
       filters.currency === 'GBP' ? '£' : '$')
    const symbol = currencySymbol
    
    // For chart formatting, use abbreviated format
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`
    }
    return `${symbol}${amount.toFixed(0)}`
  }

  // Format currency for display (not abbreviated)
  const formatCurrencyFull = (amount: number): string => {
    // Use currency symbol from countryData if available, otherwise use fallback
    const currencySymbol = countryData?.currency?.symbol || 
      (filters.currency === 'USD' ? '$' :
       filters.currency === 'EUR' ? '€' :
       filters.currency === 'PKR' ? 'Rs' :
       filters.currency === 'AED' ? 'د.إ' :
       filters.currency === 'GBP' ? '£' : '$')
    const symbol = currencySymbol
    return `${symbol}${formatNumber(amount)}`
  }

  // Load dashboard data based on filters
  useEffect(() => {
    loadDashboardData()
  }, [filters])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Call real backend API
      const response = await apiClient.getCompanyDashboard(filters)
      
      if (response.error) {
        console.error('Error loading dashboard:', response.error)
        // Fall back to mock data if API fails
        loadMockData()
        return
      }

      const data = (response as any).data?.data || (response as any).data || response.data
      
      if (data) {
        // Update KPIs
        setKpiData({
          totalRevenue: data.kpis?.totalRevenue || 0,
          totalOrders: data.kpis?.totalOrders || 0,
          activeDistributors: data.kpis?.activeDistributors || 0,
          activeCountries: data.kpis?.activeCountries || 0
        })

        // Update trend data
        if (data.trendData && Array.isArray(data.trendData)) {
          setTrendData(data.trendData)
        }

        // Update AI insights
        if (data.aiInsights && Array.isArray(data.aiInsights)) {
          setAiInsights(data.aiInsights)
        }

        // Update top markets
        if (data.topMarkets && Array.isArray(data.topMarkets)) {
          setTopMarkets(data.topMarkets)
        }

        // Update top distributors
        if (data.topDistributors && Array.isArray(data.topDistributors)) {
          setTopDistributors(data.topDistributors)
        }

        // Update risk alerts
        if (data.riskAlerts && Array.isArray(data.riskAlerts)) {
          setRiskAlerts(data.riskAlerts)
        }
      } else {
        // No data returned, use mock data
        loadMockData()
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Fall back to mock data on error
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  // Fallback mock data loader
  const loadMockData = () => {
    // Generate trend data based on period
    const days = filters.period === 'last30days' ? 30 : filters.period === 'lastquarter' ? 90 : 365
    const trend: TrendData[] = []
    const baseRevenue = 4500000
    const baseOrders = 500
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Generate realistic trend data with slight upward trend
      const dayFactor = (days - i) / days
      const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
      const trendFactor = 1 + (dayFactor * 0.1) // 10% growth over period
      
      trend.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(baseRevenue * trendFactor * randomFactor),
        orders: Math.round(baseOrders * trendFactor * randomFactor)
      })
    }
    setTrendData(trend)

    // Mock AI insights
    setAiInsights([
      {
        id: '1',
        title: 'Revenue Growth Trend',
        description: 'Revenue increased 12.5% compared to previous period',
        category: 'finance',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Inventory Optimization',
        description: '3 warehouses showing low stock levels - recommend replenishment',
        category: 'inventory',
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Top Market Performance',
        description: 'UAE and Pakistan markets showing strongest growth',
        category: 'markets',
        priority: 'medium'
      }
    ])

    // Mock top markets
    setTopMarkets([
      { country: 'United States', revenue: 1250000000, change: 12.5 },
      { country: 'United Arab Emirates', revenue: 850000000, change: 18.2 },
      { country: 'Pakistan', revenue: 650000000, change: 15.7 },
      { country: 'United Kingdom', revenue: 420000000, change: 8.3 },
      { country: 'Saudi Arabia', revenue: 380000000, change: 10.1 }
    ])

    // Mock top distributors
    setTopDistributors([
      { name: 'Global Distribution Network', country: 'US', revenue: 45000000, onTimePercentage: 98 },
      { name: 'Middle East Distributors', country: 'AE', revenue: 32000000, onTimePercentage: 95 },
      { name: 'Pakistani Distributors Ltd', country: 'PK', revenue: 28000000, onTimePercentage: 97 },
      { name: 'UK Distribution Partners', country: 'UK', revenue: 25000000, onTimePercentage: 96 },
      { name: 'Gulf Distributors Group', country: 'SA', revenue: 22000000, onTimePercentage: 94 }
    ])

    // Mock risk alerts
    setRiskAlerts([
      { id: '1', domain: 'Finance', title: '3 invoices overdue > 60 days', severity: 'critical', date: '2024-01-20' },
      { id: '2', domain: 'Inventory', title: 'Low stock alert: 5 SKUs below reorder point', severity: 'warning', date: '2024-01-21' },
      { id: '3', domain: 'Legal/IPR', title: '2 IPR renewals due in 30 days', severity: 'info', date: '2024-01-22' },
      { id: '4', domain: 'Logistics', title: 'Route delay: 2 shipments delayed', severity: 'warning', date: '2024-01-23' }
    ])
  }

  const handleKPIClick = (kpiTitle: string) => {
    // Map KPI titles to OS domains
    const kpiMap: Record<string, string> = {
      'Total Revenue': 'finance',
      'Total Orders': 'orders-sales',
      'Active Distributors': 'crm',
      'Active Countries': 'market-distribution'
    }
    
    const domain = kpiMap[kpiTitle]
    if (domain) {
      router.push(`/${locale}/os/${domain}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Beautiful Sleek Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-gradient-to-b from-[#6B1F2B] via-[#5c000c] to-[#6B1F2B] border-r border-[#C3A35E]/30 shadow-2xl flex-shrink-0 flex flex-col z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#C3A35E]/30 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 font-serif">Harvics OS</h2>
            <p className="text-xs text-[#C3A35E]">Command Center</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* OS NAVIGATION Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-1 h-5 bg-[#C3A35E] rounded-full"></div>
              <h3 className="text-xs font-semibold text-[#C3A35E] uppercase tracking-wider">OS NAVIGATION</h3>
            </div>
            <div className="space-y-1">
              <Link
                href={`/${locale}/dashboard/company`}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group border-l-2 border-transparent hover:border-[#C3A35E]"
              >
                <span className="text-lg">🏢</span>
                <span className="flex-1">Company Portal</span>
              </Link>
            </div>
          </div>

          {/* TIER 0: Foundational Engines - Purple Theme */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">TIER 0</h3>
            </div>
            <div className="space-y-1">
              {[
                { id: 'identity', label: 'Identity & Access', icon: '🔐', color: 'purple' },
                { id: 'localization', label: 'Localization', icon: '🌍', color: 'purple' },
                { id: 'geo', label: 'Geo Engine', icon: '📍', color: 'purple' }
              ].map((item) => (
                <Link
                  key={item.id}
                  href={`/${locale}/os/${item.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all duration-200 group border-l-2 border-transparent hover:border-purple-500"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* TIER 1: OS Domains Section - Blue Theme */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
              <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">TIER 1</h3>
            </div>
            <div className="space-y-1">
              {[
                { id: 'orders-sales', label: 'Orders / Sales', icon: '📋', color: 'blue' },
                { id: 'inventory', label: 'Inventory', icon: '📦', color: 'blue' },
                { id: 'finance', label: 'Finance', icon: '💰', color: 'blue' },
                { id: 'logistics', label: 'Logistics', icon: '🚚', color: 'blue' },
                { id: 'hr', label: 'HR & Talent', icon: '👔', color: 'blue' },
                { id: 'executive', label: 'Executive', icon: '🎯', color: 'blue' },
                { id: 'crm', label: 'CRM', icon: '👥', color: 'blue' },
                { id: 'market-distribution', label: 'Market & Distribution', icon: '📦', color: 'blue' },
                { id: 'supplier-procurement', label: 'Supplier & Procurement', icon: '🏭', color: 'blue' },
                { id: 'legal', label: 'Legal / IPR', icon: '⚖️', color: 'blue' },
                { id: 'import-export', label: 'Import / Export', icon: '🌐', color: 'blue' },
                { id: 'competitor', label: 'Competitor Intel', icon: '🔍', color: 'blue' }
              ].map((item) => (
                <Link
                  key={item.id}
                  href={`/${locale}/os/${item.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-blue-500/20 rounded-lg transition-all duration-200 group border-l-2 border-transparent hover:border-blue-500"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* REPORTS Section - Always Vertical */}
          <div>
            <div className="mb-3 px-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📊</span>
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">REPORTS</h3>
              </div>
              <p className="text-xs text-gray-500 ml-7">Analytics & exports</p>
            </div>
            <div className="space-y-1.5">
              <Link
                href={`/${locale}/reports/dashboard`}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-all duration-200 group border-l-2 border-transparent hover:border-indigo-500"
              >
                <span className="text-lg">📈</span>
                <span className="flex-1">Dashboard Reports</span>
              </Link>
              <Link
                href={`/${locale}/reports/analytics`}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-all duration-200 group border-l-2 border-transparent hover:border-indigo-500"
              >
                <span className="text-lg">📊</span>
                <span className="flex-1">Analytics</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#C3A35E]/30">
          <div className="bg-gradient-to-r from-[#C3A35E]/10 to-transparent rounded-lg p-3 border border-[#C3A35E]/20">
            <p className="text-xs text-[#C3A35E] mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-white font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
        {/* Page Title Block */}
        <div className="bg-white border-b border-[#C3A35E]/30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 text-[#6B1F2B] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-[#6B1F2B] tracking-tight mb-1 font-serif">
                    Company Dashboard
                  </h1>
                  <p className="text-base text-[#6B1F2B]/70">
                    Harvics Global OS – HQ Command Center
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-medium text-[#6B1F2B] bg-[#C3A35E]/10 rounded-full border border-[#C3A35E]/30">
                Tier 0–1 Overview
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Global Filter Bar */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#C3A35E]/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Scope Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-[#6B1F2B]">Scope:</label>
              <select
                value={filters.scope}
                onChange={(e) => setFilters({ ...filters, scope: e.target.value as any })}
                className="px-3 py-2 text-sm border border-[#6B1F2B]/20 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent"
              >
                <option value="global">Global</option>
                <option value="region">Region</option>
                <option value="country">Country</option>
                <option value="city">City</option>
              </select>
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-[#6B1F2B]">Country:</label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="px-3 py-2 text-sm border border-[#6B1F2B]/20 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent"
              >
                <option value="global">Global</option>
                <option value="US">United States</option>
                <option value="AE">United Arab Emirates</option>
                <option value="PK">Pakistan</option>
                <option value="UK">United Kingdom</option>
                <option value="SA">Saudi Arabia</option>
              </select>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-[#6B1F2B]">Period:</label>
              <select
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
                className="px-3 py-2 text-sm border border-[#6B1F2B]/20 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent"
              >
                <option value="last30days">Last 30 days</option>
                <option value="lastquarter">Last quarter</option>
                <option value="ytd">Year to Date</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-[#6B1F2B]">Currency:</label>
              <select
                value={filters.currency}
                onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                className="px-3 py-2 text-sm border border-[#6B1F2B]/20 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="PKR">PKR</option>
                <option value="AED">AED</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </div>
      </div>

        {/* Quick Access Bar - Tier 1 Deep Links */}
        <div className="bg-gradient-to-r from-[#6B1F2B]/10 via-[#6B1F2B]/5 to-white border-b-2 border-[#C3A35E] shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-[#6B1F2B] rounded-full"></div>
                <div>
                  <span className="text-lg">👥</span>
                  <span className="text-sm font-bold text-[#6B1F2B] ml-2 font-serif">Quick Access:</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/${locale}/os/crm`}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#6B1F2B] border-2 border-[#6B1F2B] rounded-lg hover:bg-[#5c000c] hover:border-[#5c000c] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  CRM Dashboard
                </Link>
                <Link
                  href={`/${locale}/os/crm?module=customer-360`}
                  className="px-4 py-2 text-sm font-medium text-[#6B1F2B] bg-white border-2 border-[#C3A35E]/50 rounded-lg hover:bg-[#C3A35E]/10 hover:border-[#C3A35E] transition-all duration-300"
                >
                  Customers
                </Link>
                <Link
                  href={`/${locale}/os/orders-sales`}
                  className="px-4 py-2 text-sm font-medium text-[#6B1F2B] bg-white border-2 border-[#C3A35E]/50 rounded-lg hover:bg-[#C3A35E]/10 hover:border-[#C3A35E] transition-all duration-300"
                >
                  Orders
                </Link>
                <Link
                  href={`/${locale}/os/finance`}
                  className="px-4 py-2 text-sm font-medium text-[#6B1F2B] bg-white border-2 border-[#C3A35E]/50 rounded-lg hover:bg-[#C3A35E]/10 hover:border-[#C3A35E] transition-all duration-300"
                >
                  Finance
                </Link>
                <Link
                  href={`/${locale}/os/inventory`}
                  className="px-4 py-2 text-sm font-medium text-[#6B1F2B] bg-white border-2 border-[#C3A35E]/50 rounded-lg hover:bg-[#C3A35E]/10 hover:border-[#C3A35E] transition-all duration-300"
                >
                  Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Section 1: Intelligence & KPIs */}
        <section className="space-y-6">
          {/* Market Heatmap - Full Width */}
          <div className="animate-fadeInUp">
            <MarketHeatmap />
          </div>

          {/* Strategy Validator - Real-Time AI Proposals */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.05s' }}>
            <StrategyValidator />
          </div>

          {/* KPI Cards */}
          <div className="bg-white rounded-lg p-6 shadow-sm animate-fadeInUp border border-[#C3A35E]/30" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-[#6B1F2B] rounded-full"></div>
                <div>
                  <h2 className="text-xl font-bold text-[#6B1F2B] font-serif">Key Performance Indicators</h2>
                  <span className="text-xs text-[#6B1F2B]/60">Real-time metrics</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleKPIClick('revenue')}
            className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 sm:p-6 hover:shadow-xl hover:border-[#C3A35E] hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between min-h-[140px] w-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#C3A35E]/0 to-[#C3A35E]/0 group-hover:from-[#C3A35E]/5 group-hover:to-[#C3A35E]/10 transition-all duration-300"></div>
            <div className="flex items-start justify-between mb-3 gap-2 min-h-[28px] relative z-10">
              <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">💰</span>
              <span className="text-[10px] sm:text-xs text-[#6B1F2B]/70 flex-shrink-0 text-right leading-tight">For selected period</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-2 relative z-10">
              <div className="text-[10px] sm:text-xs font-bold text-[#6B1F2B] uppercase tracking-wider break-words line-clamp-2" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxHeight: '2.5rem',
                lineHeight: '1.25rem',
                wordBreak: 'break-word'
              }}>
                Total Revenue
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#6B1F2B] leading-tight break-words font-serif">{formatCurrencyFull(kpiData.totalRevenue)}</div>
              <div className="mt-2 text-xs text-green-600 whitespace-nowrap flex items-center gap-1">
                <span className="inline-block">↑</span>
                <span>+12.5% vs previous</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleKPIClick('orders')}
            className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 sm:p-6 hover:shadow-xl hover:border-[#C3A35E] hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between min-h-[140px] w-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#C3A35E]/0 to-[#C3A35E]/0 group-hover:from-[#C3A35E]/5 group-hover:to-[#C3A35E]/10 transition-all duration-300"></div>
            <div className="flex items-start justify-between mb-3 gap-2 min-h-[28px] relative z-10">
              <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">📦</span>
              <span className="text-[10px] sm:text-xs text-[#6B1F2B]/70 flex-shrink-0 text-right leading-tight">For selected period</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-2 relative z-10">
              <div className="text-[10px] sm:text-xs font-bold text-[#6B1F2B] uppercase tracking-wider break-words line-clamp-2" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxHeight: '2.5rem',
                lineHeight: '1.25rem',
                wordBreak: 'break-word'
              }}>
                Total Orders
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#6B1F2B] leading-tight break-words font-serif">{kpiData.totalOrders.toLocaleString()}</div>
              <div className="mt-2 text-xs text-green-600 whitespace-nowrap flex items-center gap-1">
                <span className="inline-block">↑</span>
                <span>+8.3% vs previous</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleKPIClick('distributors')}
            className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 sm:p-6 hover:shadow-xl hover:border-[#C3A35E] hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between min-h-[140px] w-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#C3A35E]/0 to-[#C3A35E]/0 group-hover:from-[#C3A35E]/5 group-hover:to-[#C3A35E]/10 transition-all duration-300"></div>
            <div className="flex items-start justify-between mb-3 gap-2 min-h-[28px] relative z-10">
              <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">🏢</span>
              <span className="text-[10px] sm:text-xs text-[#6B1F2B]/70 flex-shrink-0 text-right leading-tight">Active</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-2 relative z-10">
              <div className="text-[10px] sm:text-xs font-bold text-[#6B1F2B] uppercase tracking-wider break-words line-clamp-2" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxHeight: '2.5rem',
                lineHeight: '1.25rem',
                wordBreak: 'break-word'
              }}>
                Active Distributors
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#6B1F2B] leading-tight break-words font-serif">{kpiData.activeDistributors}</div>
              <div className="mt-2 text-xs text-[#6B1F2B]/70 break-words">Across all regions</div>
            </div>
          </button>

          <button
            onClick={() => handleKPIClick('countries')}
            className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 sm:p-6 hover:shadow-xl hover:border-[#C3A35E] hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between min-h-[140px] w-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#C3A35E]/0 to-[#C3A35E]/0 group-hover:from-[#C3A35E]/5 group-hover:to-[#C3A35E]/10 transition-all duration-300"></div>
            <div className="flex items-start justify-between mb-3 gap-2 min-h-[28px] relative z-10">
              <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">🌍</span>
              <span className="text-[10px] sm:text-xs text-[#6B1F2B]/70 flex-shrink-0 text-right leading-tight">Active</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-2 relative z-10">
              <div className="text-[10px] sm:text-xs font-bold text-[#6B1F2B] uppercase tracking-wider break-words line-clamp-2" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxHeight: '2.5rem',
                lineHeight: '1.25rem',
                wordBreak: 'break-word'
              }}>
                Active Countries/Regions
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#6B1F2B] leading-tight break-words font-serif">{kpiData.activeCountries}</div>
              <div className="mt-2 text-xs text-[#6B1F2B]/70 break-words">Global presence</div>
            </div>
          </button>
        </div>
          </div>
        </section>

        {/* Section 2: Analytics & Insights */}
        <section className="space-y-4 border-t-2 border-[#C3A35E]/30 pt-8 animate-fadeInUp bg-white rounded-lg p-6 shadow-sm" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#6B1F2B] rounded-full"></div>
              <div>
                <h2 className="text-xl font-bold text-[#6B1F2B] font-serif">Analytics & Insights</h2>
                <span className="text-xs text-[#6B1F2B]/60">Trends and AI recommendations</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue & Orders Trend Chart (2/3 width) */}
          <div className="lg:col-span-2 bg-white border border-[#C3A35E]/30 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#6B1F2B] font-serif">Revenue & Orders Trend</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartView('revenue')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    chartView === 'revenue'
                      ? 'text-white bg-[#6B1F2B] border-2 border-[#6B1F2B] shadow-md'
                      : 'text-[#6B1F2B]/70 bg-white border-2 border-[#C3A35E]/30 hover:border-[#C3A35E] hover:text-[#6B1F2B] hover:bg-[#C3A35E]/10'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartView('orders')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    chartView === 'orders'
                      ? 'text-white bg-[#6B1F2B] border-2 border-[#6B1F2B] shadow-md'
                      : 'text-[#6B1F2B]/70 bg-white border-2 border-[#C3A35E]/30 hover:border-[#C3A35E] hover:text-[#6B1F2B] hover:bg-[#C3A35E]/10'
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
            <div className="h-64">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        if (filters.period === 'last30days') {
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        } else if (filters.period === 'lastquarter') {
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        } else {
                          return date.toLocaleDateString('en-US', { month: 'short' })
                        }
                      }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => {
                        if (chartView === 'revenue') {
                          return formatCurrency(value)
                        }
                        return value.toLocaleString()
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #C3A35E',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        padding: '12px 16px'
                      }}
                      labelStyle={{
                        color: '#6B1F2B',
                        fontWeight: 600,
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontFamily: 'Playfair Display, serif'
                      }}
                      itemStyle={{
                        color: '#6B1F2B',
                        fontSize: '13px'
                      }}
                      cursor={{ stroke: '#C3A35E', strokeWidth: 2, strokeDasharray: '5 5' }}
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      }}
                      formatter={(value: number) => {
                        if (chartView === 'revenue') {
                          return [formatCurrency(value), 'Revenue']
                        }
                        return [value.toLocaleString(), 'Orders']
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={chartView === 'revenue' ? 'revenue' : 'orders'}
                      stroke="#6B1F2B"
                      strokeWidth={3}
                      dot={{ fill: '#6B1F2B', r: 4, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, fill: '#C3A35E', stroke: '#fff', strokeWidth: 2 }}
                      name={chartView === 'revenue' ? 'Revenue' : 'Orders'}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full bg-white rounded-lg border border-[#C3A35E]/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#C3A35E]/30 border-t-[#C3A35E] mb-3"></div>
                    <p className="text-[#6B1F2B]/70 text-sm">Loading chart data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Snapshot (1/3 width) */}
          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">AI Insights Snapshot</h3>
            <div className="space-y-3">
              {aiInsights.map((insight) => (
                <button
                  key={insight.id}
                  onClick={() => router.push(`/${locale}/os/executive?insight=${insight.id}`)}
                  className="w-full text-left p-3 bg-white hover:bg-[#F8F9FA] rounded-lg border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                      insight.priority === 'medium' ? 'bg-[#C3A35E]/20 text-[#6B1F2B]' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {insight.category}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-[#6B1F2B]">{insight.title}</div>
                  <div className="mt-1 text-xs text-[#6B1F2B]/70">{insight.description}</div>
                </button>
              ))}
            </div>
          </div>
          </div>
        </section>

        {/* Section 3: Tier 0 - Foundational Engines */}
        <section className="space-y-4 border-t-4 border-[#6B1F2B] pt-8 animate-fadeInUp bg-white rounded-lg p-6 border border-[#C3A35E]/30" style={{ animationDelay: '0.2s' }}>
          <div className="mb-4 flex items-center gap-3">
            <div className="w-2 h-12 bg-[#6B1F2B] rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-[#6B1F2B] mb-1 flex items-center gap-2 font-serif">
                <span className="text-[#6B1F2B]">TIER 0:</span>
                <span>Foundational Engines</span>
              </h2>
              <p className="text-[#6B1F2B]/80 text-sm">Core infrastructure services that power all OS domains</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/${locale}/os/identity`}
              className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 hover:shadow-xl hover:border-[#C3A35E] hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#C3A35E]/0 to-[#C3A35E]/0 group-hover:from-[#C3A35E]/5 group-hover:to-[#C3A35E]/10 transition-all duration-300"></div>
              <div className="text-3xl mb-3 relative z-10 group-hover:scale-110 transition-transform duration-300">🔐</div>
              <h3 className="text-lg font-bold text-[#6B1F2B] mb-2 relative z-10 font-serif">Identity & Access Engine</h3>
              <p className="text-sm text-[#6B1F2B] mb-4 relative z-10">User management, roles, permissions, SSO</p>
              <div className="flex items-center justify-between text-sm relative z-10">
                <span className="text-[#6B1F2B]">Total users: 4,500</span>
                <span className="text-[#6B1F2B] font-bold group-hover:text-[#C3A35E] group-hover:translate-x-1 transition-all duration-300">Open →</span>
              </div>
            </Link>

            <Link
              href={`/${locale}/os/localization`}
              className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 hover:shadow-xl hover:border-[#C3A35E] hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#C3A35E]/0 to-[#C3A35E]/0 group-hover:from-[#C3A35E]/5 group-hover:to-[#C3A35E]/10 transition-all duration-300"></div>
              <div className="text-3xl mb-3 relative z-10 group-hover:scale-110 transition-transform duration-300">🌍</div>
              <h3 className="text-lg font-bold text-[#6B1F2B] mb-2 relative z-10 font-serif">Localization Engine</h3>
              <p className="text-sm text-[#6B1F2B] mb-4 relative z-10">38 languages, 8-level geographic hierarchy</p>
              <div className="flex items-center justify-between text-sm relative z-10">
                <span className="text-[#6B1F2B]">Languages: 38</span>
                <span className="text-[#6B1F2B] font-bold group-hover:text-[#C3A35E] group-hover:translate-x-1 transition-all duration-300">Open →</span>
              </div>
            </Link>

            <Link
              href={`/${locale}/os/geo`}
              className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 hover:shadow-xl hover:border-[#C3A35E] hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#C3A35E]/0 to-[#C3A35E]/0 group-hover:from-[#C3A35E]/5 group-hover:to-[#C3A35E]/10 transition-all duration-300"></div>
              <div className="text-3xl mb-3 relative z-10 group-hover:scale-110 transition-transform duration-300">📍</div>
              <h3 className="text-lg font-bold text-[#6B1F2B] mb-2 relative z-10 font-serif">Geo Engine</h3>
              <p className="text-sm text-[#6B1F2B] mb-4 relative z-10">Territory maps, GPS trails, heatmaps</p>
              <div className="flex items-center justify-between text-sm relative z-10">
                <span className="text-[#6B1F2B]">Active routes: 1,200</span>
                <span className="text-[#6B1F2B] font-bold group-hover:text-[#C3A35E] group-hover:translate-x-1 transition-all duration-300">Open →</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Section 4: Tier 1 - Core OS Domains */}
        <section className="space-y-4 border-t-4 border-[#6B1F2B] pt-8 animate-fadeInUp bg-white rounded-lg p-6 border border-[#C3A35E]/30" style={{ animationDelay: '0.3s' }}>
          <div className="mb-4 flex items-center gap-3">
            <div className="w-2 h-12 bg-[#6B1F2B] rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-[#6B1F2B] mb-1 flex items-center gap-2 font-serif">
                <span className="text-[#6B1F2B]">TIER 1:</span>
                <span>Core OS Domains</span>
              </h2>
              <p className="text-[#6B1F2B]/80 text-sm">Operational systems built on Master Data Engine</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'orders-sales', title: 'Orders / Sales OS', desc: 'Order management, sales workflows', icon: '📋', metrics: '15,678 orders', category: 'os' },
              { id: 'inventory', title: 'Inventory OS', desc: 'Warehouse, SKU tracking, replenishment', icon: '📦', metrics: '8,900 SKUs', category: 'os' },
              { id: 'finance', title: 'Finance OS', desc: 'AR, AP, GL, Tax, Cash management', icon: '💰', metrics: formatCurrency(4523000000), category: 'os' },
              { id: 'crm', title: 'Customer & Brand CRM OS', desc: 'Retailer master, tickets, campaigns', icon: '👥', metrics: '23,400 customers', category: 'crm' },
              { id: 'hr', title: 'HR & Talent OS', desc: 'Workforce, attendance, KPIs, payroll', icon: '👔', metrics: '4,500 employees', category: 'os' },
              { id: 'logistics', title: 'Logistics & Transport OS', desc: 'Fleet, routes, GPS tracking, delivery', icon: '🚚', metrics: '1,200 routes', category: 'os' },
              { id: 'executive', title: 'Executive Control Tower', desc: 'P&L, KPIs, risk alerts, dashboards', icon: '🎯', metrics: 'Real-time', category: 'os' },
              { id: 'market-distribution', title: 'Market & Distribution OS', desc: 'Distributor management, territories, pricing', icon: '📦', metrics: '234 distributors', category: 'enterprise' },
              { id: 'supplier-procurement', title: 'Supplier & Procurement OS', desc: 'Supplier master, RFQ, GRN, performance', icon: '🏭', metrics: '89 suppliers', category: 'enterprise' }
            ].map((domain) => {
              return (
              <Link
                key={domain.id}
                href={`/${locale}/os/${domain.id}`}
                className={`bg-white border-l-4 border-[#6B1F2B] border-r border-t border-b border-[#C3A35E]/30 rounded-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full bg-[#6B1F2B] opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="text-3xl mb-3 relative z-10 group-hover:scale-110 transition-transform duration-300">{domain.icon}</div>
                <h3 className="text-lg font-bold text-[#6B1F2B] mb-2 relative z-10 font-serif">{domain.title}</h3>
                <p className="text-sm text-[#6B1F2B]/70 mb-4 relative z-10">{domain.desc}</p>
                <div className="flex items-center justify-between text-sm relative z-10">
                  <span className="text-[#6B1F2B] font-medium">{domain.metrics}</span>
                  <span className={`font-bold group-hover:translate-x-1 transition-all duration-300 text-[#C3A35E]`}>Open →</span>
                </div>
              </Link>
              )
            })}
          </div>
        </section>

        {/* Section 5: Key Intelligence Widgets */}
        <section className="space-y-4 border-t-2 border-[#C3A35E]/30 pt-8 animate-fadeInUp bg-white rounded-lg p-6 shadow-sm" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#6B1F2B] rounded-full"></div>
              <div>
                <h2 className="text-xl font-bold text-[#6B1F2B] font-serif">Key Intelligence</h2>
                <span className="text-xs text-[#6B1F2B]/60">Market & performance data</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Markets */}
          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">Top Markets by Revenue</h3>
            <div className="space-y-3">
              {topMarkets.map((market, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#6B1F2B]">{market.country}</span>
                      <span className="text-xs text-green-600">+{market.change}%</span>
                    </div>
                    <div className="w-full bg-[#6B1F2B]/5 rounded-full h-2">
                      <div
                        className="bg-[#6B1F2B] h-2 rounded-full"
                        style={{ width: `${(market.revenue / topMarkets[0].revenue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-sm font-bold text-[#6B1F2B]">{formatCurrency(market.revenue)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Distributors */}
          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">Top Distributors</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#C3A35E]/20">
                    <th className="text-left py-2 font-bold text-[#6B1F2B]">Name</th>
                    <th className="text-left py-2 font-bold text-[#6B1F2B]">Country</th>
                    <th className="text-right py-2 font-bold text-[#6B1F2B]">Revenue</th>
                    <th className="text-right py-2 font-bold text-[#6B1F2B]">On-time %</th>
                  </tr>
                </thead>
                <tbody>
                  {topDistributors.map((dist, index) => (
                    <tr key={index} className="border-b border-[#6B1F2B]/5 hover:bg-[#C3A35E]/5">
                      <td className="py-2 text-[#6B1F2B]">{dist.name}</td>
                      <td className="py-2 text-[#6B1F2B]">{dist.country}</td>
                      <td className="py-2 text-right text-[#6B1F2B] font-medium">{formatCurrency(dist.revenue)}</td>
                      <td className="py-2 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          dist.onTimePercentage >= 97 ? 'bg-green-100 text-green-800' :
                          dist.onTimePercentage >= 95 ? 'bg-[#C3A35E]/20 text-[#6B1F2B]' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {dist.onTimePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk & Alerts */}
          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">Risk & Alerts</h3>
            <div className="space-y-2">
              {riskAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => router.push(`/${locale}/os/${alert.domain.toLowerCase()}?alert=${alert.id}`)}
                  className="w-full text-left p-3 rounded-lg border transition-colors hover:bg-[#F8F9FA]"
                  style={{
                    borderColor: alert.severity === 'critical' ? '#dc2626' : alert.severity === 'warning' ? '#C3A35E' : '#3b82f6'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#6B1F2B]">[{alert.domain}]</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'warning' ? 'bg-[#C3A35E]/20 text-[#6B1F2B]' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-[#6B1F2B]">{alert.title}</div>
                      <div className="text-xs text-[#6B1F2B]/70 mt-1">{alert.date}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          </div>
        </section>
          </div>
        </div>
      </div>
    </div>
  )
}

