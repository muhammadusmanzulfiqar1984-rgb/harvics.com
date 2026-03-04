'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function CompetitorReporting() {
  const locale = useLocale()
  const [formData, setFormData] = useState({
    competitorBrand: '',
    sku: '',
    observedPrice: '',
    promoType: '',
    retailerName: '',
    city: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Competitor report submitted successfully!')
    // Reset form
    setFormData({
      competitorBrand: '',
      sku: '',
      observedPrice: '',
      promoType: '',
      retailerName: '',
      city: '',
      notes: ''
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#C3A35E]">Competitor Reporting</h1>

      <div className="bg-white border border-black200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Competitor Brand *</label>
              <input
                required
                type="text"
                value={formData.competitorBrand}
                onChange={(e) => setFormData({...formData, competitorBrand: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
                placeholder="e.g., Nestle, Cadbury"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">SKU *</label>
              <input
                required
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
                placeholder="Product SKU"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Observed Price (USD) *</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.observedPrice}
                onChange={(e) => setFormData({...formData, observedPrice: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Promo Type *</label>
              <select
                required
                value={formData.promoType}
                onChange={(e) => setFormData({...formData, promoType: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
              >
                <option value="">Select Type</option>
                <option value="Discount">Discount</option>
                <option value="Bundle">Bundle</option>
                <option value="Display">Display</option>
                <option value="Free goods">Free goods</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Retailer/Outlet Name *</label>
              <input
                required
                type="text"
                value={formData.retailerName}
                onChange={(e) => setFormData({...formData, retailerName: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
                placeholder="Store name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">City *</label>
              <input
                required
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
                placeholder="City name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Notes</label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
                placeholder="Additional observations..."
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-white text-white px-8 py-3 font-semibold hover:opacity-90 transition-opacity"
            >
              Submit Report
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                competitorBrand: '',
                sku: '',
                observedPrice: '',
                promoType: '',
                retailerName: '',
                city: '',
                notes: ''
              })}
              className="bg-white text-[#C3A35E]/90 px-8 py-3 font-semibold hover:bg-white transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

