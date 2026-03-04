'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/data/countryData'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

interface Order {
  id: string
  order_date: string
  status: string
  total_amount: number
  currency: string
  item_count: number
  product_names: string
}

export default function DistributorOrders() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('distributorPortal.orders')
  const tCommon = useTranslations('distributorPortal.common')
  const { countryData, selectedCountry } = useCountry()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getDistributorOrders({
          ...filters,
          page: pagination.page,
          limit: pagination.limit,
        })

        if (response.error) {
          setError(response.error)
          return
        }

        interface OrdersResponse {
          data?: {
            data?: {
              orders?: Order[]
              pagination?: typeof pagination
            }
          } | Order[]
          error?: string
        }
        const responseTyped = response as OrdersResponse
        if (responseTyped?.data) {
          if (Array.isArray(responseTyped.data)) {
            setOrders(responseTyped.data)
          } else if ('data' in responseTyped.data && responseTyped.data.data) {
            setOrders((responseTyped.data.data.orders as Order[]) || [])
            setPagination((responseTyped.data.data.pagination as typeof pagination) || pagination)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [filters, pagination.page])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

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
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-[#C3A35E]/20 text-[#C3A35E]'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-white text-[#C3A35E]/90'
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1F2B] mx-auto mb-4"></div>
          <p className="text-[#C3A35E]/90">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#C3A35E]">{t('title')}</h1>
            <a
              href={`/${locale}/distributor/orders/new`}
              className="bg-white text-white px-6 py-3 font-semibold hover:bg-[#5a0012] transition-colors"
            >
              {tCommon('newOrder') || 'New Order'}
            </a>
          </div>

          {/* Filters */}
          <div className="bg-white shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('filters.status')}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-black300 px-4 py-2"
                >
                  <option value="">{t('filters.allStatuses')}</option>
                  <option value="pending">{t('statuses.pending')}</option>
                  <option value="processing">{t('statuses.processing')}</option>
                  <option value="delivered">{t('statuses.delivered')}</option>
                  <option value="cancelled">{t('statuses.cancelled')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('filters.startDate')}
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full border border-black300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('filters.endDate')}
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full border border-black300 px-4 py-2"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ status: '', startDate: '', endDate: '' })
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                  className="w-full bg-white text-[#C3A35E]/90 px-4 py-2 font-semibold hover:bg-white transition-colors"
                >
                  {t('filters.clearFilters')}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-white shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                    {t('orderId')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                    {t('items')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                    {t('totalAmount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-[#C3A35E]/90">
                      {t('noOrders')}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                        {formatDate(order.order_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {t(`statuses.${order.status.toLowerCase()}`) || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                        {order.item_count} {t('items')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">
                        {formatCurrencyAmount(order.total_amount, order.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`/${locale}/distributor/orders/${order.id}`}
                          className="text-[#C3A35E]/90 hover:text-[#5a0012]"
                        >
                          {t('viewDetails')}
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-black300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('previous')}
              </button>
              <span className="px-4 py-2">
                {t('page')} {pagination.page} {t('of')} {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border border-black300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

