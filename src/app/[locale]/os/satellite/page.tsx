'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useCountry } from '@/contexts/CountryContext'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import KPICard from '@/components/shared/KPICard'
import { apiClient } from '@/lib/api'

export default function SatelliteOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)

  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  const countryCode = selectedCountry || 'AE'

  useEffect(() => {
    loadData()
  }, [countryCode])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await apiClient.request(`/satellite/whitespaces/${countryCode}`)
      setReport(res?.data || res || {})
    } catch (error) {
      console.error('Error loading satellite data:', error)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  const summary = report?.summary || {}
  const tiles = report?.tiles || []
  const whitespaces = tiles.filter((t: any) => t.whiteSpace)

  return (
    <OSDomainPageWrapper
      title="Satellite Intelligence"
      description="Market whitespace detection, coverage analysis, and expansion opportunities"
      domain="satellite"
      portal={portal as any}
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard label="Total Tiles" value={summary.totalTiles || 0} icon="🛰️" />
            <KPICard label="Coverage Rate" value={`${summary.coverageRate || 0}%`} icon="📡" />
            <KPICard label="White Spaces" value={summary.whiteSpaces || 0} icon="⚪" />
            <KPICard label="High Density" value={summary.highDensity || 0} icon="🟢" />
          </div>

          {/* Coverage Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">Coverage Breakdown ({countryCode})</h4>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">High Density</p>
                <p className="text-2xl font-bold text-green-700">{summary.highDensity || 0}</p>
                <p className="text-xs text-gray-500">≥70% coverage</p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">Medium Density</p>
                <p className="text-2xl font-bold text-yellow-700">{summary.mediumDensity || 0}</p>
                <p className="text-xs text-gray-500">45-70% coverage</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">Low Density</p>
                <p className="text-2xl font-bold text-red-700">{summary.lowDensity || 0}</p>
                <p className="text-xs text-gray-500">&lt;45% coverage</p>
              </div>
            </div>
          </div>

          {/* Whitespace Opportunities Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">Market Whitespaces ({whitespaces.length} detected)</h4>
            {whitespaces.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-black">Tile ID</th>
                      <th className="text-left py-2 font-medium text-black">Territory</th>
                      <th className="text-left py-2 font-medium text-black">Population</th>
                      <th className="text-left py-2 font-medium text-black">Retailers</th>
                      <th className="text-left py-2 font-medium text-black">Coverage</th>
                      <th className="text-left py-2 font-medium text-black">Coordinates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whitespaces.slice(0, 15).map((tile: any) => (
                      <tr key={tile.tileId} className="border-b border-gray-100">
                        <td className="py-2 text-black font-mono text-xs">{tile.tileId}</td>
                        <td className="py-2 text-black">{tile.territory}</td>
                        <td className="py-2 text-black">{(tile.approxPopulation || 0).toLocaleString()}</td>
                        <td className="py-2 text-black">{tile.retailerCount}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            tile.coverageScore < 0.25 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {(tile.coverageScore * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-2 text-black text-xs">{tile.centerLat}, {tile.centerLng}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No whitespaces detected — full coverage achieved!</p>
            )}
          </div>

          {/* All Tiles */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">All Satellite Tiles ({tiles.length})</h4>
            {tiles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-black">Tile ID</th>
                      <th className="text-left py-2 font-medium text-black">Territory</th>
                      <th className="text-left py-2 font-medium text-black">Urban Density</th>
                      <th className="text-left py-2 font-medium text-black">Road Access</th>
                      <th className="text-left py-2 font-medium text-black">Coverage</th>
                      <th className="text-left py-2 font-medium text-black">Sales</th>
                      <th className="text-left py-2 font-medium text-black">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiles.map((tile: any) => (
                      <tr key={tile.tileId} className="border-b border-gray-100">
                        <td className="py-2 text-black font-mono text-xs">{tile.tileId}</td>
                        <td className="py-2 text-black">{tile.territory}</td>
                        <td className="py-2 text-black">{(tile.urbanDensityScore * 100).toFixed(0)}%</td>
                        <td className="py-2 text-black">{(tile.roadAccessScore * 100).toFixed(0)}%</td>
                        <td className="py-2 text-black">{(tile.coverageScore * 100).toFixed(0)}%</td>
                        <td className="py-2 text-black">${(tile.totalSales || 0).toLocaleString()}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            tile.whiteSpace ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {tile.whiteSpace ? 'Whitespace' : 'Covered'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No satellite data available for {countryCode}</p>
            )}
          </div>
        </div>
      )}
    </OSDomainPageWrapper>
  )
}
