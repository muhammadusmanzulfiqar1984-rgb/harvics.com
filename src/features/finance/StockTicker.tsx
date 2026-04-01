'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
}

interface YahooQuote {
  symbol: string
  shortName?: string
  longName?: string
  regularMarketPrice?: number
  ask?: number
  regularMarketChange?: number
  regularMarketChangePercent?: number
  regularMarketVolume?: number
  marketCap?: number
}

interface YahooQuoteResponse {
  quoteResponse?: {
    result?: YahooQuote[]
  }
}

const STOCK_SYMBOLS = ['HVCS', 'HARV', 'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META']

const formatLargeNumber = (value?: number | string) => {
  if (typeof value === 'string') return value
  if (!value && value !== 0) return 'N/A'
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

const StockTicker: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  const fetchYahooQuotes = useCallback(async (symbols: string[]) => {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Yahoo quote error: ${res.status}`)
    const json = (await res.json()) as YahooQuoteResponse
    const results = json.quoteResponse?.result || []
    return results.map((quote) => ({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || quote.symbol,
      price: quote.regularMarketPrice ?? quote.ask ?? 0,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      marketCap: formatLargeNumber(quote.marketCap)
    })) as StockData[]
  }, [])

  const loadStockPrices = useCallback(async () => {
    try {
      setLoading(true)
      let fetched: StockData[] | null = null
      fetched = await fetchYahooQuotes(STOCK_SYMBOLS)

      if (fetched && fetched.length > 0) {
        setStocks(fetched)
      }
    } catch (error) {
      console.error('Error loading stock prices:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchYahooQuotes])

  // Load stock prices on mount and refresh frequently for live updates
  useEffect(() => {
    loadStockPrices()
    // Refresh every 3 seconds for Harvics stocks to show live fluctuations
    const interval = setInterval(loadStockPrices, 3000) // Refresh every 3 seconds
    return () => clearInterval(interval)
  }, [loadStockPrices])

  // Rotate displayed stock every 3 seconds
  useEffect(() => {
    if (stocks.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stocks.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [stocks.length])

  // Show all stocks in a scrolling ticker, or show loading/empty state
  if (loading && stocks.length === 0) {
    return (
      <div className="bg-gradient-to-r from-[#fffaf3] via-[#fff6ea] to-[#fff1dd] border-t border-b border-[#e6d8b8] py-2 overflow-hidden relative">
        <div className="flex items-center justify-center text-amber-900/70 text-sm">
          Loading live stock prices...
        </div>
      </div>
    )
  }

  if (stocks.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-[#fffaf3] via-[#fff6ea] to-[#fff1dd] border-t border-b border-[#e6d8b8] py-2 overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#f4d9a3] to-transparent animate-pulse"></div>
      </div>
      
      <div className="relative z-10 flex items-center">
        <div className="flex items-center space-x-8 animate-scroll">
          {[...stocks, ...stocks].map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-4 whitespace-nowrap">
              <div className="flex items-center space-x-3">
                <span className="text-amber-900 font-bold text-sm tracking-wide">{stock.symbol}</span>
                <span className="text-amber-900/70 text-xs hidden sm:block">{stock.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-amber-900 font-mono text-sm font-semibold transition-all duration-500">${stock.price.toFixed(2)}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full transition-all duration-500 ${
                  stock.change >= 0 
                    ? 'text-emerald-800 bg-emerald-100 border border-emerald-200' 
                    : 'text-rose-800 bg-rose-100 border border-rose-200'
                }`}>
                  {stock.change >= 0 ? '↗' : '↘'} {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </div>
              <div className="hidden lg:flex items-center space-x-4 text-amber-900/60 text-xs">
                <span>Vol: {stock.volume.toLocaleString()}</span>
                <span>Mkt Cap: ${stock.marketCap}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute right-4 flex items-center space-x-2 text-emerald-700 text-xs">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="font-mono">LIVE</span>
        </div>
      </div>
    </div>
  )
}

export default StockTicker
