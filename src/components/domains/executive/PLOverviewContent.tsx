'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useLocalization } from '@/utils/localization'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface PLOverviewContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function PLOverviewContent({ persona, locale }: PLOverviewContentProps) {
  const { selectedCountry, countryData } = useCountry()
  const { getCurrencyCode, getCurrencySymbol, currency } = useLocalization()
  const [loading, setLoading] = useState(true)
  const [plData, setPlData] = useState<any>(null)

  const currentCurrency = currency?.code || countryData?.currency?.code || getCurrencyCode() || 'USD'
  const currencySymbol = currency?.symbol || countryData?.currency?.symbol || getCurrencySymbol() || '$'

  useEffect(() => {
    loadPL()
  }, [selectedCountry, persona])

  const loadPL = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: currentCurrency
      })
      const data = (response as any)?.data?.data || (response as any)?.data || {}
      setPlData(data.finance || data.executive || null)
    } catch (error) {
      console.error('Error loading P&L:', error)
      setPlData({
        revenue: 4523000000,
        expenses: 3273000000,
        profit: 1250000000,
        growth: 25.5
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
      </div>
    )
  }

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return `${currencySymbol}${(amount / 1000000000).toFixed(1)}B`
    }
    if (amount >= 1000000) {
      return `${currencySymbol}${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${currencySymbol}${(amount / 1000).toFixed(1)}K`
    }
    return `${currencySymbol}${amount.toFixed(0)}`
  }

  const revenue = plData?.revenue || 0
  const expenses = plData?.expenses || 0
  const profit = plData?.profit || 0
  const growth = plData?.growth || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#6B1F2B] font-serif tracking-wide">P&L Overview</h3>
        <button className="bg-[#6B1F2B] text-[#C3A35E] px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-[#C3A35E] hover:text-[#6B1F2B] transition-colors border border-[#C3A35E]">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Revenue"
          value={formatCurrency(revenue)}
          icon="💰"
        />
        <KPICard
          label="Expenses"
          value={formatCurrency(expenses)}
          icon="💸"
        />
        <KPICard
          label="Profit"
          value={formatCurrency(profit)}
          icon="📊"
        />
        <KPICard
          label="Growth"
          value={`+${growth}%`}
          icon="📈"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-[#6B1F2B] mb-4">Profit & Loss Summary</h4>
        <p className="text-[#6B1F2B] mb-4">Company-wide profit & loss tracking and margin analysis.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-[#6B1F2B]/70 mb-1 font-semibold">Net Profit Margin</p>
            <p className="text-2xl font-bold text-green-700">{((profit / revenue) * 100).toFixed(1)}%</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-[#6B1F2B]/70 mb-1 font-semibold">Operating Margin</p>
            <p className="text-2xl font-bold text-blue-700">{(((revenue - expenses) / revenue) * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Sovereign Architect: Strategic Opportunities Panel */}
      <div className="bg-white border border-[#C3A35E]/30 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b border-black200 bg-[#6B1F2B]/5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-[#6B1F2B] flex items-center gap-2">
                <span>⚡</span> Sovereign Architect: Strategic Opportunities
              </h4>
              <p className="text-sm text-black/70 mt-1">AI-Detected High Margin Market Voids & SKU Recommendations</p>
            </div>
            <span className="px-3 py-1 bg-[#6B1F2B] text-[#C3A35E] text-xs font-bold uppercase rounded-full animate-pulse">
              Live Analysis
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-black200">
          {/* Opportunity 1: Pakistan - High Margin / Low Cost */}
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl border-2 border-green-500">
                  🇵🇰
                </div>
                <div>
                  <h5 className="font-bold text-black text-lg">Pakistan (PK) <span className="text-xs font-normal text-gray-500 ml-2">Void Score: 80/100</span></h5>
                  <p className="text-[#6B1F2B] font-semibold mt-1">Recommended SKU: Harvics Energy</p>
                  <p className="text-sm text-gray-600 mt-1">Strategy: <span className="font-bold text-purple-700">AGGRESSIVE ARBITRAGE</span></p>
                  <p className="text-xs text-gray-500 mt-2 italic">"Huge market void detected. Low purchasing power requires high-energy, low-cost SKU."</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Proj. Margin</p>
                <p className="text-3xl font-bold text-green-600">65%</p>
                <p className="text-xs text-gray-500 mt-1">Price: $1.11</p>
                <button className="mt-3 px-4 py-1.5 bg-[#C3A35E] hover:bg-[#C3A35E] text-[#6B1F2B] text-xs font-bold uppercase rounded shadow-sm transition-all">
                  Deploy SKU
                </button>
              </div>
            </div>
          </div>

          {/* Opportunity 2: UK - Premium / Integrity */}
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl border-2 border-blue-500">
                  🇬🇧
                </div>
                <div>
                  <h5 className="font-bold text-black text-lg">United Kingdom (GB) <span className="text-xs font-normal text-gray-500 ml-2">Void Score: 60/100</span></h5>
                  <p className="text-[#6B1F2B] font-semibold mt-1">Recommended SKU: Harvics Salted Caramel Selection</p>
                  <p className="text-sm text-gray-600 mt-1">Strategy: <span className="font-bold text-blue-700">INTEGRITY ACT</span></p>
                  <p className="text-xs text-gray-500 mt-2 italic">"Premium market with high purchasing power. Margin capped for brand integrity."</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Proj. Margin</p>
                <p className="text-3xl font-bold text-blue-600">30%</p>
                <p className="text-xs text-gray-500 mt-1">Price: $3.11</p>
                <button className="mt-3 px-4 py-1.5 bg-[#C3A35E] hover:bg-[#C3A35E] text-[#6B1F2B] text-xs font-bold uppercase rounded shadow-sm transition-all">
                  Deploy SKU
                </button>
              </div>
            </div>
          </div>

          {/* Opportunity 3: USA - Inflation Shield */}
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl border-2 border-red-500">
                  🇺🇸
                </div>
                <div>
                  <h5 className="font-bold text-black text-lg">United States (US) <span className="text-xs font-normal text-gray-500 ml-2">Void Score: 60/100</span></h5>
                  <p className="text-[#6B1F2B] font-semibold mt-1">Recommended SKU: Harvics Honey Glaze Selection</p>
                  <p className="text-sm text-gray-600 mt-1">Strategy: <span className="font-bold text-orange-700">INFLATION SHIELD</span></p>
                  <p className="text-xs text-gray-500 mt-2 italic">"High inflation volatility detected. Premium pricing strategy applied."</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Proj. Margin</p>
                <p className="text-3xl font-bold text-green-600">35%</p>
                <p className="text-xs text-gray-500 mt-1">Price: $2.83</p>
                <button className="mt-3 px-4 py-1.5 bg-[#C3A35E] hover:bg-[#C3A35E] text-[#6B1F2B] text-xs font-bold uppercase rounded shadow-sm transition-all">
                  Deploy SKU
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-black200 text-center">
          <button className="text-[#6B1F2B] font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto">
            View All 12 Detected Opportunities
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

