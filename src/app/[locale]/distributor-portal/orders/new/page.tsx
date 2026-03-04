'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function PlaceNewOrder() {
  const locale = useLocale()
  const t = useTranslations('distributorPortal.orders.newOrder')
  const tCommon = useTranslations('common')
  const [selectedCountry, setSelectedCountry] = useState('US')
  const [selectedWarehouse, setSelectedWarehouse] = useState('wh_us_west')
  const [orderType, setOrderType] = useState('Mixed')
  const [cart, setCart] = useState<Array<{sku: string, name: string, packSize: string, cartonSize: number, unitPrice: number, quantity: number}>>([])

  // Mock products
  const products = [
    { sku: 'SKU-001', name: 'Premium Chocolate Bar 200g', packSize: '200g', cartonSize: 24, unitPrice: 2.50, image: '/Images/logo.png' },
    { sku: 'SKU-002', name: 'Energy Drink 500ml', packSize: '500ml', cartonSize: 12, unitPrice: 1.80, image: '/Images/logo.png' },
    { sku: 'SKU-003', name: 'Snack Mix 150g', packSize: '150g', cartonSize: 30, unitPrice: 3.20, image: '/Images/logo.png' },
  ]

  const addToCart = (product: typeof products[0], qty: number) => {
    const existing = cart.findIndex(p => p.sku === product.sku)
    if (existing >= 0) {
      const newCart = [...cart]
      newCart[existing].quantity = qty
      setCart(newCart)
    } else {
      setCart([...cart, { ...product, quantity: qty }])
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.cartonSize), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#C3A35E]">Place New Order</h1>
        <Link
          href={`/${locale}/distributor-portal/orders/history`}
          className="text-white hover:underline"
        >
          View Order History
        </Link>
      </div>

      {/* Filters/Top Controls */}
      <div className="bg-white p-4 border border-black200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">{t('selectCountry')}</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="US">United States</option>
              <option value="PK">Pakistan</option>
              <option value="AE">UAE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Select Warehouse</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="wh_us_west">US West Warehouse</option>
              <option value="wh_us_east">US East Warehouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Order Type</label>
            <div className="flex space-x-4">
              {['Container', 'Mixed', 'Custom'].map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    value={type}
                    checked={orderType === type}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Table */}
        <div className="lg:col-span-2 bg-white border border-black200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-black200">
            <h2 className="text-lg font-bold text-[#C3A35E]/90">Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">SKU Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Pack Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Carton Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => {
                  const cartItem = cart.find(c => c.sku === product.sku)
                  const qty = cartItem?.quantity || 0
                  return (
                    <tr key={product.sku}>
                      <td className="px-4 py-3">
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-contain" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#C3A35E]/90">{product.name}</div>
                        <div className="text-xs text-[#C3A35E]/90">{product.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#C3A35E]/90">{product.packSize}</td>
                      <td className="px-4 py-3 text-sm text-[#C3A35E]/90">{product.cartonSize}</td>
                      <td className="px-4 py-3 text-sm font-semibold">${product.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => addToCart(product, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-black300 rounded focus:ring-2 focus:ring-black"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        ${(qty * product.unitPrice * product.cartonSize).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right-side Panel - Harvey Suggestions */}
        <div className="bg-gradient-to-br from-[#6B1F2B] to-[#ffffff] p-6 text-white shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-bold">Harvey Suggestions</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-semibold mb-2">Recommended Quantity:</div>
              <ul className="space-y-1 text-[#C3A35E]/90">
                <li>• Premium Chocolate Bar: 50 cartons</li>
                <li>• Energy Drink: 100 cartons</li>
                <li>• Snack Mix: 75 cartons</li>
              </ul>
            </div>
            <div className="border-t border-[#C3A35E]/20 pt-4">
              <div className="font-semibold mb-2">Fill Your Container:</div>
              <p className="text-[#C3A35E]/90">You have space for 225 more cartons to maximize container efficiency.</p>
            </div>
            <div className="border-t border-[#C3A35E]/20 pt-4">
              <div className="font-semibold mb-2">Bundle Suggestion:</div>
              <p className="text-[#C3A35E]/90">Summer Bundle: Mix beverages + snacks for 15% discount on qualifying orders.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary & Actions */}
      <div className="bg-white border border-black200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#C3A35E]/90">Order Summary</h2>
          <button
            onClick={() => setCart([])}
            className="text-sm text-red-600 hover:underline"
          >
            Clear Cart
          </button>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-[#C3A35E]/90">Subtotal:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#C3A35E]/90">Est. Freight:</span>
            <span className="font-semibold">$0.00</span>
          </div>
          <div className="border-t border-black200 pt-2 flex justify-between">
            <span className="text-lg font-bold text-[#C3A35E]/90">Total:</span>
            <span className="text-lg font-bold text-white">${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex space-x-4">
          <Link
            href={`/${locale}/distributor-portal/orders/new/review`}
            className="flex-1 bg-white text-white px-6 py-3 font-semibold text-center hover:opacity-90 transition-opacity"
          >
            Review Order
          </Link>
        </div>
      </div>
    </div>
  )
}

