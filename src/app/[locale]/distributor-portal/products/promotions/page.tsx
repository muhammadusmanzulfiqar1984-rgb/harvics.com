'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { getProductImages } from '@/utils/harvicsProductImages'
import Image from 'next/image'

export default function Promotions() {
  const locale = useLocale()
  
  // Get product images for promotions
  const promotionProductImages = getProductImages(3)

  const promotions = [
    {
      name: 'Summer Bundle Promotion',
      startDate: '2025-02-01',
      endDate: '2025-03-31',
      eligibleSKUs: ['Premium Chocolate Bar', 'Energy Drink', 'Snack Mix'],
      benefit: '15% extra margin on bundle orders',
      status: 'active'
    },
    {
      name: 'New Year Special',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      eligibleSKUs: ['Juice Box', 'Candy Pack'],
      benefit: '10% discount + free shipping',
      status: 'active'
    },
    {
      name: 'Volume Discount Q1',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      eligibleSKUs: ['All SKUs'],
      benefit: '5% discount on orders above $50k',
      status: 'active'
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#C3A35E]">Promotions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo, index) => (
          <div key={index} className="bg-white border border-black200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="relative h-40 mb-4 overflow-hidden">
              <Image
                src={promotionProductImages[index]}
                alt={`Harvics ${promo.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-[#C3A35E]/90">{promo.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                promo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-white text-[#C3A35E]/90'
              }`}>
                {promo.status}
              </span>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs text-[#C3A35E]/90 mb-1">Validity</div>
                <div className="text-sm font-semibold text-[#C3A35E]/90">
                  {promo.startDate} - {promo.endDate}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#C3A35E]/90 mb-1">Eligible SKUs</div>
                <div className="flex flex-wrap gap-2">
                  {promo.eligibleSKUs.map((sku, i) => (
                    <span key={i} className="px-2 py-1 bg-white/20 text-white rounded text-xs font-semibold">
                      {sku}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#C3A35E]/90 mb-1">Extra Benefit</div>
                <div className="text-sm font-semibold text-white">{promo.benefit}</div>
              </div>
            </div>
            <button className="w-full bg-white text-white px-4 py-2 font-semibold hover:opacity-90 transition-opacity">
              Join Promo
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

