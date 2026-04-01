'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useCountry } from '@/contexts/CountryContext'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import KPICard from '@/components/shared/KPICard'
import { apiClient } from '@/lib/api'

export default function GeoOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  
  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  const countryCode = selectedCountry || 'AE'

  useEffect(() => {
    loadData()
  }, [countryCode])

  const loadData = async () => {
    setLoading(true)
    try {
      const [territoryRes, gpsRetailers, gpsRoutes] = await Promise.all([
        apiClient.request('/territory/continents'),
        apiClient.request(`/gps/retailers/${countryCode}`),
        apiClient.request(`/gps/routes/${countryCode}`)
      ])
      
      const territories = (territoryRes?.data as any[]) || []
      const gpsData = (gpsRetailers?.data as any) || {}
      const routes = (gpsRoutes?.data as any)?.routes || []
      
      setData({
        territories: territories.length || 0,
        gpsPoints: gpsData.totalRetailers || 0,
        routesTracked: routes.length || 0,
        coverageArea: gpsData.coverageAreas?.length || territories.length || 0
      })
    } catch (error) {
      console.error('Error loading geo data:', error)
      setData({
        territories: 0,
        gpsPoints: 0,
        routesTracked: 0,
        coverageArea: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <OSDomainPageWrapper
        title="Geo Engine"
        description="Tier 0: Foundational Engine - Territory maps, GPS trails, heatmaps, and geographic intelligence"
        domain="geo"
        portal={portal}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
        </div>
      </OSDomainPageWrapper>
    )
  }

  return (
    <OSDomainPageWrapper
      title="Geo Engine"
      description="Tier 0: Foundational Engine - Territory maps, GPS trails, heatmaps, and geographic intelligence"
      domain="geo"
      portal={portal}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Territories"
            value={data?.territories || 0}
            icon="🗺️"
          />
          <KPICard
            label="GPS Points"
            value={data?.gpsPoints ? `${(data.gpsPoints / 1000).toFixed(1)}K` : '0'}
            icon="📍"
          />
          <KPICard
            label="Routes Tracked"
            value={data?.routesTracked || 0}
            icon="🛣️"
          />
          <KPICard
            label="Coverage Area"
            value={data?.coverageArea || 0}
            icon="🌍"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-black200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Territory Management</h3>
            <p className="text-black mb-4">
              Define and manage sales territories with geographic boundaries. 
              Assign territories to sales teams and track coverage.
            </p>
            <ul className="space-y-2 text-sm text-black list-disc list-inside">
              <li>Geographic boundary definition</li>
              <li>Territory assignment and tracking</li>
              <li>Coverage gap analysis</li>
              <li>Overlap detection</li>
            </ul>
          </div>

          <div className="bg-white border border-black200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">GPS Tracking</h3>
            <p className="text-black mb-4">
              Real-time GPS tracking for vehicles, sales teams, and deliveries.
              View trails, routes, and location history.
            </p>
            <ul className="space-y-2 text-sm text-black list-disc list-inside">
              <li>Real-time location tracking</li>
              <li>Route optimization</li>
              <li>Delivery proof of location</li>
              <li>Geofencing alerts</li>
            </ul>
          </div>

          <div className="bg-white border border-black200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Heatmaps</h3>
            <p className="text-black mb-4">
              Visualize data density with heatmaps showing sales activity,
              customer concentration, and market penetration.
            </p>
            <ul className="space-y-2 text-sm text-black list-disc list-inside">
              <li>Sales activity heatmaps</li>
              <li>Customer density maps</li>
              <li>Market penetration visualization</li>
              <li>Performance by geography</li>
            </ul>
          </div>

          <div className="bg-white border border-black200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Geographic Intelligence</h3>
            <p className="text-black mb-4">
              AI-powered geographic insights for territory optimization,
              route planning, and market expansion.
            </p>
            <ul className="space-y-2 text-sm text-black list-disc list-inside">
              <li>Territory optimization recommendations</li>
              <li>Market expansion opportunities</li>
              <li>Route efficiency analysis</li>
              <li>Competitor presence mapping</li>
            </ul>
          </div>
        </div>
      </div>
    </OSDomainPageWrapper>
  )
}

