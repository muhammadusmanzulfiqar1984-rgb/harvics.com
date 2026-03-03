'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/data/countryData'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
  fulfilled_quantity: number
}

interface StatusTimeline {
  status: string
  timestamp: string
  description: string
}

interface OrderDetail {
  order: {
    id: string
    order_date: string
    delivery_date: string | null
    status: string
    total_amount: number
    currency: string
    delivery_address: string | null
    notes: string | null
  }
  items: OrderItem[]
  statusTimeline: StatusTimeline[]
}

export default function DistributorOrderDetail() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('distributorPortal.orderDetail')
  const tOrders = useTranslations('distributorPortal.orders')
  const tCommon = useTranslations('distributorPortal.common')
  const { countryData, selectedCountry } = useCountry()
  const orderId = params.id as string
  const [loading, setLoading] = useState(true)
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getDistributorOrder(orderId)

        if (response.error) {
          setError(response.error)
          return
        }

        interface OrderDetailResponse {
          data?: {
            data?: unknown
          }
        }
        const responseData = response as OrderDetailResponse
        if (responseData.data?.data) {
          setOrderDetail(responseData.data.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const formatCurrencyAmount = (amount: number, currencyCode?: string) => {
    if (countryData && selectedCountry) {
      const countryCode = countryData?.currency?.code || 'US'
      return formatCurrency(amount, countryCode)
    }
    if (currencyCode) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount)
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-[#C3A35E]/20 text-[#C3A35E]'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-white text-[#C3A35E]/90'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1F2B] mx-auto mb-4"></div>
          <p className="text-[#C3A35E]/90">{tCommon('loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !orderDetail) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">{tCommon('error')}</h2>
          <p className="text-[#C3A35E]/90 mb-4">{error || t('orderNotFound')}</p>
          <button
            onClick={() => router.push(`/${locale}/distributor/orders`)}
            className="bg-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#5a0012] transition-colors"
          >
            {t('backToOrders')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#C3A35E]">{t('title')}</h1>
            <button
              onClick={() => router.push(`/${locale}/distributor/orders`)}
              className="bg-white text-[#C3A35E]/90 px-4 py-2 rounded-lg font-semibold hover:bg-white transition-colors"
            >
              {t('backToOrders')}
            </button>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-[#C3A35E]/90">{t('orderId') || 'Order ID'}</p>
                <p className="text-lg font-semibold">{orderDetail.order.id}</p>
              </div>
              <div>
                <p className="text-sm text-[#C3A35E]/90">{t('status') || 'Status'}</p>
                <span
                  className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(
                    orderDetail.order.status
                  )}`}
                >
                  {tOrders(`statuses.${orderDetail.order.status.toLowerCase()}`) || orderDetail.order.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-[#C3A35E]/90">{t('orderDate')}</p>
                <p className="text-lg font-semibold">{formatDate(orderDetail.order.order_date)}</p>
              </div>
              {orderDetail.order.delivery_date && (
                <div>
                  <p className="text-sm text-[#C3A35E]/90">{t('deliveryDate')}</p>
                  <p className="text-lg font-semibold">{formatDate(orderDetail.order.delivery_date)}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-[#C3A35E]/90">{t('totalAmount') || 'Total Amount'}</p>
                <p className="text-2xl font-bold text-[#C3A35E]">
                  {formatCurrencyAmount(orderDetail.order.total_amount, orderDetail.order.currency)}
                </p>
              </div>
            </div>
            {orderDetail.order.delivery_address && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-[#C3A35E]/90 mb-1">{t('deliveryAddress')}</p>
                <p className="text-[#C3A35E]/90">{orderDetail.order.delivery_address}</p>
              </div>
            )}
            {orderDetail.order.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-[#C3A35E]/90 mb-1">{t('notes')}</p>
                <p className="text-[#C3A35E]/90">{orderDetail.order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-[#C3A35E] mb-4">{t('orderItems')}</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">{t('product')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">{t('sku')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">{t('quantity')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">{t('unitPrice')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">{t('total')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderDetail.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm font-medium text-[#C3A35E]/90">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm text-[#C3A35E]/90">{item.sku}</td>
                    <td className="px-4 py-3 text-sm text-[#C3A35E]/90">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-[#C3A35E]/90">
                      {formatCurrencyAmount(item.unit_price, orderDetail.order.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#C3A35E]/90">
                      {formatCurrencyAmount(item.total_price, orderDetail.order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Status Timeline */}
          {orderDetail.statusTimeline && orderDetail.statusTimeline.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-[#C3A35E] mb-4">{t('statusTimeline')}</h2>
              <div className="space-y-4">
                {orderDetail.statusTimeline.map((timeline, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-[#C3A35E]/90">{timeline.description}</p>
                      <p className="text-sm text-[#C3A35E]/90">{formatDateTime(timeline.timestamp)}</p>
                      <span
                        className={`mt-1 px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                          timeline.status
                        )}`}
                      >
                        {tOrders(`statuses.${timeline.status.toLowerCase()}`) || timeline.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

