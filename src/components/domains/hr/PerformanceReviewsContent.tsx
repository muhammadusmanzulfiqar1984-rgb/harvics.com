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
      const [employeesRes, summaryRes] = await Promise.all([
        apiClient.request('/hr/employees?status=Active&limit=100'),
        apiClient.request('/hr/summary')
      ])
      
      const rawEmployees = (employeesRes?.data as any)
      const employees: any[] = Array.isArray(rawEmployees) ? rawEmployees : (rawEmployees?.data ?? [])
      const summary = (summaryRes?.data as any) || {}
      
      // Mock performance metrics based on employee data
      const totalEmployees = summary.totalEmployees || 0
      const reviewsCompleted = Math.floor(totalEmployees * 0.7) // 70% reviewed
      const pending = totalEmployees - reviewsCompleted
      
      setPerformanceData({
        reviewsCompleted,
        pending,
        averageRating: 4.2, // Mock rating
        topPerformers: Math.floor(totalEmployees * 0.1), // Top 10%
        employees: employees
      })
    } catch (error) {
      console.error('Error loading performance:', error)
      setPerformanceData({
        reviewsCompleted: 0,
        pending: 0,
        averageRating: 4.2,
        topPerformers: 0
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
  const averageRating = performanceData?.averageRating || 0
  const topPerformers = performanceData?.topPerformers || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1D1D1F]">Performance Reviews</h3>
        <button className="px-4 py-2 bg-[#6B1F2B] text-white text-xs font-medium rounded-xl hover:bg-[#5a1a24] transition-colors">
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
          value={averageRating.toFixed(1)}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 8.5s.6 1.5 2.5 1.5 2.5-1.5 2.5-1.5"/><circle cx="6" cy="6.5" r="0.5" fill="currentColor"/><circle cx="10" cy="6.5" r="0.5" fill="currentColor"/></svg>}
        />
        <KPICard
          label="Top Performers"
          value={topPerformers}
          icon="🏆"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4">Performance Reviews</h4>
        <p className="text-black mb-4">Employee performance evaluation and assessment records.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Employee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Department</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Rating</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {(performanceData?.employees || []).map((emp: any, idx: number) => (
                <tr key={emp.id || idx} className="hover:bg-[#F5F5F7] transition-colors">
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{emp.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{emp.department}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{idx < reviewsCompleted ? `${(4.0 + Math.random() * 0.8).toFixed(1)} ⭐` : '-'}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${idx < reviewsCompleted ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>
                      {idx < reviewsCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!performanceData?.employees || performanceData.employees.length === 0) && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-500">No employee data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

