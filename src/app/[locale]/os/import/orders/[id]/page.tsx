'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/data/countryData'
import { formatDate } from '@/utils/dateUtils'
import Link from 'next/link'

interface ImportOrder {
  id: string
  order_number?: string
  supplier_name?: string
  origin_country?: string
  destination_country?: string
  status?: string
  total_value?: number
  currency?: string
  customs_duty?: number
  expected_arrival_date?: string
  created_at?: string
  items?: Array<{
    id: string
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    hs_code?: string
  }>
}

export default function ImportOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('import')
  const { countryData } = useCountry()
  const orderId = params.id as string
  const [order, setOrder] = useState<ImportOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getImportOrder(orderId)
      
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setOrder(response.data as ImportOrder)
      } else {
        setError('Order not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load order'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-white text-[#C3A35E]/90'
    const statusLower = status.toLowerCase()
    if (statusLower.includes('delivered') || statusLower === 'completed') return 'bg-green-100 text-green-800'
    if (statusLower.includes('transit') || statusLower === 'in_transit') return 'bg-blue-100 text-blue-800'
    if (statusLower.includes('customs') || statusLower.includes('clearance')) return 'bg-[#C3A35E]/20 text-[#C3A35E]'
    if (statusLower === 'pending' || statusLower === 'draft') return 'bg-white text-[#C3A35E]/90'
    return 'bg-white text-[#C3A35E]/90'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1F2B]"></div>
        <p className="mt-2 text-[#C3A35E]/90">{t('common.loading') || 'Loading...'}</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {error || 'Order not found'}
        </div>
        <Link
          href={`/${locale}/os/import/orders`}
          className="text-[#C3A35E]/90 hover:text-[#5a000c] font-medium"
        >
          ← Back to Import Orders
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumb - V16 Spec */}
      <div className="mb-4">
        <Link
          href={`/${locale}/os/import/orders`}
          className="text-[#C3A35E]/90 hover:text-[#C3A35E] font-medium text-sm"
        >
          ← {t('orders.back') || 'Back to Orders'}
        </Link>
      </div>

      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">
          {t('orders.detail.title') || 'Import Order'}: {order.order_number || order.id}
        </h1>
        <p className="text-[#C3A35E]/90">
          {t('orders.detail.description') || 'View import order details and documents'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-black200 p-6">
          <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">
            {t('orders.detail.orderInfo') || 'Order Information'}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#C3A35E]/90">{t('orders.detail.supplier') || 'Supplier'}:</span>
              <span className="font-medium">{order.supplier_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#C3A35E]/90">{t('orders.detail.origin') || 'Origin'}:</span>
              <span className="font-medium">{order.origin_country || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#C3A35E]/90">{t('orders.detail.destination') || 'Destination'}:</span>
              <span className="font-medium">{order.destination_country || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#C3A35E]/90">{t('orders.detail.status') || 'Status'}:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#C3A35E]/90">{t('orders.detail.value') || 'Total Value'}:</span>
              <span className="font-medium">
                {formatCurrency(order.total_value || 0, order.currency || countryData?.currency?.code || 'USD')}
              </span>
            </div>
            {order.customs_duty && (
              <div className="flex justify-between">
                <span className="text-[#C3A35E]/90">{t('orders.detail.customsDuty') || 'Customs Duty'}:</span>
                <span className="font-medium">
                  {formatCurrency(order.customs_duty, order.currency || countryData?.currency?.code || 'USD')}
                </span>
              </div>
            )}
            {order.expected_arrival_date && (
              <div className="flex justify-between">
                <span className="text-[#C3A35E]/90">{t('orders.detail.eta') || 'Expected Arrival'}:</span>
                <span className="font-medium">{formatDate(order.expected_arrival_date, locale)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-black200 p-6">
          <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">
            {t('orders.detail.items') || 'Order Items'}
          </h2>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="border-b border-black200 pb-3 last:border-b-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{item.product_name}</span>
                    <span className="text-[#C3A35E]/90">
                      {formatCurrency(item.total_price, order.currency || countryData?.currency?.code || 'USD')}
                    </span>
                  </div>
                  <div className="text-sm text-[#C3A35E]/90">
                    {t('orders.detail.quantity') || 'Quantity'}: {item.quantity} × {formatCurrency(item.unit_price, order.currency || countryData?.currency?.code || 'USD')}
                    {item.hs_code && ` | HS Code: ${item.hs_code}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#C3A35E]/90">{t('orders.detail.noItems') || 'No items found'}</p>
          )}
        </div>
      </div>
    </>
  )
}

