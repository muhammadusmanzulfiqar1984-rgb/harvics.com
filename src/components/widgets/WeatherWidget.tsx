'use client'

import React, { useState, useEffect } from 'react'

interface WeatherData {
  city: string
  temp: number
  feels_like: number
  description: string
  icon: string
  humidity: number
  wind: number
  visibility: number
}

const LOGISTICS_CITIES = [
  { name: 'Dubai', q: 'Dubai,AE' },
  { name: 'Karachi', q: 'Karachi,PK' },
  { name: 'Nairobi', q: 'Nairobi,KE' },
  { name: 'London', q: 'London,GB' },
  { name: 'Mumbai', q: 'Mumbai,IN' },
]

const WEATHER_ICONS: Record<string, string> = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '⛅',
  '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌦️',
  '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 600000) // refresh every 10min
    return () => clearInterval(interval)
  }, [])

  const fetchAll = async () => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    if (!apiKey) return
    try {
      const results = await Promise.all(
        LOGISTICS_CITIES.map(c =>
          fetch(`https://api.openweathermap.org/data/2.5/weather?q=${c.q}&units=metric&appid=${apiKey}`)
            .then(r => r.json())
            .then(d => ({
              city: c.name,
              temp: Math.round(d.main?.temp || 0),
              feels_like: Math.round(d.main?.feels_like || 0),
              description: d.weather?.[0]?.description || '',
              icon: d.weather?.[0]?.icon || '01d',
              humidity: d.main?.humidity || 0,
              wind: Math.round((d.wind?.speed || 0) * 3.6), // m/s → km/h
              visibility: Math.round((d.visibility || 10000) / 1000),
            }))
            .catch(() => null)
        )
      )
      setWeather(results.filter(Boolean) as WeatherData[])
    } catch {
      // keep empty
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="bg-white rounded-2xl border border-[#EAE0D5] p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-[#1A1A1A]">Logistics Weather</span>
        <span className="w-1.5 h-1.5 bg-[#8E8E93] rounded-full animate-pulse" />
      </div>
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-4 bg-[#FAF8F5] rounded animate-pulse" />)}
      </div>
    </div>
  )

  const active = weather[activeIdx]

  return (
    <div className="bg-white rounded-2xl border border-[#EAE0D5] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#EAE0D5] flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#1A1A1A]">Live Weather — Logistics Hubs</h4>
        <span className="flex items-center gap-1.5 text-xs text-[#34C759] font-medium">
          <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full animate-pulse" />
          Live
        </span>
      </div>

      {active && (
        <div className="px-5 py-4">
          {/* City tabs */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {weather.map((w, i) => (
              <button key={i} onClick={() => setActiveIdx(i)}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${activeIdx === i ? 'bg-harvics-burgundy text-white' : 'bg-[#FAF8F5] text-[#8E8E93] hover:bg-[#F0EAE1]'}`}>
                {w.city}
              </button>
            ))}
          </div>

          {/* Main weather display */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{WEATHER_ICONS[active.icon] || '🌡️'}</span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-[#1A1A1A]">{active.temp}°</span>
                <span className="text-sm text-[#8E8E93]">C</span>
              </div>
              <p className="text-sm text-[#8E8E93] capitalize">{active.description}</p>
              <p className="text-xs text-[#C7C7CC]">Feels like {active.feels_like}°C</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Humidity', value: `${active.humidity}%`, icon: '💧' },
              { label: 'Wind', value: `${active.wind} km/h`, icon: '💨' },
              { label: 'Visibility', value: `${active.visibility} km`, icon: '👁' },
            ].map(s => (
              <div key={s.label} className="bg-[#FAF8F5] rounded-xl p-3 text-center">
                <p className="text-base">{s.icon}</p>
                <p className="text-xs font-semibold text-[#1A1A1A] mt-1">{s.value}</p>
                <p className="text-[10px] text-[#8E8E93]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All cities strip */}
      <div className="border-t border-[#EAE0D5] px-5 py-3">
        <div className="flex gap-4 overflow-x-auto">
          {weather.map((w, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 flex items-center gap-2 text-xs ${activeIdx === i ? 'text-harvics-burgundy font-medium' : 'text-[#8E8E93]'}`}>
              <span>{WEATHER_ICONS[w.icon] || '🌡️'}</span>
              <span>{w.city}</span>
              <span className="font-semibold">{w.temp}°</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget
