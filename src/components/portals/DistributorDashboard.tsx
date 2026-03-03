'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import PortalSwitcher from '@/components/shared/PortalSwitcher'
import GeoSelector from '@/components/shared/GeoSelector'
import PortalOSNavigation from '@/components/shared/PortalOSNavigation'
import EnterpriseCRM from '@/components/shared/EnterpriseCRM'
import KPICard from '@/components/shared/KPICard'
import LineChartCard from '@/components/charts/LineChartCard'
import BarChartCard from '@/components/charts/BarChartCard'
import AIInsightsPanel from '@/components/shared/AIInsightsPanel'

interface DistributorKPIs {
  totalOrders: number
  pendingOrders: number
  fillRate: number
  revenue: number
  activeSkus: number
  coverageScore: number
}

export default function V16DistributorDashboard() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { selectedCountry, countryData } = useCountry()
  
  const [kpis, setKpis] = useState<DistributorKPIs>({
    totalOrders: 0,
    pendingOrders: 0,
    fillRate: 0,
    revenue: 0,
    activeSkus: 0,
    coverageScore: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userScope, setUserScope] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'dashboard' | 'os' | 'crm'>('dashboard')
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'payments' | 'retailers' | 'compliance' | 'ai-insights'>('overview')
  const [aiPanelOpen, setAiPanelOpen] = useState(false)

  // Load user scope and portal data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Get user scope from localStorage
        if (typeof window !== 'undefined') {
          const userScopeStr = localStorage.getItem('user_scope')
          if (userScopeStr) {
            try {
              const scope = JSON.parse(userScopeStr)
              setUserScope(scope)
            } catch (e) {
              console.error('Error parsing user scope:', e)
            }
          }
        }

        // Fetch distributor portal data from BFF
        const response = await apiClient.getDistributorPortal()
        
        if (response.error) {
          setError(response.error)
          return
        }

        if (response.data) {
          // Update KPIs from API response
          const data = response.data as any
          if (data.kpis) {
            setKpis({
              totalOrders: data.kpis.routesToday || 0,
              pendingOrders: data.kpis.pendingOrders || 0,
              fillRate: data.kpis.fillRate || 0,
              revenue: data.kpis.revenue || 0,
              activeSkus: data.kpis.activeSkus || 0,
              coverageScore: data.kpis.coverageScore || 0
            })
          }
        }
      } catch (err) {
        console.error('Error loading distributor portal data:', err)
        setError('Failed to load portal data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Check if we're in OS or CRM view based on pathname
  useEffect(() => {
    const viewParam = searchParams?.get('view')
    if (viewParam === 'os' || viewParam === 'crm' || viewParam === 'dashboard') {
      setViewMode(viewParam)
      return
    }
    if (pathname?.includes('/os/')) {
      setViewMode('os')
    } else if (pathname?.includes('/crm') || pathname?.includes('/portal/distributor/crm')) {
      setViewMode('crm')
    } else {
      setViewMode('dashboard')
    }
  }, [pathname, searchParams])

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'os', label: 'OS Domains', icon: '🏗️' },
    { id: 'crm', label: 'CRM', icon: '👥' }
  ]

  const dashboardTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '📋' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'retailers', label: 'Retailers', icon: '🏪' },
    { id: 'compliance', label: 'Compliance', icon: '✅' },
    { id: 'ai-insights', label: 'AI Insights', icon: '🤖' }
  ]

  const formatCurrency = (amount: number) => {
    // Use currency symbol from countryData if available, otherwise default to USD
    const currencySymbol = countryData?.currency?.symbol || '$'
    const currencyCode = countryData?.currency?.code || 'USD'
    
    // Apply currency conversion if fxRate is available
    let convertedAmount = amount
    if (countryData?.currency?.fxRateUSD && currencyCode !== 'USD') {
      convertedAmount = amount * (countryData.currency.fxRateUSD || 1)
    }
    
    if (convertedAmount >= 1000000) return `${currencySymbol}${(convertedAmount / 1000000).toFixed(1)}M`
    if (convertedAmount >= 1000) return `${currencySymbol}${(convertedAmount / 1000).toFixed(1)}K`
    return `${currencySymbol}${convertedAmount.toFixed(0)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C3A35E] mx-auto mb-4"></div>
          <p className="text-[#6B1F2B] font-serif font-bold">Loading Distributor Portal...</p>
          <p className="text-sm text-[#6B1F2B]/70 mt-2">Fetching your territory data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[#6B1F2B] mb-2 font-serif">Error Loading Portal</h2>
          <p className="text-[#6B1F2B]/70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#C3A35E] text-[#6B1F2B] rounded-md font-bold hover:bg-[#b5952f] transition-colors shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Handle view mode change
  const handleViewModeChange = (mode: 'dashboard' | 'os' | 'crm') => {
    setViewMode(mode)
    const basePath = `/${locale}/portal/distributor`
    if (mode === 'dashboard') {
      router.push(basePath)
      return
    }
    router.push(`${basePath}?view=${mode}`)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#C3A35E]/30 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-xl sm:text-2xl font-bold text-[#6B1F2B] font-serif">H</div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-[#6B1F2B] leading-tight font-serif">
                  <span className="hidden sm:inline">Harvics OS — </span>Distributor Portal
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Territory Information */}
              {userScope && (
                <div className="hidden lg:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-[#C3A35E]/10 rounded-md border border-[#C3A35E]/30">
                  <span className="text-xs font-bold text-[#6B1F2B]">
                    {userScope.geographic?.territories?.length > 0 
                      ? `Territory: ${userScope.geographic.territories.join(', ')}`
                      : userScope.countries?.length > 0
                      ? `Country: ${userScope.countries.join(', ')}`
                      : 'All Territories'}
                  </span>
                </div>
              )}
              <GeoSelector />
              <PortalSwitcher currentPortal="distributor" />
            </div>
          </div>
          
          {/* Main Tabs: Dashboard / OS Domains / CRM */}
          <div className="border-t border-[#C3A35E]/20 bg-white">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleViewModeChange(tab.id as any)}
                  className={`relative flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    viewMode === tab.id
                      ? 'text-[#6B1F2B] border-b-2 border-[#C3A35E] bg-[#F8F9FA] font-bold'
                      : 'text-[#6B1F2B]/70 hover:text-[#6B1F2B] hover:bg-[#C3A35E]/5 border-b-2 border-transparent'
                  }`}
                >
                  <span className="text-base sm:text-lg leading-none">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Layout */}
      <div className="flex flex-1">
        {/* OS Navigation Sidebar (only show in OS view) */}
        {viewMode === 'os' && (
          <PortalOSNavigation portal="distributor" currentDomain={pathname?.split('/os/')[1]?.split('/')[0]} />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 ${viewMode === 'os' ? '' : 'max-w-[1440px] mx-auto'} px-4 sm:px-6 py-4 sm:py-6`}>
          {/* View Mode: Dashboard */}
          {viewMode === 'dashboard' && (
            <>
              {/* Distributor KPIs */}
              <section className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <KPICard
                    label="Total Orders"
                    value={kpis.totalOrders.toLocaleString()}
                    change={{ value: 5.2, trend: 'up', label: 'previous period' }}
                    icon="📦"
                    onClick={() => {
                      setActiveTab('orders')
                      router.push(`/${locale}/os/orders-sales`)
                    }}
                  />
                  <KPICard
                    label="Pending Orders"
                    value={kpis.pendingOrders}
                    icon="⏳"
                    onClick={() => {
                      setActiveTab('orders')
                      router.push(`/${locale}/os/orders-sales`)
                    }}
                  />
                  <KPICard
                    label="Fill Rate"
                    value={`${kpis.fillRate}%`}
                    change={{ value: 1.5, trend: 'up', label: 'previous period' }}
                    icon="📊"
                    onClick={() => {
                      setActiveTab('inventory')
                      router.push(`/${locale}/os/inventory`)
                    }}
                  />
                  <KPICard
                    label="Revenue"
                    value={formatCurrency(kpis.revenue)}
                    change={{ value: 8.7, trend: 'up', label: 'previous period' }}
                    icon="💰"
                    onClick={() => {
                      setActiveTab('payments')
                      router.push(`/${locale}/os/finance`)
                    }}
                  />
                  <KPICard
                    label="Active SKUs"
                    value={kpis.activeSkus.toLocaleString()}
                    icon="📋"
                    onClick={() => {
                      setActiveTab('inventory')
                      router.push(`/${locale}/os/inventory`)
                    }}
                  />
                  <KPICard
                    label="Coverage Score"
                    value={`${kpis.coverageScore}%`}
                    change={{ value: 2.1, trend: 'up', label: 'previous period' }}
                    icon="🎯"
                    onClick={() => router.push(`/${locale}/os/crm`)}
                  />
                </div>
              </section>

              {/* Dashboard Tabs Navigation */}
              <section className="mb-6">
                <div className="bg-white border border-[#C3A35E]/30 rounded-t-lg overflow-hidden">
                  <div className="flex gap-0 overflow-x-auto scrollbar-hide border-b border-[#C3A35E]/20">
                    {dashboardTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative flex items-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'text-[#6B1F2B] bg-[#F8F9FA] border-b-2 border-[#C3A35E] font-bold'
                            : 'text-[#6B1F2B]/70 hover:text-[#6B1F2B] hover:bg-[#C3A35E]/5 border-b-2 border-transparent'
                        }`}
                      >
                        <span className="text-base sm:text-lg leading-none">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Dashboard Tab Content */}
              <section>
                <div className="bg-white border border-[#C3A35E]/30 border-t-0 rounded-b-lg p-4 sm:p-6 shadow-sm min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Overview</h2>
                </div>
                
                {/* Revenue Trend Chart */}
                <LineChartCard
                  title="Revenue Trend (Last 30 Days)"
                  data={[
                    { name: 'Week 1', revenue: 250000, orders: 45 },
                    { name: 'Week 2', revenue: 280000, orders: 52 },
                    { name: 'Week 3', revenue: 310000, orders: 58 },
                    { name: 'Week 4', revenue: 325000, orders: 62 }
                  ]}
                  dataKeys={['revenue', 'orders']}
                  colors={['#6B1F2B', '#C3A35E']}
                />

                {/* Top SKUs */}
                <BarChartCard
                  title="Top Moving SKUs"
                  data={[
                    { name: 'SKU-001', quantity: 1250 },
                    { name: 'SKU-002', quantity: 980 },
                    { name: 'SKU-003', quantity: 750 },
                    { name: 'SKU-004', quantity: 620 },
                    { name: 'SKU-005', quantity: 580 }
                  ]}
                  dataKeys={['quantity']}
                  colors={['#6B1F2B']}
                />
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#6B1F2B] font-serif">Orders</h2>
                  <button className="px-4 py-2 bg-[#C3A35E] text-[#6B1F2B] rounded-md text-sm font-bold hover:bg-[#b5952f] transition-colors shadow-sm">
                    + New Order
                  </button>
                </div>
                
                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FA] border-b border-[#C3A35E]/30">
                        <th className="px-4 py-3 text-left text-sm font-bold text-[#6B1F2B]">Order ID</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-[#6B1F2B]">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-[#6B1F2B]">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-[#6B1F2B]">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-[#6B1F2B]">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-[#6B1F2B]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'ORD-001', date: '2024-01-20', customer: 'Retailer A', amount: '$12,500', status: 'Delivered' },
                        { id: 'ORD-002', date: '2024-01-21', customer: 'Retailer B', amount: '$8,300', status: 'In Transit' },
                        { id: 'ORD-003', date: '2024-01-22', customer: 'Retailer C', amount: '$15,200', status: 'Pending' },
                        { id: 'ORD-004', date: '2024-01-23', customer: 'Retailer A', amount: '$9,800', status: 'Processing' }
                      ].map((order) => (
                        <tr key={order.id} className="border-b border-[#C3A35E]/10 hover:bg-[#C3A35E]/5 transition-colors">
                          <td className="px-4 py-3 text-sm text-[#6B1F2B]">{order.id}</td>
                          <td className="px-4 py-3 text-sm text-[#6B1F2B]">{order.date}</td>
                          <td className="px-4 py-3 text-sm text-[#6B1F2B]">{order.customer}</td>
                          <td className="px-4 py-3 text-sm font-medium text-[#6B1F2B]">{order.amount}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Pending' ? 'bg-[#C3A35E]/20 text-[#6B1F2B]' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-sm text-[#6B1F2B] hover:text-[#C3A35E] hover:underline font-medium">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === 'inventory' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Inventory</h2>
                <p className="text-[#6B1F2B]">Inventory content will be displayed here.</p>
              </div>
            )}
            {activeTab === 'payments' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Payments</h2>
                <p className="text-[#6B1F2B]">Payments content will be displayed here.</p>
              </div>
            )}
            {activeTab === 'retailers' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Retailers</h2>
                <p className="text-[#6B1F2B]">Retailers content will be displayed here.</p>
              </div>
            )}
            {activeTab === 'compliance' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Compliance</h2>
                <p className="text-[#6B1F2B]">Compliance content will be displayed here.</p>
              </div>
            )}
            {activeTab === 'ai-insights' && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#6B1F2B] font-serif">AI Insights</h2>
                  <button
                    onClick={() => setAiPanelOpen(true)}
                    className="px-4 py-2 bg-[#C3A35E] text-[#6B1F2B] rounded-md text-sm font-bold hover:bg-[#b5952f] transition-colors shadow-sm"
                  >
                    Open AI Panel
                  </button>
                </div>
                <p className="text-[#6B1F2B] mb-4">Click "Open AI Panel" to view detailed AI insights and recommendations.</p>
              </div>
            )}
                </div>
              </section>
            </>
          )}

          {/* View Mode: OS Domains */}
          {viewMode === 'os' && (
            <div className="py-6">
              {pathname?.includes('/os/') ? (
                <div className="text-center py-12">
                  <p className="text-[#6B1F2B] mb-4">OS Domain content will be displayed here.</p>
                  <p className="text-sm text-[#6B1F2B]">Use the sidebar navigation to select an OS domain.</p>
                </div>
              ) : (
                <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-[#6B1F2B] mb-4 font-serif">OS Domains</h2>
                  <p className="text-[#6B1F2B] mb-6">
                    Navigate through the OS domains using the sidebar. Each domain provides access to:
                  </p>
                  <ul className="space-y-2 text-[#6B1F2B] list-disc list-inside mb-6">
                    <li>Tier 0: Foundational Engines (Identity, Localization, Geo)</li>
                    <li>Tier 1: Core OS Domains (Orders, Inventory, Finance, CRM, etc.)</li>
                    <li>Tier 2: Modules within each domain</li>
                    <li>Tier 3: KPI screens and analytics</li>
                    <li>Tier 4: Actions and workflows</li>
                  </ul>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                    <Link
                      href={`/${locale}/os/orders-sales`}
                      className="p-4 border border-[#C3A35E]/30 rounded-lg hover:border-[#C3A35E] hover:shadow-lg transition-all"
                    >
                      <div className="text-2xl mb-2">📋</div>
                      <h3 className="font-bold text-[#6B1F2B] mb-1 font-serif">Orders / Sales OS</h3>
                      <p className="text-sm text-[#6B1F2B]/80">Order management and sales workflows</p>
                    </Link>
                    <Link
                      href={`/${locale}/os/inventory`}
                      className="p-4 border border-[#C3A35E]/30 rounded-lg hover:border-[#C3A35E] hover:shadow-lg transition-all"
                    >
                      <div className="text-2xl mb-2">📦</div>
                      <h3 className="font-bold text-[#6B1F2B] mb-1 font-serif">Inventory OS</h3>
                      <p className="text-sm text-[#6B1F2B]/80">Warehouse and stock management</p>
                    </Link>
                    <Link
                      href={`/${locale}/os/finance`}
                      className="p-4 border border-[#C3A35E]/30 rounded-lg hover:border-[#C3A35E] hover:shadow-lg transition-all"
                    >
                      <div className="text-2xl mb-2">💰</div>
                      <h3 className="font-bold text-[#6B1F2B] mb-1 font-serif">Finance OS</h3>
                      <p className="text-sm text-[#6B1F2B]/80">Financial management and accounting</p>
                    </Link>
                    <Link
                      href={`/${locale}/os/crm`}
                      className="p-4 border border-[#C3A35E]/30 rounded-lg hover:border-[#C3A35E] hover:shadow-lg transition-all"
                    >
                      <div className="text-2xl mb-2">👥</div>
                      <h3 className="font-bold text-[#6B1F2B] mb-1 font-serif">CRM OS</h3>
                      <p className="text-sm text-[#6B1F2B]/80">Customer relationship management</p>
                    </Link>
                    <Link
                      href={`/${locale}/os/logistics`}
                      className="p-4 border border-[#C3A35E]/30 rounded-lg hover:border-[#C3A35E] hover:shadow-lg transition-all"
                    >
                      <div className="text-2xl mb-2">🚚</div>
                      <h3 className="font-bold text-[#6B1F2B] mb-1 font-serif">Logistics OS</h3>
                      <p className="text-sm text-[#6B1F2B]/80">Transport and delivery management</p>
                    </Link>
                    <Link
                      href={`/${locale}/os/retailers`}
                      className="p-4 border border-[#C3A35E]/30 rounded-lg hover:border-[#C3A35E] hover:shadow-lg transition-all"
                    >
                      <div className="text-2xl mb-2">🏪</div>
                      <h3 className="font-bold text-[#6B1F2B] mb-1 font-serif">Retailers</h3>
                      <p className="text-sm text-[#6B1F2B]/80">Retailer management and tracking</p>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View Mode: CRM */}
          {viewMode === 'crm' && (
            <div className="py-6">
              <EnterpriseCRM persona="distributor" locale={locale} />
            </div>
          )}
        </main>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        insights={[
          {
            id: '1',
            type: 'prediction',
            title: 'Revenue Forecast',
            description: 'Revenue is expected to increase by 12% next month based on current trends and seasonal patterns.',
            priority: 'high',
            confidence: 85
          },
          {
            id: '2',
            type: 'risk',
            title: 'Inventory Alert',
            description: '5 SKUs are below reorder point. Recommend immediate restocking to avoid stockouts.',
            priority: 'high'
          },
          {
            id: '3',
            type: 'opportunity',
            title: 'Market Expansion',
            description: 'Opportunity to expand into 3 new territories with high demand potential.',
            priority: 'medium'
          },
          {
            id: '4',
            type: 'action',
            title: 'Optimize Route Planning',
            description: 'Review delivery routes to reduce transportation costs by an estimated 8%.',
            priority: 'medium'
          }
        ]}
        title="Distributor AI Insights"
      />
    </div>
  )
}
