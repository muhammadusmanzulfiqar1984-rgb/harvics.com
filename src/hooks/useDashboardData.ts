'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export interface DashboardData {
  overview?: any
  inventory?: any
  topProducts?: any[]
  procurement?: any
  sales?: any
  distribution?: any
  logistics?: any
  retailers?: any
  payments?: any
  accounting?: any
  hr?: any
  targets?: any
  marketing?: any
  masterPL?: any
  loading: boolean
  error: string | null
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    loading: true,
    error: null,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }))

    try {
      // Load all dashboard data in parallel
      const [
        overview,
        inventory,
        topProducts,
        procurement,
        sales,
        distribution,
        logistics,
        retailers,
        payments,
        accounting,
        hr,
        targets,
        marketing,
        masterPL,
      ] = await Promise.allSettled([
        apiClient.getDashboardOverview(),
        apiClient.getInventory(),
        apiClient.getTopProducts(),
        apiClient.getProcurement(),
        apiClient.getSales(),
        apiClient.getDistribution(),
        apiClient.getLogistics(),
        apiClient.getRetailers(),
        apiClient.getPayments(),
        apiClient.getAccounting(),
        apiClient.getHR(),
        apiClient.getTargets(),
        apiClient.getMarketing(),
        apiClient.getMasterPL(),
      ])

      setData({
        overview: overview.status === 'fulfilled' ? overview.value.data : null,
        inventory: inventory.status === 'fulfilled' ? inventory.value.data : null,
        topProducts: topProducts.status === 'fulfilled' ? (topProducts.value.data as any) : null,
        procurement: procurement.status === 'fulfilled' ? (procurement.value.data as any) : null,
        sales: sales.status === 'fulfilled' ? (sales.value.data as any) : null,
        distribution: distribution.status === 'fulfilled' ? (distribution.value.data as any) : null,
        logistics: logistics.status === 'fulfilled' ? logistics.value.data : null,
        retailers: retailers.status === 'fulfilled' ? retailers.value.data : null,
        payments: payments.status === 'fulfilled' ? payments.value.data : null,
        accounting: accounting.status === 'fulfilled' ? accounting.value.data : null,
        hr: hr.status === 'fulfilled' ? hr.value.data : null,
        targets: targets.status === 'fulfilled' ? targets.value.data : null,
        marketing: marketing.status === 'fulfilled' ? marketing.value.data : null,
        masterPL: masterPL.status === 'fulfilled' ? masterPL.value.data : null,
        loading: false,
        error: null,
      })
    } catch (error) {
      setData({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
      })
    }
  }

  return { data, reload: loadDashboardData }
}

