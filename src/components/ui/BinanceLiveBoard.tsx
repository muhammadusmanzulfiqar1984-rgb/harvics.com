'use client'

import React, { useEffect, useMemo, useState } from 'react'

type BinanceTicker = {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
}

const WATCHLIST = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']

const formatNumber = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(2)
}

const BinanceLiveBoard: React.FC = () => {
  const [tickers, setTickers] = useState<Record<string, BinanceTicker>>({})
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure we always show symbols in the configured order
  const orderedTickers = useMemo(
    () => WATCHLIST.map((sym) => tickers[sym]).filter(Boolean),
    [tickers]
  )

  useEffect(() => {
    let ws: WebSocket | null = null
    let closed = false

    const loadInitial = async () => {
      try {
        const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(WATCHLIST))}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const mapped: Record<string, BinanceTicker> = {}
        data.forEach((item: any) => {
          mapped[item.symbol] = {
            symbol: item.symbol,
            price: parseFloat(item.lastPrice),
            change: parseFloat(item.priceChange),
            changePercent: parseFloat(item.priceChangePercent),
            volume: parseFloat(item.volume),
            high: parseFloat(item.highPrice),
            low: parseFloat(item.lowPrice)
          }
        })
        setTickers(mapped)
      } catch (err) {
        console.error('Initial Binance load failed', err)
        setError('Unable to load Binance data')
      }
    }

    const connect = () => {
      const streams = WATCHLIST.map((s) => `${s.toLowerCase()}@ticker`).join('/')
      ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)

      ws.onopen = () => {
        setConnected(true)
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          const data = payload?.data
          if (!data?.s || !data?.c) return
          setTickers((prev) => ({
            ...prev,
            [data.s]: {
              symbol: data.s,
              price: parseFloat(data.c),
              change: parseFloat(data.p),
              changePercent: parseFloat(data.P),
              volume: parseFloat(data.v),
              high: parseFloat(data.h),
              low: parseFloat(data.l)
            }
          }))
        } catch (err) {
          console.error('Error parsing Binance stream', err)
        }
      }

      ws.onerror = () => {
        setConnected(false)
        setError('Live feed connection issue')
      }

      ws.onclose = () => {
        setConnected(false)
        if (!closed) {
          // Attempt a lightweight reconnect
          setTimeout(connect, 2000)
        }
      }
    }

    loadInitial()
    connect()

    return () => {
      closed = true
      if (ws) ws.close()
    }
  }, [])

  if (orderedTickers.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#fffaf3] via-[#fff4e3] to-[#ffe9c7] border border-[#e6d8b8] rounded-2xl p-6 text-amber-900/70">
        Connecting to Binance live feed...
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#fffaf3] via-[#fff4e3] to-[#ffe9c7] border border-[#e6d8b8] rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <span>Binance Live Markets</span>
            <span className="text-sm px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {connected ? 'LIVE' : 'RECONNECTING'}
            </span>
          </h3>
          <p className="text-amber-900/70 text-sm">Streaming directly from Binance ticker feed</p>
        </div>
        {error && <span className="text-rose-700 text-sm">{error}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {orderedTickers.map((ticker) => {
          const isUp = ticker.change >= 0
          return (
            <div
              key={ticker.symbol}
              className="p-4 rounded-xl border border-[#e6d8b8] bg-white/80 backdrop-blur-sm hover:border-[#C3A35E] transition-all duration-300 hover:shadow-lg hover:shadow-[#f2d9a6]/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-amber-900">{ticker.symbol.replace('USDT', '')}/USDT</span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    isUp ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isUp ? '↗' : '↘'} {ticker.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-amber-900 mb-2">
                ${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-amber-900/70 mb-3">
                {isUp ? '+' : ''}
                {ticker.change.toFixed(2)} ({ticker.changePercent.toFixed(2)}%)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-amber-900/80">
                <div className="flex justify-between">
                  <span>24h High</span>
                  <span className="text-amber-900">{ticker.high.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>24h Low</span>
                  <span className="text-amber-900">{ticker.low.toFixed(2)}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span>24h Volume</span>
                  <span className="text-amber-900">{formatNumber(ticker.volume)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BinanceLiveBoard


