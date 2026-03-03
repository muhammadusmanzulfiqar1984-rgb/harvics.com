'use client'

import { useCountry } from '@/contexts/CountryContext'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { DistributorOverview } from '@/types/distributor'
import type { ApiResponse } from '@/lib/api'

export default function DistributorAnalytics() {
  const { countryData } = useCountry()
  const currency = countryData?.currency || { symbol: '$', code: 'USD' }
  const [overview, setOverview] = useState<DistributorOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true)
        const response: ApiResponse<DistributorOverview> =
          await api.getDistributorOverview()
        if (response.data) {
          setOverview(response.data)
        } else {
          setError(response.error || 'Failed to fetch distributor overview')
        }
      } catch (err) {
        setError('An unexpected error occurred.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#6B1F2B] border-t-transparent"></div>
          <p className="text-lg font-semibold text-[#6B1F2B]">
            Loading Analytics...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            Error Loading Data
          </h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-[#6B1F2B]">
            No Data Available
          </h2>
          <p className="text-[#6B1F2B]/80">
            We could not find any analytics data.
          </p>
        </div>
      </div>
    )
  }

  const {
    totalSales,
    totalOrders,
    avgOrderValue,
    satisfaction,
    salesTrend,
    productCategories,
    topCustomers,
    regionPerformance,
  } = overview

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="pt-20">
        {/* Hero Section */}
        <section className="h-[300px] relative bg-[#6B1F2B] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">
              Analytics Dashboard
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
              Track your distribution performance and business insights
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pb-20 -mt-16 z-20 relative">
          {/* Key Metrics (country-driven currency) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="bg-white p-6 rounded-xl border border-[#C3A35E]/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl md:text-3xl font-serif font-bold text-[#6B1F2B] mb-2">
                {currency.symbol}{' '}
                {(totalSales.value / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm md:text-base text-[#6B1F2B]/70 font-bold uppercase tracking-wide">
                Total Sales
              </div>
              <div
                className={`text-xs mt-2 font-bold border inline-block px-2 py-1 rounded-full ${
                  totalSales.growth >= 0
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-red-700 bg-red-50 border-red-200'
                }`}
              >
                {totalSales.growth >= 0 ? '↗' : '↘'} {totalSales.growth}% vs
                last month
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#C3A35E]/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl md:text-3xl font-serif font-bold text-[#6B1F2B] mb-2">
                {totalOrders.value}
              </div>
              <div className="text-sm md:text-base text-[#6B1F2B]/70 font-bold uppercase tracking-wide">
                Total Orders
              </div>
              <div
                className={`text-xs mt-2 font-bold border inline-block px-2 py-1 rounded-full ${
                  totalOrders.growth >= 0
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-red-700 bg-red-50 border-red-200'
                }`}
              >
                {totalOrders.growth >= 0 ? '↗' : '↘'} {totalOrders.growth}% vs
                last month
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#C3A35E]/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl md:text-3xl font-serif font-bold text-[#6B1F2B] mb-2">
                {currency.symbol}{' '}
                {Math.round(avgOrderValue.value).toLocaleString()}
              </div>
              <div className="text-sm md:text-base text-[#6B1F2B]/70 font-bold uppercase tracking-wide">
                Avg Order Value
              </div>
              <div
                className={`text-xs mt-2 font-bold border inline-block px-2 py-1 rounded-full ${
                  avgOrderValue.growth >= 0
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-red-700 bg-red-50 border-red-200'
                }`}
              >
                {avgOrderValue.growth >= 0 ? '↗' : '↘'}{' '}
                {avgOrderValue.growth}% vs last month
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#C3A35E]/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl md:text-3xl font-serif font-bold text-[#6B1F2B] mb-2">
                {satisfaction.value}%
              </div>
              <div className="text-sm md:text-base text-[#6B1F2B]/70 font-bold uppercase tracking-wide">
                Satisfaction
              </div>
              <div
                className={`text-xs mt-2 font-bold border inline-block px-2 py-1 rounded-full ${
                  satisfaction.growth >= 0
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-red-700 bg-red-50 border-red-200'
                }`}
              >
                {satisfaction.growth >= 0 ? '↗' : '↘'} {satisfaction.growth}%
                vs last month
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Sales Trend Chart */}
            <div className="bg-white p-8 rounded-2xl border border-[#C3A35E]/30 shadow-lg">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-8">
                Sales Trend (Last 6 Months)
              </h2>
              <div className="space-y-6">
                {salesTrend.map((item, index) => (
                  <div
                    key={item.month}
                    className="flex items-center space-x-4 group"
                  >
                    <div className="w-12 text-sm font-bold text-[#6B1F2B]/70">
                      {item.month}
                    </div>
                    <div className="flex-1 bg-[#F8F9FA] rounded-full h-3 relative overflow-hidden border border-[#C3A35E]/20">
                      <div
                        className="bg-[#6B1F2B] h-3 rounded-full transition-all duration-1000 group-hover:bg-[#50000b]"
                        style={{
                          width: `${
                            (item.sales /
                              Math.max(...salesTrend.map((s) => s.sales))) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-24 text-sm font-bold text-[#6B1F2B] text-right">
                      {currency.symbol} {(item.sales / 1000000).toFixed(1)}M
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Categories Pie Chart */}
            <div className="bg-white p-8 rounded-2xl border border-[#C3A35E]/30 shadow-lg">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-8">
                Sales by Category
              </h2>
              <div className="flex flex-col space-y-5">
                {productCategories.map((category, index) => (
                  <div
                    key={category.name}
                    className="flex items-center space-x-4"
                  >
                    <div
                      className="w-4 h-4 rounded-full shadow-sm ring-2 ring-[#C3A35E]/20"
                      style={{
                        backgroundColor:
                          category.color === '#ffffff'
                            ? '#e5e7eb'
                            : category.color,
                      }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-[#6B1F2B]/80">
                          {category.name}
                        </span>
                        <span className="text-sm font-bold text-[#6B1F2B]">
                          {category.value}%
                        </span>
                      </div>
                      <div className="w-full bg-[#F8F9FA] rounded-full h-2 border border-[#C3A35E]/20">
                        <div
                          className="h-2 rounded-full transition-all duration-1000"
                          style={{
                            backgroundColor:
                              category.color === '#ffffff'
                                ? '#9ca3af'
                                : category.color,
                            width: `${category.value}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white p-8 rounded-2xl border border-[#C3A35E]/30 shadow-lg">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-8">
                Top Customers
              </h2>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.name}
                    className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 text-white bg-[#6B1F2B] rounded-full flex items-center justify-center text-sm font-bold shadow-md border border-[#C3A35E]">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-[#6B1F2B]">
                          {customer.name}
                        </div>
                        <div className="text-sm text-[#6B1F2B]/70">
                          {customer.orders} orders
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#6B1F2B]">
                        {currency.symbol}{' '}
                        {(customer.revenue / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-[#6B1F2B]/50 uppercase tracking-wide">
                        Revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Performance */}
            <div className="bg-white p-8 rounded-2xl border border-[#C3A35E]/30 shadow-lg">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-8">
                Regional Performance
              </h2>
              <div className="space-y-4">
                {regionPerformance.map((region, index) => (
                  <div
                    key={region.region}
                    className="p-5 bg-[#F8F9FA] rounded-xl border border-[#C3A35E]/20 hover:border-[#C3A35E] hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-[#6B1F2B]">
                        {region.region}
                      </span>
                      <span
                        className={`text-sm font-bold border px-2 py-1 rounded-lg ${
                          region.growth >= 0
                            ? 'text-green-700 bg-green-50 border-green-200'
                            : 'text-red-700 bg-red-50 border-red-200'
                        }`}
                      >
                        {region.growth >= 0 ? '+' : ''}
                        {region.growth}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6B1F2B]/70 font-bold">
                        {currency.symbol}{' '}
                        {(region.sales / 1000000).toFixed(1)}M
                      </span>
                      <div className="w-24 bg-[#C3A35E]/10 rounded-full h-2 border border-[#C3A35E]/20">
                        <div
                          className="bg-[#6B1F2B] h-2 rounded-full"
                          style={{
                            width: `${
                              (region.sales /
                                Math.max(
                                  ...regionPerformance.map((r) => r.sales)
                                )) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}





