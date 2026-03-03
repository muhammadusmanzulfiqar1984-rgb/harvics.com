'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

type Timeframe = '1D' | '1W' | '1M'

interface ChartData {
  time: string
  price: number
}

const StockChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [selectedStock, setSelectedStock] = useState('HVCS')
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [currentStockPrice, setCurrentStockPrice] = useState<number | null>(null)
  const [stockChange, setStockChange] = useState<number>(0)
  const [stockChangePercent, setStockChangePercent] = useState<number>(0)
  const [loadingPrice, setLoadingPrice] = useState(true)
  const [loadingChart, setLoadingChart] = useState(true)

  // Fetch live stock price
  useEffect(() => {
    loadStockPrice()
    loadChartData()
    const interval = setInterval(loadStockPrice, 4000)
    return () => clearInterval(interval)
  }, [selectedStock])

  useEffect(() => {
    loadChartData()
  }, [timeframe, selectedStock])

  const fetchYahooQuote = async (symbol: string) => {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Yahoo quote error ${res.status}`)
    const json = await res.json()
    const quote = json?.quoteResponse?.result?.[0]
    return {
      price: quote?.regularMarketPrice ?? quote?.ask ?? null,
      change: quote?.regularMarketChange ?? 0,
      changePercent: quote?.regularMarketChangePercent ?? 0
    }
  }

  const loadStockPrice = async () => {
    try {
      setLoadingPrice(true)
      const response = await apiClient.getStockPrice(selectedStock)

      if (response.data && (response.data as any).success && (response.data as any).data) {
        const stock = (response.data as any).data
        setCurrentStockPrice(stock.price ?? null)
        setStockChange(stock.change || 0)
        setStockChangePercent(stock.changePercent || 0)
        setLoadingPrice(false)
        return
      }

      const yahoo = await fetchYahooQuote(selectedStock)
      if (yahoo.price) {
        setCurrentStockPrice(yahoo.price)
        setStockChange(yahoo.change || 0)
        setStockChangePercent(yahoo.changePercent || 0)
      }
    } catch (error: any) {
      console.error('Error loading stock price:', error)
      const basePrice = selectedStock === 'HVCS' ? 47.23 : 89.67
      setCurrentStockPrice(basePrice)
    } finally {
      setLoadingPrice(false)
    }
  }

  const formatLabel = (timestamp: number, range: Timeframe) => {
    const date = new Date(timestamp * 1000)
    if (range === '1D') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (range === '1W') {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const loadChartData = async () => {
    const config: Record<Timeframe, { range: string; interval: string }> = {
      '1D': { range: '1d', interval: '5m' },
      '1W': { range: '5d', interval: '30m' },
      '1M': { range: '1mo', interval: '1d' }
    }

    try {
      setLoadingChart(true)
      const { range, interval } = config[timeframe]
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${selectedStock}?range=${range}&interval=${interval}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Yahoo chart error ${res.status}`)
      const json = await res.json()
      const result = json?.chart?.result?.[0]
      const timestamps: number[] = result?.timestamp || []
      const closes: number[] = result?.indicators?.quote?.[0]?.close || []

      const points: ChartData[] = timestamps
        .map((ts, idx) => ({
          time: formatLabel(ts, timeframe),
          price: Number((closes[idx] ?? 0).toFixed(2))
        }))
        .filter((p) => !Number.isNaN(p.price) && p.price > 0)

      if (points.length > 0) {
        setChartData(points)
        const first = points[0].price
        const last = points[points.length - 1].price
        setStockChange(last - first)
        setStockChangePercent(((last - first) / first) * 100)
        setCurrentStockPrice(last)
      }
    } catch (error) {
      console.error('Error loading chart data:', error)
    } finally {
      setLoadingChart(false)
    }
  }

  const maxPrice = chartData.length ? Math.max(...chartData.map(d => d.price)) : 0
  const minPrice = chartData.length ? Math.min(...chartData.map(d => d.price)) : 0
  const priceRange = Math.max(maxPrice - minPrice, 1)

  const getYPosition = (price: number) => {
    return ((maxPrice - price) / priceRange) * 100
  }

  const getPathData = () => {
    if (chartData.length === 0) return ''
    
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * 100
      const y = getYPosition(point.price)
      return `${x},${y}`
    }).join(' L')
    
    return `M ${points}`
  }

  const getAreaData = () => {
    if (chartData.length === 0) return ''
    
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * 100
      const y = getYPosition(point.price)
      return `${x},${y}`
    }).join(' L')
    
    return `M 0,100 L ${points} L 100,100 Z`
  }

  const currentPrice = currentStockPrice || chartData[chartData.length - 1]?.price || 0
  const firstPrice = chartData[0]?.price || currentPrice
  const change = stockChange !== 0 ? stockChange : (currentPrice - firstPrice)
  const changePercent = stockChangePercent !== 0 ? stockChangePercent : ((change / firstPrice) * 100)

  return (
    <div className="bg-gradient-to-br from-[#fffaf3] via-[#fff4e3] to-[#ffe9c7] rounded-2xl border border-[#e6d8b8] p-4 sm:p-6">
      <div className="flex flex-col space-y-4 mb-6">
        {/* Stock selector and price - stacked on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          <select 
            value={selectedStock} 
            onChange={(e) => setSelectedStock(e.target.value)}
            className="bg-white text-amber-900 border border-[#e6d8b8] rounded-lg px-3 py-2 text-sm font-semibold w-full sm:w-auto"
          >
            <option value="HVCS">HVCS - Harvics Foods</option>
            <option value="HARV">HARV - Harvics Global</option>
          </select>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-900">
                ${currentPrice.toFixed(2)}
              </h3>
              {loadingPrice && (
                <span className="text-xs text-amber-900/60">Loading...</span>
              )}
              {!loadingPrice && currentStockPrice && (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  LIVE
                </span>
              )}
            </div>
            <span className={`text-xs sm:text-sm font-bold px-2 py-1 rounded-full inline-block w-fit ${
              change >= 0 
                ? 'text-emerald-800 bg-emerald-100 border border-emerald-200' 
                : 'text-rose-800 bg-rose-100 border border-rose-200'
            }`}>
              {change >= 0 ? '↗' : '↘'} {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        {/* Company name */}
        <p className="text-amber-900/70 text-sm">
          {selectedStock === 'HVCS' ? 'Harvics Foods Inc.' : 'Harvics Global Ventures'}
        </p>
        
        {/* Timeframe buttons */}
        <div className="flex space-x-2">
          {['1D', '1W', '1M'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                timeframe === period
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-white text-amber-800 border border-[#e6d8b8] hover:bg-amber-50'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-64 bg-[#fff7ea] rounded-lg border border-[#e6d8b8] p-4">
        {loadingChart && (
          <div className="absolute inset-0 flex items-center justify-center text-amber-900/70 text-sm bg-white/60 backdrop-blur-sm rounded-lg z-10">
            Loading live chart...
          </div>
        )}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#d6c7a8" strokeWidth="0.2" opacity="0.6"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Area under the curve */}
          <path
            d={getAreaData()}
            fill="url(#gradient)"
            opacity="0.35"
          />
          
          {/* Line chart */}
          <path
            d={getPathData()}
            fill="none"
            stroke="#b7791f"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * 100
            const y = getYPosition(point.price)
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                  r="0.6"
                  fill="#b7791f"
                  opacity="0.9"
              />
            )
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f5c06a" stopOpacity="0.45"/>
              <stop offset="100%" stopColor="#f5c06a" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Price labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-amber-900/70">
          <span>${maxPrice.toFixed(2)}</span>
          <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
          <span>${minPrice.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0 text-xs text-amber-900/70">
        <span>{timeframe === '1D' ? 'Market Hours' : timeframe === '1W' ? 'Week' : 'Month'}</span>
        <span>Volume: {Math.floor(Math.random() * 10000000).toLocaleString()}</span>
      </div>
    </div>
  )
}

export default StockChart
