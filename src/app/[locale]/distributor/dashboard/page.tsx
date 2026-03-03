'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import apiClient from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/data/countryData'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

interface DashboardData {
  ordersThisMonth: {
    count: number
    totalValue: number
    currency: string
  }
  pendingOrders: {
    count: number
    totalValue: number
    currency: string
  }
  deliveredOrders: {
    count: number
    totalValue: number
    currency: string
  }
  territory: {
    continent?: string
    region?: string
    country?: string
    city?: string
    district?: string
    area?: string
    location?: string
    territory?: string
  }
}

export default function DistributorDashboard() {
  const locale = useLocale()
  const t = useTranslations('distributorPortal.dashboard')
  const tCommon = useTranslations('distributorPortal.common')
  const { countryData, selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getDistributorPortal();
        
        if (response.error) {
          setError(response.error);
          setData(null);
        } else if (response.data) {
          setData(response.data);
          setError(null);
        } else {
          setError('No data received from the server.');
          setData(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrencyAmount = (amount: number, currencyCode?: string) => {
    // Use country data for proper currency formatting
    if (countryData?.currency?.code) {
      return formatCurrency(amount, countryData.currency.code)
    }
    // Fallback to currency code if provided
    if (currencyCode) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount)
    }
    // Default to USD
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1F2B] mx-auto mb-4"></div>
          <p className="text-[#C3A35E]/90">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">{tCommon('error')}</h2>
          <p className="text-[#C3A35E]/90">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#C3A35E] mb-4">No Data Available</h2>
          <p className="text-[#C3A35E]/80">We could not find any dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#C3A35E] mb-8">{t('title') || 'Distributor Dashboard'}</h1>

          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </ErrorBoundary>
  )
}

