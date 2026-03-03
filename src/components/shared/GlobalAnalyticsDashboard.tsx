'use client'

import React, { useState, useEffect } from 'react'
import HierarchicalLocationSelector from '@/components/ui/HierarchicalLocationSelector'

interface LocationLevel {
  id: string
  name: string
  type: 'global' | 'continent' | 'region' | 'country' | 'city' | 'street' | 'location'
  data?: {
    revenue?: number
    growth?: number
    distributors?: number
    retailers?: number
    employees?: number
    hrScore?: number
  }
}

interface AnalyticsData {
  revenue: number[]
  growth: number[]
  marketShare: number[]
  distribution: number[]
  productPerformance: { name: string; revenue: number; growth: number; marketShare: number }[]
  cityPerformance: { name: string; revenue: number; growth: number; retailers: number }[]
  hrMetrics: { metric: string; value: number; trend: number }[]
  labels: string[]
}

const GlobalAnalyticsDashboard: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationLevel | null>(null)
  const [timeRange, setTimeRange] = useState<'1D' | '7D' | '1M' | '3M' | '1Y' | 'ALL'>('1Y')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'products' | 'cities' | 'hr'>('overview')
  const [liveMetrics, setLiveMetrics] = useState({
    totalRevenue: 100000000,
    growth: 15,
    marketShare: 20,
    distributors: 100
  })

  // Add live fluctuations to key metrics
  useEffect(() => {
    const fluctuationInterval = setInterval(() => {
      const baseRevenue = selectedLocation?.data?.revenue || 100000000
      const baseGrowth = selectedLocation?.data?.growth || 15
      const baseDistributors = selectedLocation?.data?.distributors || 100
      const currentMarketShare = analyticsData?.marketShare?.[analyticsData.marketShare.length - 1] || 20
      
        setLiveMetrics(prev => ({
          totalRevenue: baseRevenue * (1 + (Math.random() - 0.5) * 0.02),
          growth: Math.max(10, Math.min(30, baseGrowth + (Math.random() - 0.5) * 2)),
          marketShare: Math.max(15, Math.min(25, currentMarketShare + (Math.random() - 0.5) * 0.5)),
          distributors: Math.max(0, baseDistributors + Math.floor((Math.random() - 0.5) * 10))
        }))
    }, 2000) // Changed to 2 seconds for more visible updates

    return () => clearInterval(fluctuationInterval)
  }, [analyticsData, selectedLocation])

  // Generate comprehensive analytics data
  useEffect(() => {
    const generateData = () => {
      const labels = timeRange === '1D' ? Array.from({ length: 24 }, (_, i) => `${i}:00`) :
                     timeRange === '7D' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
                     timeRange === '1M' ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`) :
                     timeRange === '3M' ? Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`) :
                     timeRange === '1Y' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
                     ['2020', '2021', '2022', '2023', '2024']

      const baseRevenue = selectedLocation?.data?.revenue || 100000000
      const currentRevenue = liveMetrics.totalRevenue > 0 ? liveMetrics.totalRevenue : baseRevenue
      const revenue = labels.map((_, i) => {
        const trend = Math.sin(i / labels.length * Math.PI * 2) * 0.2 + 1
        const noise = (Math.random() - 0.5) * 0.1
        // Apply live fluctuation to the last data point
        const multiplier = i === labels.length - 1 ? (currentRevenue / baseRevenue) : 1
        return baseRevenue * trend * (1 + noise) * multiplier
      })

      const baseGrowth = selectedLocation?.data?.growth || 15
      const currentGrowth = liveMetrics.growth > 0 ? liveMetrics.growth : baseGrowth
      const growth = labels.map((_, i) => {
        const base = baseGrowth + (i / labels.length) * 2
        // Apply live fluctuation to the last data point
        if (i === labels.length - 1) {
          return currentGrowth + (Math.random() - 0.5) * 1
        }
        return base + (Math.random() - 0.5) * 2
      })

      const currentMarketShare = liveMetrics.marketShare > 0 ? liveMetrics.marketShare : 20
      const marketShare = labels.map((_, i) => {
        const base = 15 + (i / labels.length) * 5
        // Apply live fluctuation to the last data point
        if (i === labels.length - 1) {
          return currentMarketShare + (Math.random() - 0.5) * 0.3
        }
        return base + (Math.random() - 0.5) * 1
      })

      const distribution = labels.map((_, i) => {
        const baseDist = selectedLocation?.data?.distributors || 100
        return baseDist + Math.floor(i * 2 + Math.random() * 5)
      })

      // Product Performance Data
      const productPerformance = [
        { name: 'Beverages', revenue: baseRevenue * 0.25, growth: 18.5, marketShare: 22.3 },
        { name: 'Confectionery', revenue: baseRevenue * 0.20, growth: 15.2, marketShare: 18.7 },
        { name: 'Snacks', revenue: baseRevenue * 0.18, growth: 22.1, marketShare: 16.5 },
        { name: 'Pasta', revenue: baseRevenue * 0.15, growth: 12.8, marketShare: 14.2 },
        { name: 'Bakery', revenue: baseRevenue * 0.12, growth: 19.3, marketShare: 12.8 },
        { name: 'Culinary', revenue: baseRevenue * 0.10, growth: 16.7, marketShare: 11.5 }
      ]

      // City Performance Data
      const cityPerformance = [
        { name: 'London', revenue: baseRevenue * 0.28, growth: 18.5, retailers: 1150 },
        { name: 'Dubai', revenue: baseRevenue * 0.22, growth: 24.8, retailers: 1120 },
        { name: 'Karachi', revenue: baseRevenue * 0.20, growth: 30.2, retailers: 820 },
        { name: 'Paris', revenue: baseRevenue * 0.15, growth: 15.2, retailers: 580 },
        { name: 'Lahore', revenue: baseRevenue * 0.10, growth: 27.8, retailers: 650 },
        { name: 'Berlin', revenue: baseRevenue * 0.05, growth: 11.8, retailers: 320 }
      ]

      // HR Performance Metrics
      const hrMetrics = [
        { metric: 'Employee Satisfaction', value: 87, trend: 5.2 },
        { metric: 'Productivity Index', value: 92, trend: 8.1 },
        { metric: 'Retention Rate', value: 94, trend: 3.5 },
        { metric: 'Training Completion', value: 89, trend: 6.3 },
        { metric: 'Performance Score', value: 91, trend: 7.2 }
      ]

      setAnalyticsData({ revenue, growth, marketShare, distribution, productPerformance, cityPerformance, hrMetrics, labels })
    }

    generateData()
  }, [selectedLocation, timeRange, liveMetrics])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`
    return `$${amount.toFixed(2)}`
  }

  const getMaxValue = (arr: number[]) => Math.max(...arr, 1)

  return (
    <div className="bg-gradient-to-br from-[#0b1224] via-[#0f1f3a] to-[#0a0f1a] min-h-[600px] text-white -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      {/* Elegant Header with Glass Effect */}
      <div className="bg-gradient-to-r from-[#1a1a1a]/95 via-[#2a2a2a]/95 to-[#1a1a1a]/95 backdrop-blur-xl border-b border-[#C3A35E]/20 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent mb-2">
                Harvics Global Analytics
              </h1>yes 
              <p className="text-sm md:text-base text-white/70">
                {selectedLocation ? `📍 ${selectedLocation.name} • Real-time Performance Dashboard` : '🌍 Select a location to view comprehensive analytics'}
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              {(['1D', '7D', '1M', '3M', '1Y', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-white to-white text-black shadow-lg shadow-white/50'
                      : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-[#C3A35E] border border-[#333]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Left Column - Location Selector */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <HierarchicalLocationSelector
              onLocationChange={setSelectedLocation}
              showAnalytics={true}
            />
          </div>
        </div>

        {/* Right Column - Analytics Dashboard */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {/* View Selector Tabs */}
          <div className="bg-[#0e162a]/80 backdrop-blur-sm border border-[#3b82f6]/30 rounded-xl p-2 flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'products', label: 'Products', icon: '📦' },
              { id: 'cities', label: 'Cities', icon: '🏙️' },
              { id: 'hr', label: 'HR Performance', icon: '👥' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-[#60a5fa] via-white to-[#a78bfa] text-black shadow-lg'
                    : 'text-white/80 hover:text-[#C3A35E] hover:bg-[#6B1F2B]'
                }`}
              >
                <span className="mr-2">{view.icon}</span>
                {view.label}
              </button>
            ))}
          </div>

          {/* Key Metrics Cards - Elegant Glass Effect with Live Fluctuations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#0f3d2e] via-[#12835c] to-[#16a34a] border border-[#34d399]/50 rounded-xl p-4 md:p-6 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-emerald-400/30 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs md:text-sm text-white/70">Total Revenue</div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white transition-all duration-500">
                {formatCurrency(liveMetrics.totalRevenue)}
              </div>
              <div className="text-xs md:text-sm text-green-400 mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                +{liveMetrics.growth.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#0c1f3f] via-[#1d4ed8] to-[#2563eb] border border-[#60a5fa]/50 rounded-xl p-4 md:p-6 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-blue-400/30 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs md:text-sm text-white/70">Distributors</div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white transition-all duration-500">
                {Math.round(liveMetrics.distributors)}
              </div>
              <div className="text-xs md:text-sm text-blue-400 mt-2">Active Network</div>
            </div>
            <div className="bg-gradient-to-br from-[#2b1b3f] via-[#7c3aed] to-[#a855f7] border border-[#c084fc]/50 rounded-xl p-4 md:p-6 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-purple-400/30 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs md:text-sm text-white/70">Retailers</div>
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {selectedLocation?.data?.retailers || 0}
              </div>
              <div className="text-xs md:text-sm text-purple-400 mt-2">Global Reach</div>
            </div>
            <div className="bg-gradient-to-br from-[#0b3039] via-[#0ea5e9] to-[#22d3ee] border border-[#67e8f9]/50 rounded-xl p-4 md:p-6 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-cyan-300/30 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs md:text-sm text-white/70">Market Share</div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-blue-400 transition-all duration-500">
                {liveMetrics.marketShare.toFixed(1)}%
              </div>
              <div className="text-xs md:text-sm text-green-400 mt-2">Growing</div>
            </div>
          </div>

          {/* Overview View */}
          {activeView === 'overview' && analyticsData && (
            <div className="space-y-4 md:space-y-6">
              {/* Revenue Trend Chart - Elegant */}
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[#C3A35E]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-2">📈</span>
                    Revenue Trend
                  </h3>
                  <div className="text-sm text-white/70">{timeRange} View</div>
                </div>
                <div className="space-y-3">
                  {analyticsData.labels.map((label, index) => {
                    const height = (analyticsData.revenue[index] / getMaxValue(analyticsData.revenue)) * 100
                    return (
                      <div key={index} className="flex items-end space-x-2 group">
                        <div className="flex-1 text-xs text-white/70 min-w-[60px]">{label}</div>
                        <div className="flex-1 bg-[#0a0a0a] rounded-lg relative h-12 overflow-hidden border border-[#333] group-hover:border-white/50 transition-all">
                          <div
                            className="bg-gradient-to-t from-white via-white to-white h-full rounded-lg transition-all duration-700 ease-out group-hover:shadow-lg group-hover:shadow-white/50"
                            style={{ height: `${height}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-white bg-[#1a1a1a]/90 px-2 py-1 rounded">
                              {formatCurrency(analyticsData.revenue[index])}
                            </span>
                          </div>
                        </div>
                        <div className="w-24 text-xs text-gray-300 text-right hidden md:block">
                          {formatCurrency(analyticsData.revenue[index])}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Growth & Market Share - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Growth Rate Chart */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[#C3A35E]/30 rounded-xl p-6 backdrop-blur-sm shadow-2xl">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Growth Rate
                  </h3>
                  <div className="space-y-2">
                    {analyticsData.labels.map((label, index) => {
                      const value = analyticsData.growth[index]
                      const isPositive = value >= 0
                      return (
                        <div key={index} className="flex items-center space-x-2 group">
                        <div className="flex-1 text-xs text-white/70">{label}</div>
                          <div className="flex-1 bg-[#0a0a0a] rounded-full h-3 overflow-hidden border border-[#333]">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isPositive ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                              }`}
                              style={{ width: `${Math.min(Math.abs(value) * 3, 100)}%` }}
                            />
                          </div>
                          <div className={`w-16 text-xs font-semibold text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{value.toFixed(1)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Market Share Chart */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[#C3A35E]/30 rounded-xl p-6 backdrop-blur-sm shadow-2xl">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Market Share Evolution
                  </h3>
                  <div className="space-y-2">
                    {analyticsData.labels.map((label, index) => {
                      const share = analyticsData.marketShare[index]
                      return (
                        <div key={index} className="flex items-center space-x-2 group">
                        <div className="flex-1 text-xs text-white/70">{label}</div>
                          <div className="flex-1 bg-[#0a0a0a] rounded-full h-4 overflow-hidden relative border border-[#333] group-hover:border-blue-400/50 transition-all">
                            <div
                              className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 h-full rounded-full transition-all duration-700"
                              style={{ width: `${share * 2}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                              {share.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products View */}
          {activeView === 'products' && analyticsData && (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[#C3A35E]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">📦</span>
                Product Performance Analysis
              </h3>
              <div className="space-y-4">
                {analyticsData.productPerformance.map((product, index) => (
                  <div key={index} className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4 hover:border-white/50 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-white group-hover:text-[#C3A35E] transition-colors">
                        {product.name}
                      </h4>
                      <div className="text-sm font-bold text-white">
                        {formatCurrency(product.revenue)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                      <div className="text-xs text-white/70 mb-1">Revenue</div>
                        <div className="text-sm font-semibold text-white">{formatCurrency(product.revenue)}</div>
                      </div>
                      <div>
                      <div className="text-xs text-white/70 mb-1">Growth</div>
                        <div className="text-sm font-semibold text-green-400">+{product.growth.toFixed(1)}%</div>
                      </div>
                      <div>
                      <div className="text-xs text-white/70 mb-1">Market Share</div>
                        <div className="text-sm font-semibold text-blue-400">{product.marketShare.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-white to-white h-full rounded-full transition-all duration-500"
                        style={{ width: `${(product.revenue / getMaxValue(analyticsData.productPerformance.map(p => p.revenue))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cities View */}
          {activeView === 'cities' && analyticsData && (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[#C3A35E]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">🏙️</span>
                City Performance Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData.cityPerformance.map((city, index) => (
                  <div key={index} className="bg-[#0a0a0a] border border-[#333] rounded-lg p-5 hover:border-white/50 transition-all group hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-white group-hover:text-[#C3A35E] transition-colors">
                        {city.name}
                      </h4>
                      <div className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                        +{city.growth.toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-white/70 mb-1">Revenue</div>
                        <div className="text-lg font-bold text-white">{formatCurrency(city.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/70 mb-1">Retailers</div>
                        <div className="text-base font-semibold text-white">{city.retailers.toLocaleString()}</div>
                      </div>
                      <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(city.revenue / getMaxValue(analyticsData.cityPerformance.map(c => c.revenue))) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HR Performance View */}
          {activeView === 'hr' && analyticsData && (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[#C3A35E]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">👥</span>
                HR Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData.hrMetrics.map((metric, index) => (
                  <div key={index} className="bg-[#0a0a0a] border border-[#333] rounded-lg p-5 hover:border-white/50 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-semibold text-gray-300">{metric.metric}</h4>
                      <div className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                        +{metric.trend.toFixed(1)}%
                      </div>
                    </div>
                    <div className="relative">
                      <div className="text-3xl font-bold text-white mb-2">{metric.value}%</div>
                      <div className="w-full bg-[#1a1a1a] rounded-full h-3 overflow-hidden border border-[#333]">
                        <div
                          className="bg-gradient-to-r from-white via-white to-white h-full rounded-full transition-all duration-700"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                      <div className="text-xs text-white/70 mt-2">Target: 90% • Current: {metric.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GlobalAnalyticsDashboard

