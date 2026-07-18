'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import KPICard from '@/components/shared/KPICard'
import { apiClient } from '@/lib/api'

export default function MarketDistributionOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  
  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [crmRes, territoryRes, logisticsRes] = await Promise.all([
        apiClient.request('/crm/summary'),
        apiClient.request('/territory/continents'),
        apiClient.request('/logistics/summary')
      ])
      
      const crm = (crmRes?.data as any) || {}
      const territories = (territoryRes?.data as any[]) || []
      const logistics = (logisticsRes?.data as any) || {}
      
      // Calculate coverage percentage based on active vs total
      const totalCustomers = crm.totalCustomers || 0
      const activeRoutes = logistics.totalRoutes || 0
      const coverage = totalCustomers > 0 ? Math.min(95, Math.floor((activeRoutes / totalCustomers) * 100)) : 0
      
      setData({
        distributors: totalCustomers, // Using customers as distributors proxy
        territories: territories.length || 0,
        coverage: coverage,
        performance: 88 // Mock for now
      })
    } catch (error) {
      console.error('Error loading market distribution data:', error)
      setData({
        distributors: 0,
        territories: 0,
        coverage: 0,
        performance: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout portal={portal} pageTitle="Market & Distribution OS">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-harvics-gold"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      portal={portal}
      pageTitle="Market & Distribution OS"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Active Distributors"
            value={data?.distributors || 0}
            icon="🚚"
          />
          <KPICard
            label="Territories"
            value={data?.territories || 0}
            icon="🗺️"
          />
          <KPICard
            label="Coverage"
            value={`${data?.coverage || 0}%`}
            icon="📊"
          />
          <KPICard
            label="Performance Score"
            value={data?.performance || 0}
            icon="⭐"
          />
        </div>

        <div className="border-t border-black200 pt-6">
          <h3 className="text-lg font-semibold text-black mb-4">Distributor Management</h3>
          <p className="text-black mb-4">
            Manage distributor relationships, territories, pricing, and performance metrics.
            Track distributor KPIs and ensure optimal market coverage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-black200 p-4">
              <h4 className="font-semibold text-black mb-2">Distributor Profiles</h4>
              <p className="text-sm text-black">Complete distributor information and contact details</p>
            </div>
            <div className="bg-white border border-black200 p-4">
              <h4 className="font-semibold text-black mb-2">Territory Assignment</h4>
              <p className="text-sm text-black">Assign and manage distributor territories</p>
            </div>
            <div className="bg-white border border-black200 p-4">
              <h4 className="font-semibold text-black mb-2">Pricing Management</h4>
              <p className="text-sm text-black">Set and manage distributor pricing tiers</p>
            </div>
            <div className="bg-white border border-black200 p-4">
              <h4 className="font-semibold text-black mb-2">Performance Tracking</h4>
              <p className="text-sm text-black">Monitor distributor KPIs and metrics</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
