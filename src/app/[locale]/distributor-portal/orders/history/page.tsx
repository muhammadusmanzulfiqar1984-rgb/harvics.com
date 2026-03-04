'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function OrderHistory() {
  const locale = useLocale()
  const [dateRange, setDateRange] = useState('all')
  const [status, setStatus] = useState('All')
  const [country, setCountry] = useState('All')

  const orders = [
    { id: 'ORD-12345', date: '2025-01-15', country: 'US', warehouse: 'US West', total: 15000, status: 'Delivered', eta: '2025-01-20' },
    { id: 'ORD-12346', date: '2025-01-16', country: 'US', warehouse: 'US East', total: 8500, status: 'Dispatched', eta: '2025-01-22' },
    { id: 'ORD-12347', date: '2025-01-17', country: 'PK', warehouse: 'PK North', total: 22000, status: 'Processing', eta: '2025-01-25' },
    { id: 'ORD-12348', date: '2025-01-18', country: 'AE', warehouse: 'AE Dubai', total: 12500, status: 'Confirmed', eta: '2025-01-28' },
    { id: 'ORD-12349', date: '2025-01-19', country: 'US', warehouse: 'US West', total: 18000, status: 'Draft', eta: '-' },
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-800'
      case 'Dispatched': return 'bg-blue-100 text-blue-800'
      case 'Processing': return 'bg-[#C3A35E]/20 text-[#C3A35E]'
      case 'Confirmed': return 'bg-purple-100 text-purple-800'
      case 'Draft': return 'bg-white text-[#C3A35E]/90'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-white text-[#C3A35E]/90'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#C3A35E]">Order History</h1>
        <Link
          href={`/${locale}/distributor-portal/orders/new`}
          className="bg-[#C3A35E] text-[#6B1F2B] px-6 py-2 font-semibold hover:opacity-90 transition-opacity"
        >
          Place New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-black200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
            >
              <option value="All">All</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
            >
              <option value="All">All</option>
              <option value="US">United States</option>
              <option value="PK">Pakistan</option>
              <option value="AE">UAE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-black200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Country / Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">ETA</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white">
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">
                    <div>{order.country}</div>
                    <div className="text-xs text-[#C3A35E]/90">{order.warehouse}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">${order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{order.eta}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/${locale}/distributor-portal/orders/${order.id}`}
                      className="text-white hover:underline text-sm font-semibold"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

