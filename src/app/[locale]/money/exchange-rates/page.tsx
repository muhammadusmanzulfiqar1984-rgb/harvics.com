'use client'

// Removed folderBasedProducts import - not needed for exchange rates page
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface ExchangeRate {
  currency: string
  rate: number
  buyRate: number
  sellRate: number
  baseCurrency?: string
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

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  // Categories removed - Header will handle its own categories

  useEffect(() => {
    loadForexRates()
    // Refresh every 5 minutes
    const interval = setInterval(loadForexRates, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadForexRates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getForexRates('USD')
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response?.data) {
        const responseData = response.data as any
        if (responseData.success && responseData.data) {
          setRates(responseData.data)
        } else if (Array.isArray(responseData)) {
          setRates(responseData)
        }
        setLastUpdated(new Date())
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err: any) {
      console.error('Error loading forex rates:', err)
      setError(err.message || 'Failed to load exchange rates')
      // Use fallback rates on error
      setRates([
        { currency: 'USD', rate: 1.00, buyRate: 1.00, sellRate: 1.00 },
        { currency: 'EUR', rate: 0.92, buyRate: 0.9246, sellRate: 0.9154 },
        { currency: 'GBP', rate: 0.79, buyRate: 0.794, sellRate: 0.786 },
        { currency: 'AED', rate: 3.67, buyRate: 3.688, sellRate: 3.652 },
        { currency: 'PKR', rate: 278.50, buyRate: 279.89, sellRate: 277.11 },
        { currency: 'JPY', rate: 149.20, buyRate: 149.95, sellRate: 148.45 },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="pt-20">
        <section className="h-[400px] relative bg-[#6B1F2B] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6">
              Exchange Rates
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              {loading ? 'Loading live currency exchange rates...' : 'Live currency exchange rates updated in real-time'}
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl shadow-sm">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {error}. Showing cached/fallback rates.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              {loading && rates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1F2B] mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading live exchange rates...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-4 px-4 font-serif font-medium text-gray-900">Currency</th>
                          <th className="text-right py-4 px-4 font-serif font-medium text-gray-900">Rate</th>
                          <th className="text-right py-4 px-4 font-serif font-medium text-gray-900">Buy Rate</th>
                          <th className="text-right py-4 px-4 font-serif font-medium text-gray-900">Sell Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rates.map((rate) => (
                          <tr key={rate.currency} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">{currencyFlags[rate.currency] || '💱'}</span>
                                <span className="font-medium text-gray-900">{rate.currency}</span>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4 font-medium text-gray-900">
                              {rate.rate.toFixed(4)}
                            </td>
                            <td className="text-right py-4 px-4 font-medium text-green-600">
                              {rate.buyRate ? rate.buyRate.toFixed(4) : rate.rate.toFixed(4)}
                            </td>
                            <td className="text-right py-4 px-4 font-medium text-red-600">
                              {rate.sellRate ? rate.sellRate.toFixed(4) : rate.rate.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      Rates are indicative and may vary. 
                      {lastUpdated && (
                        <> Last updated: {lastUpdated.toLocaleString()}</>
                      )}
                      {!lastUpdated && (
                        <> Last updated: {new Date().toLocaleDateString()}</>
                      )}
                    </p>
                    <button
                      onClick={loadForexRates}
                      disabled={loading}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B1F2B] disabled:opacity-50 transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Refreshing...
                        </>
                      ) : (
                        '🔄 Refresh Rates'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

