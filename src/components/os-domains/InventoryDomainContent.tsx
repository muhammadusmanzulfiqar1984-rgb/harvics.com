'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import StockOverviewContent from '@/components/domains/inventory/StockOverviewContent'
import SmartReplenishmentDashboard from '@/components/domains/inventory/SmartReplenishmentDashboard'

interface InventoryDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function InventoryDomainContent({ persona, locale }: InventoryDomainContentProps) {
  // Tier 2 Modules for Inventory Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'smart-inventory',
      label: 'Smart Inventory',
      icon: '📦',
      description: 'AI-powered inventory management and replenishment',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              📦 Smart Inventory
            </h3>
            <p className="text-black">AI-powered inventory management and replenishment</p>
          </div>
          <StockOverviewContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'stock-overview',
          label: 'Stock Overview',
          icon: '📊',
          component: <StockOverviewContent persona={persona} locale={locale} />
        },
        {
          id: 'replenishment',
          label: 'Replenishment',
          icon: '🔄',
          component: <SmartReplenishmentDashboard />
        }
      ]
    },
    {
      id: 'warehouse',
      label: 'Warehouse Management',
      icon: '🏭',
      description: 'Multi-location warehouse operations and stock transfers',
      tier3Screens: [
        {
          id: 'warehouse-list',
          label: 'Warehouse List',
          icon: '📋',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Warehouse List</h3><p>View and manage all warehouse locations</p></div>
        },
        {
          id: 'stock-transfers',
          label: 'Stock Transfers',
          icon: '🚚',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Stock Transfers</h3><p>Manage inter-warehouse stock movements</p></div>
        },
        {
          id: 'warehouse-analytics',
          label: 'Warehouse Analytics',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Warehouse Analytics</h3><p>Performance metrics and capacity analysis</p></div>
        }
      ]
    },
    {
      id: 'expiry-monitor',
      label: 'Expiry Monitor',
      icon: '⏰',
      description: 'Track expiry dates and manage FEFO/FIFO rules',
      tier3Screens: [
        {
          id: 'expiry-alerts',
          label: 'Expiry Alerts',
          icon: '⚠️',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Expiry Alerts</h3><p>Products approaching expiry dates</p></div>
        },
        {
          id: 'fefo-fifo',
          label: 'FEFO/FIFO Rules',
          icon: '🔄',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">FEFO/FIFO Rules</h3><p>Configure and manage expiry-based picking rules</p></div>
        },
        {
          id: 'expiry-reports',
          label: 'Expiry Reports',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Expiry Reports</h3><p>Historical expiry data and trends</p></div>
        }
      ]
    },
    {
      id: 'batch-tracking',
      label: 'Batch / Lot Tracking',
      icon: '🔍',
      description: 'Full traceability and lot number management',
      tier3Screens: [
        {
          id: 'batch-list',
          label: 'Batch List',
          icon: '📋',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Batch List</h3><p>View all batches and lot numbers</p></div>
        },
        {
          id: 'lot-tracking',
          label: 'Lot Tracking',
          icon: '🔍',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Lot Tracking</h3><p>Track lot numbers and traceability</p></div>
        },
        {
          id: 'batch-history',
          label: 'Batch History',
          icon: '📜',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Batch History</h3><p>Complete batch movement history</p></div>
        },
        {
          id: 'traceability',
          label: 'Traceability',
          icon: '🔗',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Traceability</h3><p>Full product traceability chain</p></div>
        }
      ]
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="inventory"
      domainName="Inventory OS"
      tier2Modules={tier2Modules}
      defaultModule="smart-inventory"
    />
  )
}

