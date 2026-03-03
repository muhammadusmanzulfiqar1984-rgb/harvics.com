'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function PriceLists() {
  const locale = useLocale()
  const [selectedCountry, setSelectedCountry] = useState('US')
  const [selectedChannel, setSelectedChannel] = useState('All')

  const priceList = [
    { sku: 'SKU-001', packSize: '200g', mrp: 3.50, distributorPrice: 2.50, margin: 28.6, vat: 5, effectiveFrom: '2025-01-01' },
    { sku: 'SKU-002', packSize: '500ml', mrp: 2.50, distributorPrice: 1.80, margin: 28.0, vat: 5, effectiveFrom: '2025-01-01' },
    { sku: 'SKU-003', packSize: '150g', mrp: 4.50, distributorPrice: 3.20, margin: 28.9, vat: 5, effectiveFrom: '2025-01-01' },
    { sku: 'SKU-004', packSize: '250ml', mrp: 1.80, distributorPrice: 1.20, margin: 33.3, vat: 5, effectiveFrom: '2025-01-01' },
    { sku: 'SKU-005', packSize: '100g', mrp: 2.00, distributorPrice: 1.40, margin: 30.0, vat: 5, effectiveFrom: '2025-01-01' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#C3A35E]">Price Lists</h1>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Download Excel
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Download PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-black200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
            >
              <option value="US">United States</option>
              <option value="PK">Pakistan</option>
              <option value="AE">UAE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Channel</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
            >
              <option value="All">All Channels</option>
              <option value="GT">GT</option>
              <option value="MT">MT</option>
              <option value="HoReCa">HoReCa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Price List Table */}
      <div className="bg-white rounded-lg border border-black200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Pack Size</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">MRP</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Distributor Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Margin %</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">VAT/GST</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Effective From</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {priceList.map((item) => (
                <tr key={item.sku} className="hover:bg-white">
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">{item.sku}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{item.packSize}</td>
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">${item.mrp.toFixed(2)}</td>
                  <td className="px-6 py-4 font-semibold text-white">${item.distributorPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">{item.margin.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{item.vat}%</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{item.effectiveFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

