'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import KPICard from '@/components/shared/KPICard'

export default function GeoOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

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
            value="234"
            icon="🗺️"
          />
          <KPICard
            label="GPS Points"
            value="1.2M"
            icon="📍"
          />
          <KPICard
            label="Routes Tracked"
            value="5,678"
            icon="🛣️"
          />
          <KPICard
            label="Coverage Area"
            value="45"
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

