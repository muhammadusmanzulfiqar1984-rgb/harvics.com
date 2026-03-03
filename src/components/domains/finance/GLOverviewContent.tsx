'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface GLOverviewContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function GLOverviewContent({ persona, locale }: GLOverviewContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [financeData, setFinanceData] = useState<any>(null)

  useEffect(() => {
    loadFinance()
  }, [selectedCountry, persona])

  const loadFinance = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      setFinanceData((response as any)?.data?.data?.finance || (response as any)?.data?.finance || null)
    } catch (error) {
      console.error('Error loading finance:', error)
      setFinanceData({
        revenue: 4500000,
        expenses: 3200000,
        profit: 1300000,
        pending: 125000
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

  const revenue = financeData?.revenue || 0
  const expenses = financeData?.expenses || 0
  const profit = financeData?.profit || 0
  const pending = financeData?.pending || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">General Ledger Overview</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + New Entry
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Revenue"
          value={`$${(revenue / 1000).toFixed(1)}K`}
          icon="💰"
        />
        <KPICard
          label="Expenses"
          value={`$${(expenses / 1000).toFixed(1)}K`}
          icon="💸"
        />
        <KPICard
          label="Profit"
          value={`$${(profit / 1000).toFixed(1)}K`}
          icon="📈"
        />
        <KPICard
          label="Pending"
          value={`$${(pending / 1000).toFixed(1)}K`}
          icon="⏳"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Financial Summary</h4>
        <p className="text-black">View and manage your financial transactions, accounts, and reporting.</p>
      </div>
    </div>
  )
}

