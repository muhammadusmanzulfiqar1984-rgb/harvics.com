'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'

type Domain = 'crm' | 'orders' | 'inventory' | 'finance' | 'hr' | 'executive'

const API_MAP: Record<Domain, () => Promise<any>> = {
  crm: () => apiClient.getDomainCRM(),
  orders: () => apiClient.getDomainOrders(),
  inventory: () => apiClient.getDomainInventory(),
  finance: () => apiClient.getDomainFinance(),
  hr: () => apiClient.getDomainHR(),
  executive: () => apiClient.getDomainExecutive(),
}

/** Domain dashboards — live API only; no mock KPIs. */
export function useDomainData(domain: Domain) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'live' | 'empty'>('empty')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await API_MAP[domain]()
      const payload = result?.data?.data ?? result?.data
      if (payload && !result?.error && typeof payload === 'object' && Object.keys(payload).length > 0) {
        setData(payload)
        setSource('live')
      } else {
        setData(null)
        setSource('empty')
      }
    } catch {
      setData(null)
      setSource('empty')
    } finally {
      setLastUpdated(new Date())
      setLoading(false)
    }
  }, [domain])

  useEffect(() => {
    void refresh()
    const interval = setInterval(refresh, 60000)
    return () => clearInterval(interval)
  }, [refresh])

  return { data, loading, source, lastUpdated, refresh }
}
