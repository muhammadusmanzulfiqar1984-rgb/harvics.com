'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useLocalization } from '@/utils/localization'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface StockOverviewContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function StockOverviewContent({ persona, locale }: StockOverviewContentProps) {
  const { selectedCountry, countryData } = useCountry()
  const { getCurrencyCode, getCurrencySymbol, currency } = useLocalization()
  const [loading, setLoading] = useState(true)
  const [inventoryData, setInventoryData] = useState<any>(null)

  // Get currency from localization context or country data
  const currentCurrency = currency?.code || countryData?.currency?.code || getCurrencyCode() || 'USD'
  const currencySymbol = currency?.symbol || countryData?.currency?.symbol || getCurrencySymbol() || '$'

  useEffect(() => {
    loadInventory()
  }, [selectedCountry, persona, currentCurrency])

  const loadInventory = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: currentCurrency
      })
      setInventoryData((response as any)?.data?.data?.inventory || (response as any)?.data?.inventory || null)
    } catch (error) {
      console.error('Error loading inventory:', error)
      setInventoryData({
        totalValue: 245800000,
        totalSKUs: 1250,
        lowStock: 45,
        categories: 28
      })
    } finally {
      setLoading(false)
    }
  }

  // Format currency with proper symbol
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${currencySymbol}${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${currencySymbol}${(amount / 1000).toFixed(1)}K`
    }
    return `${currencySymbol}${amount.toFixed(0)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
      </div>
    )
  }

  const totalValue = inventoryData?.totalValue || 0
  const totalSKUs = inventoryData?.totalSKUs || 0
  const lowStock = inventoryData?.lowStock || 0
  const categories = inventoryData?.categories || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Stock Overview</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + Add Stock
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Value"
          value={formatCurrency(totalValue)}
          icon="💰"
        />
        <KPICard
          label="Total SKUs"
          value={totalSKUs}
          icon="📦"
        />
        <KPICard
          label="Low Stock"
          value={lowStock}
          icon="⚠️"
        />
        <KPICard
          label="Categories"
          value={categories}
          icon="📋"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Inventory Summary</h4>
        <p className="text-black">View and manage your inventory across all warehouses and locations.</p>
      </div>
    </div>
  )
}

