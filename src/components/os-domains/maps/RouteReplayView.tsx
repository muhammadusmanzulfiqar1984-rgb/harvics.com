'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface RoutePoint {
  id: string
  employee_id: string
  lat: number
  lng: number
  timestamp: string
}

interface RouteReplayViewProps {
  employeeId: string
  startDate?: string
  endDate?: string
}

export default function RouteReplayView({ employeeId, startDate, endDate }: RouteReplayViewProps) {
  const [routes, setRoutes] = useState<RoutePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  useEffect(() => {
    loadRoutes()
  }, [employeeId, startDate, endDate])

  useEffect(() => {
    if (playing && routes.length > 0 && currentIndex < routes.length - 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < routes.length - 1) {
            return prev + 1
          } else {
            setPlaying(false)
            return prev
          }
        })
      }, 1000 / playbackSpeed)

      return () => clearInterval(interval)
    }
  }, [playing, currentIndex, routes.length, playbackSpeed])

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getRoutes(employeeId, { start_date: startDate, end_date: endDate })
      if (response.data) {
        setRoutes((response.data as any) || [])
        setCurrentIndex(0)
      }
    } catch (error) {
      console.error('Error loading routes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = () => {
    if (currentIndex >= routes.length - 1) {
      setCurrentIndex(0)
    }
    setPlaying(true)
  }

  const handlePause = () => {
    setPlaying(false)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setPlaying(false)
  }

  const currentRoute = routes[currentIndex]
  const mapCenter = currentRoute ? { lat: currentRoute.lat, lng: currentRoute.lng } : { lat: 25.2048, lng: 55.2708 }

  return (
    <div className="h-screen flex flex-col">
      {/* Controls */}
      <div className="bg-white border-b border-black200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Route Replay</h1>
            <p className="text-sm text-black mt-1">Employee: {employeeId}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-black">Speed:</label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="px-3 py-1 border border-black300 rounded"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="4">4x</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white text-black rounded hover:bg-white"
              >
                Reset
              </button>
              {playing ? (
                <button
                  onClick={handlePause}
                  className="px-4 py-2 bg-white text-black rounded hover:bg-white/90"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={handlePlay}
                  className="px-4 py-2 bg-white text-black rounded hover:bg-white/90"
                >
                  Play
                </button>
              )}
            </div>
            <div className="text-sm text-black">
              {currentIndex + 1} / {routes.length} points
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        {routes.length > 0 && (
          <div className="mt-4">
            <input
              type="range"
              min="0"
              max={routes.length - 1}
              value={currentIndex}
              onChange={(e) => {
                setCurrentIndex(Number(e.target.value))
                setPlaying(false)
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-black mt-1">
              <span>{routes[0]?.timestamp ? new Date(routes[0].timestamp).toLocaleTimeString() : ''}</span>
              <span>{routes[routes.length - 1]?.timestamp ? new Date(routes[routes.length - 1].timestamp).toLocaleTimeString() : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-black mt-4">Loading route...</p>
            </div>
          </div>
        ) : routes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-black">No route data available</p>
          </div>
        ) : (
          <>
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.05},${mapCenter.lat - 0.05},${mapCenter.lng + 0.05},${mapCenter.lat + 0.05}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`}
              className="w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
            />
            
            {/* Route path overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Draw path up to current point */}
              <svg className="w-full h-full">
                {routes.slice(0, currentIndex + 1).map((route, idx) => {
                  if (idx === 0) return null
                  const prev = routes[idx - 1]
                  return (
                    <line
                      key={`line-${idx}`}
                      x1={`${((prev.lng - mapCenter.lng + 0.05) / 0.1) * 100}%`}
                      y1={`${((mapCenter.lat - prev.lat + 0.05) / 0.1) * 100}%`}
                      x2={`${((route.lng - mapCenter.lng + 0.05) / 0.1) * 100}%`}
                      y2={`${((mapCenter.lat - route.lat + 0.05) / 0.1) * 100}%`}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )
                })}
              </svg>
              
              {/* Current position marker */}
              {currentRoute && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  style={{
                    left: `${((currentRoute.lng - mapCenter.lng + 0.05) / 0.1) * 100}%`,
                    top: `${((mapCenter.lat - currentRoute.lat + 0.05) / 0.1) * 100}%`
                  }}
                >
                  <div className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg border-2 border-white">
                    {employeeId.charAt(0)}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {new Date(currentRoute.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

