'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import RouteListContent from '@/components/domains/logistics/RouteListContent'
import ActiveVehiclesContent from '@/components/domains/logistics/ActiveVehiclesContent'
import DeliveryQueueContent from '@/components/domains/logistics/DeliveryQueueContent'
import PendingReturnsContent from '@/components/domains/logistics/PendingReturnsContent'

interface LogisticsDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function LogisticsDomainContent({ persona, locale }: LogisticsDomainContentProps) {
  // Tier 2 Modules for Logistics Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'route-planning',
      label: 'Route Planning',
      icon: '🗺️',
      description: 'AI-powered route optimization and territory management',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              🗺️ Route Planning
            </h3>
            <p className="text-black">AI-powered route optimization and territory management</p>
          </div>
        </div>
      ),
      tier3Screens: [
        {
          id: 'route-list',
          label: 'Route List',
          icon: '📋',
          component: <RouteListContent persona={persona} locale={locale} />
        },
        {
          id: 'route-optimization',
          label: 'Route Optimization',
          icon: '⚡',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Route Optimization</h3><p>AI-powered route optimization algorithms</p></div>
        },
        {
          id: 'route-analytics',
          label: 'Route Analytics',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Route Analytics</h3><p>Route performance metrics and insights</p></div>
        }
      ]
    },
    {
      id: 'fleet-tracking',
      label: 'Fleet & Vehicle Tracking',
      icon: '🚚',
      description: 'Real-time GPS tracking, vehicle management, and driver monitoring',
      tier3Screens: [
        {
          id: 'active-vehicles',
          label: 'Active Vehicles',
          icon: '🚗',
          component: <ActiveVehiclesContent persona={persona} locale={locale} />
        },
        {
          id: 'vehicle-status',
          label: 'Vehicle Status',
          icon: '📡',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Vehicle Status</h3><p>Vehicle health, maintenance, and status monitoring</p></div>
        },
        {
          id: 'gps-map',
          label: 'GPS Map View',
          icon: '🗺️',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">GPS Map View</h3><p>Interactive map showing all vehicles in real-time</p></div>
        }
      ]
    },
    {
      id: 'delivery-execution',
      label: 'Delivery Execution',
      icon: '📦',
      description: 'Delivery scheduling, proof of delivery (POD), and delivery confirmations',
      tier3Screens: [
        {
          id: 'delivery-queue',
          label: 'Delivery Queue',
          icon: '📋',
          component: <DeliveryQueueContent persona={persona} locale={locale} />
        },
        {
          id: 'pod-tracking',
          label: 'POD Tracking',
          icon: '✅',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Proof of Delivery Tracking</h3><p>Track delivery confirmations and signatures</p></div>
        },
        {
          id: 'delivery-reports',
          label: 'Delivery Reports',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Delivery Reports</h3><p>Delivery performance and analytics</p></div>
        }
      ]
    },
    {
      id: 'returns',
      label: 'Returns Management',
      icon: '↩️',
      description: 'Handle returns, damages, and expiry-related returns',
      tier3Screens: [
        {
          id: 'pending-returns',
          label: 'Pending Returns',
          icon: '⏳',
          component: <PendingReturnsContent persona={persona} locale={locale} />
        },
        {
          id: 'return-reasons',
          label: 'Return Reasons',
          icon: '📝',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Return Reasons</h3><p>Analysis of return reasons and patterns</p></div>
        },
        {
          id: 'return-analytics',
          label: 'Return Analytics',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Return Analytics</h3><p>Return trends and insights</p></div>
        }
      ]
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="logistics"
      domainName="Logistics OS"
      tier2Modules={tier2Modules}
      defaultModule="route-planning"
    />
  )
}

