'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/data/countryData'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  amount: number
  paid_amount: number
  status: string
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL'
  currency: string
  order_date: string
  order_status: string
}

export default function DistributorInvoices() {
  const locale = useLocale()
  const t = useTranslations('distributorPortal.invoices')
  const tCommon = useTranslations('distributorPortal.common')
  const { countryData, selectedCountry } = useCountry()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: searchParams?.get('status') || '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getDistributorInvoices({
          ...filters,
          page: pagination.page,
          limit: pagination.limit,
        })

        if (response.error) {
          setError(response.error)
          return
        }

        if (response?.data) {
          const responseData = response.data as any
          if (Array.isArray(responseData)) {
            setInvoices(responseData as typeof invoices)
          } else if (responseData?.data) {
            setInvoices((responseData.data.invoices || []) as typeof invoices)
            setPagination(responseData.data.pagination || pagination)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoices')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PARTIAL':
        return 'bg-harvics-gold/20 text-harvics-gold'
      case 'UNPAID':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-white text-harvics-gold/90'
    }
  }

  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvics-burgundy mx-auto mb-4"></div>
          <p className="text-harvics-gold/90">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-harvics-gold mb-8">{t('title')}</h1>

          {/* Filters */}
          <div className="bg-white shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-harvics-gold/90 mb-2">
                  {t('filters.status')}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-200 px-4 py-2"
                >
                  <option value="">{t('filters.allStatuses')}</option>
                  <option value="PAID">{t('statuses.paid')}</option>
                  <option value="UNPAID">{t('statuses.unpaid')}</option>
                  <option value="PARTIAL">{t('statuses.partial')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ status: '' })
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                  className="w-full bg-white text-harvics-gold/90 px-4 py-2 font-semibold hover:bg-white transition-colors"
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

          {/* Invoices Table */}
          <div className="bg-white shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-harvics-gold/90 uppercase tracking-wider">
                    {t('invoiceNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-harvics-gold/90 uppercase tracking-wider">
                    {t('invoiceDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-harvics-gold/90 uppercase tracking-wider">
                    {t('dueDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-harvics-gold/90 uppercase tracking-wider">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-harvics-gold/90 uppercase tracking-wider">
                    {t('paidAmount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-harvics-gold/90 uppercase tracking-wider">
                    {t('paymentStatus')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-harvics-gold/90">
                      {t('noInvoices')}
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-harvics-gold/90">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-harvics-gold/90">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-harvics-gold/90">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-harvics-gold/90">
                        {formatCurrencyAmount(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-harvics-gold/90">
                        {formatCurrencyAmount(invoice.paid_amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                            invoice.paymentStatus
                          )}`}
                        >
                          {t(`statuses.${invoice.paymentStatus.toLowerCase()}`) || invoice.paymentStatus}
                        </span>
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
                className="px-4 py-2 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

