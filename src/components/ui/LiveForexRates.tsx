'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface ForexRate {
  currency: string
  rate: number
  buyRate?: number
  sellRate?: number
  lastUpdated?: string
}

const currencyFlags: Record<string, string> = {
  'USD': '🇺🇸',
  'EUR': '🇪🇺',
  'GBP': '🇬🇧',
  'AED': '🇦🇪',
  'SAR': '🇸🇦',
  'PKR': '🇵🇰',
  'INR': '🇮🇳',
  'CNY': '🇨🇳',
  'JPY': '🇯🇵',
  'CAD': '🇨🇦',
  'AUD': '🇦🇺'
}

interface LiveForexRatesProps {
  compact?: boolean
}

export default function LiveForexRates({ compact = false }: LiveForexRatesProps) {
  const [rates, setRates] = useState<ForexRate[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadForexRates()
    // Refresh every 5 minutes
    const interval = setInterval(loadForexRates, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadForexRates = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getForexRates('USD')
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.data && (response.data as any).success && (response.data as any).data) {
        setRates((response.data as any).data.slice(0, compact ? 6 : 11))
        setLastUpdated(new Date())
      }
    } catch (error: any) {
      console.error('Error loading forex rates:', error)
      setRates([])
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-[#C3A35E]/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">💱 Live Forex Rates</h3>
          {loading && <span className="text-xs text-white/60">Loading...</span>}
        </div>
        {loading && rates.length === 0 ? (
          <div className="text-center py-4 text-white/60 text-sm">Loading rates...</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {rates.map((rate) => (
              <div key={rate.currency} className="flex items-center justify-between text-sm">
                <span className="text-white/90">
                  {currencyFlags[rate.currency] || '💱'} {rate.currency}
                </span>
                <span className="text-white font-mono">
                  {rate.rate.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-[#C3A35E]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">💱 Live Forex Rates</h3>
        {lastUpdated && (
          <span className="text-xs text-white/60">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {loading && rates.length === 0 ? (
        <div className="text-center py-8 text-white/60">Loading live forex rates...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C3A35E]/20">
                  <th className="text-left py-3 px-4 font-bold text-white text-sm">Currency</th>
                  <th className="text-right py-3 px-4 font-bold text-white text-sm">Rate</th>
                  <th className="text-right py-3 px-4 font-bold text-white text-sm">Buy</th>
                  <th className="text-right py-3 px-4 font-bold text-white text-sm">Sell</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.currency} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <span className="text-white/90 font-semibold">
                        {currencyFlags[rate.currency] || '💱'} {rate.currency}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-white/90">
                      {rate.rate.toFixed(4)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-green-400">
                      {rate.buyRate ? rate.buyRate.toFixed(4) : rate.rate.toFixed(4)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-red-400">
                      {rate.sellRate ? rate.sellRate.toFixed(4) : rate.rate.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={loadForexRates}
            disabled={loading}
            className="mt-4 text-sm text-white hover:text-[#C3A35E]/90 underline disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Rates'}
          </button>
        </>
      )}
    </div>
  )
}

