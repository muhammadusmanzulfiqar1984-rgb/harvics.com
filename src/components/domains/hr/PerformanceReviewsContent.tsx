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
      const [reviewsRes, summaryRes] = await Promise.all([
        apiClient.request('/wave5/perf-reviews'),
        apiClient.request('/hr/summary'),
      ])

      const rawReviews = (reviewsRes?.data as any)
      const reviews: any[] = Array.isArray(rawReviews) ? rawReviews : (rawReviews?.data ?? [])
      const summary = (summaryRes?.data as any) || {}
      const totalEmployees = summary.totalEmployees || 0

      const reviewsCompleted = reviews.filter((r) => r.overallScore > 0 || r.mgrRating > 0).length
      const pending = Math.max(0, totalEmployees - reviewsCompleted)
      const scored = reviews.filter((r) => r.overallScore > 0)
      const averageRating = scored.length
        ? scored.reduce((s, r) => s + Number(r.overallScore), 0) / scored.length
        : null
      const topPerformers = reviews.filter((r) => r.mgrRating >= 4).length

      setPerformanceData({
        reviewsCompleted,
        pending,
        averageRating,
        topPerformers,
        reviews,
      })
    } catch (error) {
      console.error('Error loading performance:', error)
      setPerformanceData({
        reviewsCompleted: 0,
        pending: 0,
        averageRating: null,
        topPerformers: 0,
        reviews: [],
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5E5EA]"></div>
      </div>
    )
  }

  const reviewsCompleted = performanceData?.reviewsCompleted || 0
  const pending = performanceData?.pending || 0
  const averageRating = performanceData?.averageRating
  const topPerformers = performanceData?.topPerformers || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Performance Reviews</h3>
        <button className="px-4 py-2 bg-harvics-burgundy text-white text-xs font-medium rounded-xl hover:bg-[#5a1a24] transition-colors">
          + New Review
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Completed"
          value={reviewsCompleted}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>}
        />
        <KPICard
          label="Pending"
          value={pending}
          icon="⏳"
        />
        <KPICard
          label="Avg. Rating"
          value={averageRating != null ? averageRating.toFixed(1) : '—'}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 8.5s.6 1.5 2.5 1.5 2.5-1.5 2.5-1.5"/><circle cx="6" cy="6.5" r="0.5" fill="currentColor"/><circle cx="10" cy="6.5" r="0.5" fill="currentColor"/></svg>}
        />
        <KPICard
          label="Top Performers"
          value={topPerformers}
          icon="🏆"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Performance Reviews</h4>
        <p className="text-black mb-4">Employee performance evaluation and assessment records.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Employee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Period</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Rating</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Potential</th>
              </tr>
            </thead>
            <tbody>
              {(performanceData?.reviews || []).map((rev: any) => (
                <tr key={rev.id} className="hover:bg-[#F5F5F7] transition-colors">
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{rev.employeeId || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{rev.period || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">
                    {rev.overallScore > 0 ? `${Number(rev.overallScore).toFixed(1)} ⭐` : '—'}
                  </td>
                  <td className="py-2">
                    <span className="px-2 py-1 rounded text-xs bg-[#F5F5F7] text-[#1A1A1A]">{rev.potential || '—'}</span>
                  </td>
                </tr>
              ))}
              {(!performanceData?.reviews || performanceData.reviews.length === 0) && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-500">No performance reviews yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
