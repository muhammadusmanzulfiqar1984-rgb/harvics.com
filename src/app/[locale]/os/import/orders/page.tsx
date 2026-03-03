'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/data/countryData'
import { formatDate } from '@/utils/dateUtils'

interface ImportOrder {
  order_id: string
  supplier_id?: string
  supplier_name?: string
  country_code?: string
  status?: string
  order_date?: string
  expected_delivery?: string
  total_value?: number
  currency?: string
  items_count?: number
  customs_status?: string
  shipping_method?: string
}

export default function ImportOrdersPage() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('import')
  const { selectedCountry, countryData } = useCountry()
  const [orders, setOrders] = useState<ImportOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    country_code: selectedCountry || ''
  })

  useEffect(() => {
    loadOrders()
  }, [filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      // Use new enhanced API endpoint
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.country_code) params.append('countryCode', filters.country_code)
      const query = params.toString() ? `?${params.toString()}` : ''
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/os-domains/import-export/import-orders${query}`, { headers })
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to load import orders')
        setOrders([])
      } else if (result.data) {
        const ordersData = Array.isArray(result.data) ? result.data : []
        setOrders(ordersData)
      } else {
        setOrders([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load import orders'
      setError(errorMessage)
      setOrders([])
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

  const formatOrderValue = (value?: number, currency?: string) => {
    if (!value) return '-'
    const countryCode = currency || selectedCountry || 'US'
    return formatCurrency(value, countryCode)
  }

  return (
    <>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">
              {t('orders.title')}
            </h1>
            <p className="text-[#C3A35E]/90">
              {t('orders.description')}
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-[#ffffff] focus:border-transparent"
            >
              <option value="">{t('orders.allStatuses')}</option>
              <option value="pending">{t('orders.pending')}</option>
              <option value="in_transit">{t('orders.inTransit')}</option>
              <option value="customs">{t('orders.customs')}</option>
              <option value="delivered">{t('orders.delivered')}</option>
            </select>
            <select
              value={filters.country_code}
              onChange={(e) => setFilters({ ...filters, country_code: e.target.value })}
              className="px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-[#ffffff] focus:border-transparent"
            >
              <option value="">{t('orders.allCountries')}</option>
              <option value="US">United States</option>
              <option value="PK">Pakistan</option>
              <option value="AE">UAE</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1F2B]"></div>
          <p className="mt-4 text-[#C3A35E]/90">{t('orders.loading')}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-[#C3A35E]/90">{t('orders.noOrders')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                  {t('orders.orderId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                  {t('orders.supplier')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                  {t('orders.country')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                  {t('orders.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                  {t('orders.orderDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                  {t('orders.expectedDelivery')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                  {t('orders.totalValue')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                  {t('orders.items')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">
                  {t('orders.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-white">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/${locale}/os/import/orders/${order.order_id}`}
                      className="text-[#C3A35E]/90 hover:text-[#C3A35E] font-medium"
                    >
                      {order.order_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                    {order.supplier_name || order.supplier_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                    {order.country_code || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                    {order.order_date ? formatDate(order.order_date) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                    {order.expected_delivery ? formatDate(order.expected_delivery) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">
                    {formatOrderValue(order.total_value, order.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                    {order.items_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/${locale}/os/import/orders/${order.order_id}`}
                      className="text-[#C3A35E]/90 hover:text-[#C3A35E]"
                    >
                      {t('orders.view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
