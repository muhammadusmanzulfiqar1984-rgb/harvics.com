'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { apiClient } from '@/lib/api'
import { saveCart, type CartLine } from '@/lib/distributorPortal'

type ProductRow = {
  sku: string
  name: string
  packSize: string
  cartonSize: number
  unitPrice: number
  image: string
}

export default function PlaceNewOrder() {
  const locale = useLocale()
  const t = useTranslations('distributorPortal.orders.newOrder')
  const [selectedCountry, setSelectedCountry] = useState('US')
  const [selectedWarehouse, setSelectedWarehouse] = useState('wh_us_west')
  const [orderType, setOrderType] = useState('Mixed')
  const [cart, setCart] = useState<Array<{sku: string, name: string, packSize: string, cartonSize: number, unitPrice: number, quantity: number}>>([])
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    void loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const res = await apiClient.request('/inventory?limit=100')
      const payload = (res?.data as any)
      const rows: any[] = Array.isArray(payload) ? payload : (payload?.data ?? [])

      const mapped = await Promise.all(rows.map(async (item) => {
        let unitPrice = Number(item.unitCost) || 0
        try {
          const priceRes = await apiClient.request(`/wave5/price-lists/lookup?sku=${encodeURIComponent(item.sku)}&qty=1`)
          const priceData = (priceRes?.data as any)?.data ?? priceRes?.data
          if (priceData?.unitPrice != null) unitPrice = Number(priceData.unitPrice)
        } catch {
          // keep unitCost fallback
        }
        return {
          sku: item.sku,
          name: item.description || item.name || item.sku,
          packSize: item.packSize || item.uom || '—',
          cartonSize: Number(item.cartonSize) || 24,
          unitPrice,
          image: '/assets/brand/photo/logo.png',
        }
      }))

      setProducts(mapped)
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const addToCart = (product: typeof products[0], qty: number) => {
    const existing = cart.findIndex(p => p.sku === product.sku)
    let next: typeof cart
    if (existing >= 0) {
      next = [...cart]
      next[existing].quantity = qty
    } else {
      next = [...cart, { ...product, quantity: qty }]
    }
    setCart(next)
    saveCart(next as CartLine[])
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.cartonSize), 0)

  return (
    <div className="space-y-6">
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-harvics-gold">Place New Order</h1>
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
            <label className="block text-sm font-semibold text-harvics-gold/90 mb-2">{t('selectCountry')}</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="US">United States</option>
              <option value="PK">Pakistan</option>
              <option value="AE">UAE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-harvics-gold/90 mb-2">Select Warehouse</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="wh_us_west">US West Warehouse</option>
              <option value="wh_us_east">US East Warehouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-harvics-gold/90 mb-2">Order Type</label>
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
            <h2 className="text-lg font-bold text-harvics-gold/90">Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-harvics-gold/90">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-harvics-gold/90">SKU Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-harvics-gold/90">Pack Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-harvics-gold/90">Carton Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-harvics-gold/90">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-harvics-gold/90">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-harvics-gold/90">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingProducts ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-harvics-gold/90">Loading products…</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-harvics-gold/90">No inventory SKUs available — add stock in Inventory OS.</td></tr>
                ) : products.map((product) => {
                  const cartItem = cart.find(c => c.sku === product.sku)
                  const qty = cartItem?.quantity || 0
                  return (
                    <tr key={product.sku}>
                      <td className="px-4 py-3">
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-contain" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-harvics-gold/90">{product.name}</div>
                        <div className="text-xs text-harvics-gold/90">{product.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-harvics-gold/90">{product.packSize}</td>
                      <td className="px-4 py-3 text-sm text-harvics-gold/90">{product.cartonSize}</td>
                      <td className="px-4 py-3 text-sm font-semibold">${product.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => addToCart(product, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-black"
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
        <div className="bg-gradient-to-br from-harvics-burgundy to-[#ffffff] p-6 text-white shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-bold">Harvey Suggestions</h2>
          </div>
          <div className="space-y-4 text-sm">
            {cart.length === 0 ? (
              <p className="text-harvics-gold/90">Add products to your cart for order suggestions.</p>
            ) : (
              <div>
                <div className="font-semibold mb-2">Cart ({cart.length} SKU{cart.length !== 1 ? 's' : ''})</div>
                <ul className="space-y-1 text-harvics-gold/90">
                  {cart.filter((c) => c.quantity > 0).map((c) => (
                    <li key={c.sku}>• {c.name}: {c.quantity} cartons</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary & Actions */}
      <div className="bg-white border border-black200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-harvics-gold/90">Order Summary</h2>
          <button
            onClick={() => setCart([])}
            className="text-sm text-red-600 hover:underline"
          >
            Clear Cart
          </button>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-harvics-gold/90">Subtotal:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-harvics-gold/90">Est. Freight:</span>
            <span className="font-semibold">$0.00</span>
          </div>
          <div className="border-t border-black200 pt-2 flex justify-between">
            <span className="text-lg font-bold text-harvics-gold/90">Total:</span>
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

