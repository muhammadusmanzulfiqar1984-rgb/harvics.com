'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import BinanceStyleAnalytics from '@/components/shared/BinanceStyleAnalytics'
import BinanceLiveBoard from '@/components/ui/BinanceLiveBoard'
import LiveForexRates from '@/components/ui/LiveForexRates'
import { apiClient } from '@/lib/api'

interface Tab {
  id: string
  label: string
  icon?: string
}

interface InvestorRelationsTabsProps {
  children?: React.ReactNode
}

export default function InvestorRelationsTabs({ children }: InvestorRelationsTabsProps) {
  const t = useTranslations('investor')
  const [activeTab, setActiveTab] = useState('overview')

  // Helper function to safely get translations with fallback
  // next-intl returns the key in format "namespace.key" when translation is missing
  const getTranslation = (key: string, fallback: string) => {
    try {
      const result = t(key)
      // Check if result indicates missing translation
      const isMissing = !result || 
                       result === key || 
                       result === `investor.${key}` || 
                       result.startsWith('investor.') ||
                       (typeof result === 'string' && result.includes('.') && result.split('.').length === 2)
      
      if (isMissing) {
        return fallback
      }
      return result
    } catch (error) {
      return fallback
    }
  }

  // M&S Style Tabs - Clean and Professional
  const tabs: Tab[] = [
    { id: 'overview', label: getTranslation('tabs.overview', 'Overview'), icon: '📊' },
    { id: 'analytics', label: 'Global Analytics', icon: '📈' },
    { id: 'financials', label: getTranslation('tabs.financials', 'Financial Results'), icon: '💰' },
    { id: 'reports', label: getTranslation('tabs.reports', 'Annual Reports'), icon: '📄' },
    { id: 'presentations', label: getTranslation('tabs.presentations', 'Presentations'), icon: '🎯' },
    { id: 'news', label: getTranslation('tabs.news', 'News & Announcements'), icon: '📰' },
    { id: 'contact', label: getTranslation('tabs.contact', 'Contact'), icon: '📧' }
  ]

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div role="tablist" className="flex items-center justify-start gap-0 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
                  border-b-2 border-transparent
                  min-h-[48px] flex-shrink-0
                  ${
                    activeTab === tab.id
                      ? 'text-[#6B1F2B] bg-gray-50 border-b-2 border-[#6B1F2B] font-semibold'
                      : 'text-gray-600 hover:text-[#6B1F2B] hover:bg-gray-50 border-b border-transparent'
                  }
                `}
                style={{ fontFamily: 'sans-serif', fontWeight: activeTab === tab.id ? 600 : 500, letterSpacing: '0.05em' }}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.icon && <span className="text-base leading-none">{tab.icon}</span>}
                <span className="leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] min-h-[400px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children || (
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <OverviewTab getTranslation={getTranslation} />
              )}

              {activeTab === 'analytics' && (
                <div className="animate-fadeIn space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 -mb-8 sm:-mb-12">
                  <BinanceLiveBoard />
                  <BinanceStyleAnalytics />
                </div>
              )}

              {activeTab === 'financials' && (
                <FinancialResultsTab 
                  getTranslation={getTranslation}
                />
              )}

              {activeTab === 'reports' && (
                <div className="animate-fadeIn">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#6B1F2B] mb-6 font-serif">
                    {getTranslation('tabs.reports', 'Annual Reports')}
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">Annual Report 2024</h3>
                          <p className="text-gray-600">Complete financial and operational overview</p>
                        </div>
                        <button className="bg-[#6B1F2B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a0006] transition-colors">
                          Download PDF
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">Annual Report 2023</h3>
                          <p className="text-gray-600">Previous year's comprehensive report</p>
                        </div>
                        <button className="bg-[#6B1F2B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a0006] transition-colors">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'presentations' && (
                <div className="animate-fadeIn">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#6B1F2B] mb-6 font-serif">
                    {getTranslation('tabs.presentations', 'Presentations')}
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">Q4 2024 Earnings Presentation</h3>
                          <p className="text-gray-600">Latest quarterly earnings overview</p>
                        </div>
                        <button className="bg-[#6B1F2B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a0006] transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">Investor Day 2024</h3>
                          <p className="text-gray-600">Strategic vision and growth plans</p>
                        </div>
                        <button className="bg-[#6B1F2B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a0006] transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'news' && (
                <div className="animate-fadeIn">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#6B1F2B] mb-6 font-serif">
                    {getTranslation('tabs.news', 'News & Announcements')}
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-2">January 15, 2025</div>
                          <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">Strong Q4 Performance</h3>
                          <p className="text-gray-600">Harvics reports record quarterly revenue and expansion into new markets.</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-2">December 10, 2024</div>
                          <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">New Product Launch</h3>
                          <p className="text-gray-600">Introduction of premium product line in European markets.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="animate-fadeIn">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#6B1F2B] mb-6 font-serif">
                    {getTranslation('tabs.contact', 'Contact Investor Relations')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-bold text-[#6B1F2B] mb-4">Email</h3>
                      <a href="mailto:investors@harvics.com" className="text-[#6B1F2B] hover:text-[#2a0006] font-semibold">
                        investors@harvics.com
                      </a>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-bold text-[#6B1F2B] mb-4">Office Hours</h3>
                      <p className="text-gray-600">Monday - Friday, 9:00 AM - 5:00 PM GMT</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component with Live Fluctuating Figures
function OverviewTab({ getTranslation }: { getTranslation: (key: string, fallback: string) => string }) {
  const [liveMetrics, setLiveMetrics] = useState({
    totalRevenue: 2850000000,
    marketCap: 12500000000,
    growthRate: 18.5,
    activeMarkets: 42,
    totalOrders: 124750,
    netProfit: 485000000,
    marketShare: 23.7,
    employeeCount: 12450
  })

  useEffect(() => {
    // Update metrics every 2 seconds with realistic fluctuations
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        totalRevenue: prev.totalRevenue * (1 + (Math.random() - 0.5) * 0.02),
        marketCap: prev.marketCap * (1 + (Math.random() - 0.5) * 0.015),
        growthRate: Math.max(10, Math.min(30, prev.growthRate + (Math.random() - 0.5) * 2)),
        activeMarkets: prev.activeMarkets,
        totalOrders: prev.totalOrders + Math.floor((Math.random() - 0.3) * 50),
        netProfit: prev.netProfit * (1 + (Math.random() - 0.5) * 0.02),
        marketShare: Math.max(20, Math.min(28, prev.marketShare + (Math.random() - 0.5) * 0.5)),
        employeeCount: prev.employeeCount
      }))
    }, 2000) // Changed to 2 seconds for more visible updates

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`
    return `$${(amount / 1000).toFixed(2)}K`
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#6B1F2B] mb-6 font-serif">
        {getTranslation('tabs.overview', 'Overview')}
      </h2>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          {getTranslation('tabs.overviewContent', 'Welcome to Harvics Global Ventures Investor Relations. We are committed to transparency and providing our investors with comprehensive information about our financial performance, strategic initiatives, and growth opportunities.')}
        </p>
        
        {/* Live KPI Cards with Fluctuating Figures */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-1 transition-all duration-500">
              {formatCurrency(liveMetrics.totalRevenue)}
            </div>
            <div className="text-xs text-green-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +{liveMetrics.growthRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Market Cap</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-1 transition-all duration-500">
              {formatCurrency(liveMetrics.marketCap)}
            </div>
            <div className="text-xs text-blue-600">Live Valuation</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Net Profit</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-1 transition-all duration-500">
              {formatCurrency(liveMetrics.netProfit)}
            </div>
            <div className="text-xs text-green-600">Q4 2024</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Market Share</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-1 transition-all duration-500">
              {liveMetrics.marketShare.toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600">Global FMCG</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Total Orders</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-1 transition-all duration-500">
              {liveMetrics.totalOrders.toLocaleString()}
            </div>
            <div className="text-xs text-orange-600">30-Day Period</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Active Markets</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-1">
              {liveMetrics.activeMarkets}
            </div>
            <div className="text-xs text-blue-600">Countries</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Growth Rate</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-1 transition-all duration-500">
              +{liveMetrics.growthRate.toFixed(1)}%
            </div>
            <div className="text-xs text-green-600">YoY Increase</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Employees</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-1">
              {liveMetrics.employeeCount.toLocaleString()}
            </div>
            <div className="text-xs text-purple-600">Global Workforce</div>
          </div>
        </div>
        
        {/* Live Forex Rates Section */}
        <div className="mb-8">
          <LiveForexRates compact={false} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">Market Presence</h3>
            <p className="text-gray-600">Global operations across multiple markets</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">Growth Strategy</h3>
            <p className="text-gray-600">Expansion and innovation focus</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">Financial Strength</h3>
            <p className="text-gray-600">Strong balance sheet and cash flow</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Financial Results Tab Component with Live Data
function FinancialResultsTab({ getTranslation }: { getTranslation: (key: string, fallback: string) => string }) {
  const [financialData, setFinancialData] = useState<any>(null)
  const [liveData, setLiveData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFinancialData()
    loadLiveFinancialData()
    // Refresh live data every 5 seconds for realistic fluctuations
    const interval = setInterval(loadLiveFinancialData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getInvestorDashboard()
      
      if (response.data && !response.error) {
        setFinancialData(response.data)
      }
    } catch (error: any) {
      console.error('Error loading financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLiveFinancialData = async () => {
    try {
      const response = await apiClient.getLiveFinancialData()
      
      if (response.data && (response.data as any).success && (response.data as any).data) {
        setLiveData((response.data as any).data)
      }
    } catch (error: any) {
      console.error('Error loading live financial data:', error)
    }
  }

  // Use live data if available, otherwise fall back to dashboard data
  const kpis = financialData?.kpis || {}
  const [fluctuatingMetrics, setFluctuatingMetrics] = useState({
    growth: 15,
    revenue30d: 2500000000,
    avgOrderValue: 5000,
    netProfit: 450000000,
    ordersToday: 1247,
    revenueYTD: 8500000000,
    operatingMargin: 18.5,
    ebitda: 1200000000,
    cashFlow: 650000000,
    debtToEquity: 0.35,
    returnOnEquity: 24.8
  })
  const isLive = liveData?.live ?? false

  // Update metrics when live data or financial data loads
  useEffect(() => {
    if (liveData || financialData) {
      setFluctuatingMetrics(prev => ({
        growth: liveData?.growthPercentage ?? kpis.growthPercentage ?? prev.growth,
        revenue30d: liveData?.revenue30d ?? kpis.revenue30d ?? prev.revenue30d,
        avgOrderValue: liveData?.avgOrderValue ?? kpis.avgOrderValue ?? prev.avgOrderValue,
        netProfit: liveData?.netProfit ?? prev.netProfit,
        ordersToday: liveData?.ordersToday ?? prev.ordersToday,
        revenueYTD: prev.revenueYTD,
        operatingMargin: prev.operatingMargin,
        ebitda: prev.ebitda,
        cashFlow: prev.cashFlow,
        debtToEquity: prev.debtToEquity,
        returnOnEquity: prev.returnOnEquity
      }))
    }
  }, [liveData, financialData, kpis])

  // Add live fluctuations to financial metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setFluctuatingMetrics(prev => ({
        growth: Math.max(10, Math.min(30, prev.growth + (Math.random() - 0.5) * 1.5)),
        revenue30d: prev.revenue30d * (1 + (Math.random() - 0.5) * 0.015),
        avgOrderValue: Math.max(4000, Math.min(6000, prev.avgOrderValue + (Math.random() - 0.5) * 100)),
        netProfit: prev.netProfit * (1 + (Math.random() - 0.5) * 0.02),
        ordersToday: Math.max(1000, prev.ordersToday + Math.floor((Math.random() - 0.4) * 30)),
        revenueYTD: prev.revenueYTD * (1 + (Math.random() - 0.5) * 0.01),
        operatingMargin: Math.max(15, Math.min(22, prev.operatingMargin + (Math.random() - 0.5) * 0.5)),
        ebitda: prev.ebitda * (1 + (Math.random() - 0.5) * 0.015),
        cashFlow: prev.cashFlow * (1 + (Math.random() - 0.5) * 0.02),
        debtToEquity: Math.max(0.25, Math.min(0.45, prev.debtToEquity + (Math.random() - 0.5) * 0.02)),
        returnOnEquity: Math.max(20, Math.min(30, prev.returnOnEquity + (Math.random() - 0.5) * 1))
      }))
    }, 2000) // Changed to 2 seconds for more visible updates

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="animate-fadeIn">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#6B1F2B] mb-6 font-serif">
        {getTranslation('tabs.financials', 'Financial Results')}
      </h2>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#6B1F2B]">Latest Financial Results</h3>
            <div className="flex items-center space-x-2">
              {isLive && (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                    LIVE
                  </span>
                </>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            {getTranslation('tabs.financialsContent', 'View our latest quarterly and annual financial results, including revenue, profit margins, and key performance indicators.')}
          </p>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading financial data...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-[#6B1F2B]">Q4 2024</div>
                  <div className="text-sm text-gray-600">Latest Quarter</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      {fluctuatingMetrics.growth >= 0 ? '+' : ''}{fluctuatingMetrics.growth.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Revenue Growth (30d)</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      ${(fluctuatingMetrics.revenue30d / 1000000000).toFixed(2)}B
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Revenue (30d)</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      ${fluctuatingMetrics.avgOrderValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Avg Order Value</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      ${(fluctuatingMetrics.netProfit / 1000000000).toFixed(2)}B
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Net Profit</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      {fluctuatingMetrics.ordersToday.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Orders Today</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      ${(fluctuatingMetrics.revenueYTD / 1000000000).toFixed(2)}B
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Revenue YTD</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      {fluctuatingMetrics.operatingMargin.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Operating Margin</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      ${(fluctuatingMetrics.ebitda / 1000000000).toFixed(2)}B
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">EBITDA</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      ${(fluctuatingMetrics.cashFlow / 1000000000).toFixed(2)}B
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Cash Flow</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      {fluctuatingMetrics.debtToEquity.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Debt-to-Equity</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <div className="text-2xl font-bold text-[#6B1F2B]">
                      {fluctuatingMetrics.returnOnEquity.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Return on Equity</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

