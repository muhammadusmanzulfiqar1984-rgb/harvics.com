'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface OrderListContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

interface Order {
  id: string
  customer: string
  amount: number
  status: string
  date: string
  city?: string
  channel?: string
}

export default function OrderListContent({ persona, locale }: OrderListContentProps) {
  const t = useTranslations('crm')
  const { selectedCountry } = useCountry()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [countryData, setCountryData] = useState<any>(null)

  useEffect(() => {
    loadOrders()
  }, [selectedCountry, persona])

  const loadOrders = async () => {
    setLoading(true)
    try {
      // Load orders data - use BFF endpoint or domain endpoint
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      
      const ordersData = (response as any)?.data?.data?.orders?.orders || (response as any)?.data?.orders?.orders || []
      setOrders(Array.isArray(ordersData) ? ordersData : [])

      // Load country data for currency
      if (selectedCountry) {
        const countryResponse = await apiClient.getCountryProfile(selectedCountry)
        setCountryData((countryResponse as any)?.data?.data || null)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      // Fallback demo data
      setOrders([
        { id: 'ORD-001', customer: 'Customer A', amount: 125000, status: 'completed', date: '2024-01-15', city: 'Dubai', channel: 'Retail' },
        { id: 'ORD-002', customer: 'Customer B', amount: 89000, status: 'pending', date: '2024-01-16', city: 'Abu Dhabi', channel: 'Wholesale' },
        { id: 'ORD-003', customer: 'Customer C', amount: 156000, status: 'in_transit', date: '2024-01-17', city: 'Sharjah', channel: 'Retail' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const totalOrders = orders.length
  const pending = orders.filter(o => o.status?.toLowerCase() === 'pending').length
  const completed = orders.filter(o => o.status?.toLowerCase() === 'completed').length
  const inTransit = orders.filter(o => o.status?.toLowerCase().includes('transit')).length
  const currencySymbol = countryData?.currency?.symbol || '$'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Order Management</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + New Order
        </button>
      </div>

      {/* Country Info */}
      {countryData && (
        <div className="bg-white/10 rounded-lg p-4 border border-[#C3A35E]/30">
          <div className="text-sm text-black">
            <strong>Country:</strong> {countryData.countryName || selectedCountry} | 
            <strong> Currency:</strong> {countryData.currency?.symbol || '$'} {countryData.currency?.code || 'USD'}
          </div>
        </div>
      )}

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Orders"
          value={totalOrders}
          icon="📦"
        />
        <KPICard
          label="Pending"
          value={pending}
          icon="⏳"
        />
        <KPICard
          label="Completed"
          value={completed}
          icon="✅"
        />
        <KPICard
          label="In Transit"
          value={inTransit}
          icon="🚚"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-black200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F2F2F2]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">City</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Channel</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-black">#{order.id}</td>
                    <td className="px-4 py-3 text-sm text-black">{order.customer}</td>
                    <td className="px-4 py-3 text-sm text-black">{order.city || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-black">{order.channel || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-black">
                      {currencySymbol}{(order.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-black">{order.date}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="text-[#C3A35E] hover:underline">View</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

