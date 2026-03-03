'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface CompetitorStats {
  totalProducts: number
  byBrand: Array<{ brand: string; count: number }>
  byCountry: Array<{ country: string; count: number }>
  byCategory: Array<{ category: string; count: number }>
}

export default function CompetitorDashboardPage() {
  const [stats, setStats] = useState<CompetitorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await (apiClient as any).getCompetitorStats()
      if (response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Competitor Dashboard</h1>
        <p className="text-white/90">Analytics and insights on competitor products</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/90">Loading statistics...</p>
        </div>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-black200 p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-2">Total Products</h3>
              <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
            </div>
            <div className="bg-white rounded-lg border border-black200 p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-2">Brands Tracked</h3>
              <p className="text-3xl font-bold text-white">{stats.byBrand.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-black200 p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-2">Countries</h3>
              <p className="text-3xl font-bold text-white">{stats.byCountry.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-black200 p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-2">Categories</h3>
              <p className="text-3xl font-bold text-white">{stats.byCategory.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Brand */}
            <div className="bg-white rounded-lg border border-black200 p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Products by Brand</h3>
              <div className="space-y-3">
                {stats.byBrand.slice(0, 10).map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/90">{item.brand}</span>
                      <span className="font-semibold text-white/90">{item.count}</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${(item.count / stats.totalProducts) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Country */}
            <div className="bg-white rounded-lg border border-black200 p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Products by Country</h3>
              <div className="space-y-3">
                {stats.byCountry.slice(0, 10).map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/90">{item.country}</span>
                      <span className="font-semibold text-white/90">{item.count}</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${(item.count / stats.totalProducts) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Category */}
            <div className="bg-white rounded-lg border border-black200 p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Products by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.byCategory.map((item, idx) => (
                  <div key={idx} className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-white">{item.count}</div>
                    <div className="text-sm text-white/90 mt-1">{item.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-white/90">No statistics available</p>
        </div>
      )}
    </div>
  )
}

