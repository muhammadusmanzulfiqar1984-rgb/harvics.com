'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface PerformanceReviewsContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function PerformanceReviewsContent({ persona, locale }: PerformanceReviewsContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<any>(null)

  useEffect(() => {
    loadPerformance()
  }, [selectedCountry, persona])

  const loadPerformance = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      setPerformanceData({
        reviewsCompleted: 3200,
        pending: 1300,
        averageRating: 4.2,
        topPerformers: 450
      })
    } catch (error) {
      console.error('Error loading performance:', error)
      setPerformanceData({
        reviewsCompleted: 3200,
        pending: 1300,
        averageRating: 4.2,
        topPerformers: 450
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
      </div>
    )
  }

  const reviewsCompleted = performanceData?.reviewsCompleted || 0
  const pending = performanceData?.pending || 0
  const averageRating = performanceData?.averageRating || 0
  const topPerformers = performanceData?.topPerformers || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Performance Reviews</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + New Review
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Completed"
          value={reviewsCompleted}
          icon="✅"
        />
        <KPICard
          label="Pending"
          value={pending}
          icon="⏳"
        />
        <KPICard
          label="Avg. Rating"
          value={averageRating.toFixed(1)}
          icon="⭐"
        />
        <KPICard
          label="Top Performers"
          value={topPerformers}
          icon="🏆"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Performance Reviews</h4>
        <p className="text-black mb-4">Employee performance evaluation and assessment records.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black200">
                <th className="text-left py-2 font-medium text-black">Employee</th>
                <th className="text-left py-2 font-medium text-black">Department</th>
                <th className="text-left py-2 font-medium text-black">Rating</th>
                <th className="text-left py-2 font-medium text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">John Doe</td>
                <td className="py-2 text-black">Sales</td>
                <td className="py-2 text-black">4.5 ⭐</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Completed</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">Jane Smith</td>
                <td className="py-2 text-black">Logistics</td>
                <td className="py-2 text-black">4.3 ⭐</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Completed</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">Mike Johnson</td>
                <td className="py-2 text-black">Finance</td>
                <td className="py-2 text-black">-</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

