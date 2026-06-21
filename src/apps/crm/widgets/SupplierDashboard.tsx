'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getSupplierDashboardViewModel } from '@/apps/crm/crm.controller'
import { DashboardCard } from './DashboardCard'
import { formatCurrency } from '@/lib/formatting'
import { getCurrency } from '@/config/localeConfig'

interface SupplierDashboardState {
  purchaseOrders: number
  shipments: number
  invoices: number
  paymentsPending: number
  qualityComplaints: number
  forecast: number
  currency: string
}

const initialState: SupplierDashboardState = {
  purchaseOrders: 0,
  shipments: 0,
  invoices: 0,
  paymentsPending: 0,
  qualityComplaints: 0,
  forecast: 0,
  currency: '',
}

export const SupplierDashboard = () => {
  const t = useTranslations('supplierPortal.dashboard')
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(initialState)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const viewModel = await getSupplierDashboardViewModel()
        setData(viewModel)
      } catch (error) {
        console.error('Failed to load supplier dashboard', error)
        setData(initialState)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="bg-white text-center py-20 rounded-2xl text-harvics-burgundy">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-harvics-gold mx-auto mb-4"></div>
        <p>{t('loading')}</p>
      </div>
    )
  }

  const formatLocaleCurrency = (value: number) => {
    const currency = data.currency || getCurrency(locale)
    return formatCurrency(value, locale, currency)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard 
          title={t('purchaseOrders')} 
          value={data.purchaseOrders} 
          subtitle={t('purchaseOrdersSubtitle')} 
        />
        <DashboardCard 
          title={t('shipments')}
          value={data.shipments}
          subtitle={t('shipmentsSubtitle')}
        />
        <DashboardCard 
          title={t('invoices')}
          value={formatLocaleCurrency(data.invoices)}
          subtitle={t('invoicesSubtitle')}
          accent="gold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title={t('paymentsPending')}
          value={formatLocaleCurrency(data.paymentsPending)}
          subtitle={t('paymentsPendingSubtitle')}
          accent="red"
        />
        <DashboardCard
          title={t('qualityComplaints')}
          value={data.qualityComplaints}
          subtitle={t('qualityComplaintsSubtitle')}
          accent="red"
        />
        <DashboardCard
          title={t('forecast')}
          value={formatLocaleCurrency(data.forecast)}
          subtitle={t('forecastSubtitle')}
          accent="gold"
        />
      </div>

      <div className="bg-white/90 rounded-xl border border-harvics-gold/30 p-4 shadow">
        <h3 className="text-sm font-semibold text-black uppercase tracking-widest mb-2">
          {t('supplierActions')}
        </h3>
        <ul className="text-sm text-black/80 list-disc list-inside space-y-1">
          <li>{t('action1')}</li>
          <li>{t('action2')}</li>
          <li>{t('action3')}</li>
        </ul>
      </div>
    </div>
  )
}

