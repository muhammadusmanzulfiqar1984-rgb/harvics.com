'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function OrderReview() {
  const locale = useLocale()

  // Mock order data
  const order = {
    distributorName: 'Costco West',
    billingAddress: '123 Business Street, Los Angeles, CA 90001',
    deliveryAddress: '456 Warehouse Lane, Los Angeles, CA 90002',
    paymentTerms: 'Net 30',
    shippingTerms: 'FOB Warehouse',
    expectedDeliveryDate: '2025-01-30',
    items: [
      { sku: 'SKU-001', name: 'Premium Chocolate Bar 200g', qty: 50, unitPrice: 2.50, cartonSize: 24, total: 3000 },
      { sku: 'SKU-002', name: 'Energy Drink 500ml', qty: 100, unitPrice: 1.80, cartonSize: 12, total: 2160 },
    ]
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.total, 0)
  const freight = 0
  const total = subtotal + freight

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#C3A35E]">Review Order</h1>
        <Link
          href={`/${locale}/distributor-portal/orders/new`}
          className="text-white hover:underline"
        >
          ← Back to Edit
        </Link>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg border border-black200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#C3A35E] mb-4">Order Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-1">Distributor Name</label>
            <div className="text-[#C3A35E]/90">{order.distributorName}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-1">Payment Terms</label>
            <div className="text-[#C3A35E]/90">{order.paymentTerms}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-1">Billing Address</label>
            <div className="text-[#C3A35E]/90">{order.billingAddress}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-1">Shipping Terms</label>
            <div className="text-[#C3A35E]/90">{order.shippingTerms}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-1">Delivery Address</label>
            <select className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black">
              <option>{order.deliveryAddress}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-1">Expected Delivery Date</label>
            <div className="text-[#C3A35E]/90">{order.expectedDeliveryDate}</div>
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="bg-white rounded-lg border border-black200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Line Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.sku}>
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">{item.sku}</td>
                  <td className="px-6 py-4 text-[#C3A35E]/90">{item.name}</td>
                  <td className="px-6 py-4 text-[#C3A35E]/90">{item.qty} cartons ({item.qty * item.cartonSize} units)</td>
                  <td className="px-6 py-4 text-[#C3A35E]/90">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 font-semibold">${item.total.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-white">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-white">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right font-semibold text-[#C3A35E]/90">Subtotal:</td>
                <td className="px-6 py-4 font-bold text-[#C3A35E]/90">${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right font-semibold text-[#C3A35E]/90">Est. Freight:</td>
                <td className="px-6 py-4 font-bold text-[#C3A35E]/90">${freight.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right text-lg font-bold text-[#C3A35E]/90">Total:</td>
                <td className="px-6 py-4 text-lg font-bold text-white">${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button className="flex-1 bg-white text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Submit Order
        </button>
        <Link
          href={`/${locale}/distributor-portal/orders/new`}
          className="flex-1 bg-white text-[#C3A35E]/90 px-8 py-3 rounded-lg font-semibold hover:bg-white transition-colors text-center"
        >
          Back / Edit
        </Link>
        <button className="flex-1 bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Cancel
        </button>
      </div>
    </div>
  )
}

