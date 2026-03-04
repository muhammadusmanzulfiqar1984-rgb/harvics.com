'use client'

import React, { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

export default function ProductCatalogue() {
  const locale = useLocale()
  const t = useTranslations('distributorPortal.products.catalogue')
  const tCommon = useTranslations('common')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCountry, setSelectedCountry] = useState('All')
  const [selectedChannel, setSelectedChannel] = useState('All')

  const products = [
    { sku: 'SKU-001', name: 'Premium Chocolate Bar 200g', category: 'Confectionery', packSize: '200g', mrp: 3.50, distributorPrice: 2.50, image: '/Images/logo.png' },
    { sku: 'SKU-002', name: 'Energy Drink 500ml', category: 'Beverages', packSize: '500ml', mrp: 2.50, distributorPrice: 1.80, image: '/Images/logo.png' },
    { sku: 'SKU-003', name: 'Snack Mix 150g', category: 'Snacks', packSize: '150g', mrp: 4.50, distributorPrice: 3.20, image: '/Images/logo.png' },
    { sku: 'SKU-004', name: 'Juice Box 250ml', category: 'Beverages', packSize: '250ml', mrp: 1.80, distributorPrice: 1.20, image: '/Images/logo.png' },
    { sku: 'SKU-005', name: 'Candy Pack 100g', category: 'Confectionery', packSize: '100g', mrp: 2.00, distributorPrice: 1.40, image: '/Images/logo.png' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#C3A35E]">{t('title')}</h1>

      {/* Filters */}
      <div className="bg-white p-4 border border-black200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">{t('category')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
            >
              <option value="All">{t('allCategories')}</option>
              <option value="Confectionery">{t('confectionery')}</option>
              <option value="Beverages">{t('beverages')}</option>
              <option value="Snacks">{t('snacks')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">{tCommon('country')}</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
            >
              <option value="All">{tCommon('allCountries')}</option>
              <option value="US">United States</option>
              <option value="PK">Pakistan</option>
              <option value="AE">UAE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">{t('channel')}</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
            >
              <option value="All">{t('allChannels')}</option>
              <option value="GT">{t('gt')}</option>
              <option value="MT">{t('mt')}</option>
              <option value="HoReCa">{t('horeca')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.sku} className="bg-white border border-black200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-white flex items-center justify-center p-4">
              <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="p-4">
              <div className="text-xs text-[#C3A35E]/90 mb-1">{product.sku}</div>
              <h3 className="font-semibold text-[#C3A35E]/90 mb-2">{product.name}</h3>
              <div className="text-sm text-[#C3A35E]/90 mb-2">Pack Size: {product.packSize}</div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-[#C3A35E]/90">MRP</div>
                  <div className="text-lg font-bold text-[#C3A35E]/90">${product.mrp.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#C3A35E]/90">Distributor Price</div>
                  <div className="text-lg font-bold text-white">${product.distributorPrice.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-white text-[#C3A35E]/90 px-4 py-2 font-semibold hover:bg-white transition-colors">
                  {t('details')}
                </button>
                <button className="flex-1 bg-white text-white px-4 py-2 font-semibold hover:opacity-90 transition-opacity">
                  {t('addToOrder')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

