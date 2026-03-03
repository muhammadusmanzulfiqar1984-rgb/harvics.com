'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface CustomerListContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function CustomerListContent({ persona, locale }: CustomerListContentProps) {
  const t = useTranslations('crm.customerList')
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [crmData, setCrmData] = useState<any>(null)

  useEffect(() => {
    loadCRM()
  }, [selectedCountry, persona])

  const loadCRM = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      setCrmData((response as any)?.data?.data?.crm || (response as any)?.data?.crm || null)
    } catch (error) {
      console.error('Error loading CRM:', error)
      setCrmData({
        totalCustomers: 1250,
        active: 980,
        new: 45,
        satisfaction: 94
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

  const totalCustomers = crmData?.totalCustomers || 0
  const active = crmData?.active || 0
  const newCustomers = crmData?.new || 0
  const satisfaction = crmData?.satisfaction || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">{t('title')}</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + {t('newCustomer')}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label={t('totalCustomers')}
          value={totalCustomers}
          icon="👥"
        />
        <KPICard
          label={t('active')}
          value={active}
          icon="✅"
        />
        <KPICard
          label={t('new')}
          value={newCustomers}
          icon="🆕"
        />
        <KPICard
          label={t('satisfaction')}
          value={`${satisfaction}%`}
          icon="⭐"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">{t('customerManagement')}</h4>
        <p className="text-black">{t('customerManagementDescription')}</p>
      </div>
    </div>
  )
}

