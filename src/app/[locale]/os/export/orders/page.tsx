'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

export default function ExportOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDomainExportOrders()
      if (response?.data) {
        setOrders(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error loading export orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800'
      case 'Shipped': return 'bg-blue-100 text-blue-800'
      case 'In Transit': return 'bg-[#C3A35E]/20 text-[#C3A35E]'
      case 'Pending Shipment': return 'bg-white text-[#C3A35E]/90'
      default: return 'bg-white text-[#C3A35E]/90'
    }
  }

  return (
    <>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Export Orders</h1>
            <p className="text-[#C3A35E]/90">Manage all export orders and track shipments</p>
          </div>
          <button className="bg-white text-white px-4 py-2 rounded-lg hover:bg-[#5a000c] transition-colors">
            + New Export Order
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-black200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">ETD</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-[#C3A35E]/90">
                    No export orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{order.destination}</td>
                    <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{order.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{order.quantity?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">${order.value?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{order.etd}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/os/export/orders/${order.id}`} className="text-[#C3A35E]/90 hover:text-[#5a000c]">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

