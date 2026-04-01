'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline, Circle } from '@react-google-maps/api'

// ── Live vehicle data with realistic global coordinates ──────────────────────
const MOCK_FLEET = [
  { id: 'TRK-001', driver: 'Ahmed Al-Hassan', type: 'Heavy Truck', lat: 25.2048, lng: 55.2708, speed: 62, status: 'Moving', route: 'Dubai → Sharjah', cargo: 'Beverages 12 pallets', battery: 88, fuel: 72, eta: '14 min' },
  { id: 'TRK-002', driver: 'Rajesh Kumar', type: 'Van', lat: 25.1972, lng: 55.2744, speed: 0, status: 'Stopped', route: 'Dubai Marina delivery', cargo: 'FMCG 4 pallets', battery: 91, fuel: 55, eta: 'Delivered' },
  { id: 'TRK-003', driver: 'Omar Abdullah', type: 'Pickup', lat: 25.2317, lng: 55.3097, speed: 48, status: 'Moving', route: 'JLT → DIP', cargo: 'Personal Care 2 pallets', battery: 67, fuel: 40, eta: '28 min' },
  { id: 'TRK-004', driver: 'Tariq Malik', type: 'Heavy Truck', lat: 24.4539, lng: 54.3773, speed: 75, status: 'Moving', route: 'Abu Dhabi → Dubai', cargo: 'Mixed FMCG 18 pallets', battery: 95, fuel: 81, eta: '1h 12min' },
  { id: 'TRK-005', driver: 'Mohammed Rashid', type: 'Van', lat: 25.0657, lng: 55.1713, speed: 0, status: 'Loading', route: 'Jebel Ali Port', cargo: 'Loading in progress', battery: 100, fuel: 90, eta: 'Loading' },
  { id: 'TRK-006', driver: 'Fatima Al-Zaabi', type: 'Pickup', lat: 25.2854, lng: 55.3728, speed: 34, status: 'Moving', route: 'Deira → Airport Freezone', cargo: 'Confectionery 3 pallets', battery: 72, fuel: 63, eta: '19 min' },
]

const ROUTE_PATHS: Record<string, Array<{ lat: number; lng: number }>> = {
  'TRK-001': [
    { lat: 25.2048, lng: 55.2708 }, { lat: 25.2165, lng: 55.2821 }, { lat: 25.2285, lng: 55.2956 },
    { lat: 25.2401, lng: 55.3120 }, { lat: 25.3462, lng: 55.4209 }
  ],
  'TRK-003': [
    { lat: 25.2317, lng: 55.3097 }, { lat: 25.2198, lng: 55.2915 }, { lat: 25.2089, lng: 55.2612 }
  ],
  'TRK-004': [
    { lat: 24.4539, lng: 54.3773 }, { lat: 24.6211, lng: 54.7890 }, { lat: 24.9517, lng: 55.0653 }, { lat: 25.2048, lng: 55.2708 }
  ],
}

const LIBRARIES: ('places' | 'geometry' | 'drawing')[] = ['places', 'geometry']

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f7' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f7' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
]

const STATUS_COLORS: Record<string, string> = {
  Moving: '#34C759',
  Stopped: '#FF9500',
  Loading: '#007AFF',
  Breakdown: '#FF3B30',
}

type Vehicle = typeof MOCK_FLEET[0]

export default function FleetMapView() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_FLEET)
  const [selected, setSelected] = useState<string | null>(null)
  const [center, setCenter] = useState({ lat: 25.1124, lng: 55.1390 })
  const [filter, setFilter] = useState<'All' | 'Moving' | 'Stopped' | 'Loading'>('All')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const tickRef = useRef(0)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'harvics-fleet-map',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  })

  // Simulate vehicle movement — jitter positions slightly every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1
      setVehicles(prev => prev.map(v => {
        if (v.status !== 'Moving') return v
        return {
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 0.0015,
          lng: v.lng + (Math.random() - 0.5) * 0.0015,
          speed: Math.max(20, Math.min(90, v.speed + (Math.random() - 0.5) * 8)),
          fuel: Math.max(5, v.fuel - 0.05),
        }
      }))
      setLastUpdate(new Date())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === 'All' ? vehicles : vehicles.filter(v => v.status === filter)
  const selectedVehicle = vehicles.find(v => v.id === selected)

  const movingCount = vehicles.filter(v => v.status === 'Moving').length
  const stoppedCount = vehicles.filter(v => v.status === 'Stopped').length

  return (
    <div className="flex h-full" style={{ minHeight: 600 }}>
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <div className="w-72 bg-white border-r border-[#E5E5EA] flex flex-col overflow-hidden flex-shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-[#E5E5EA]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1D1D1F]">Live Fleet</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-[#8E8E93]">
              <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full animate-pulse" />
              {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
          {/* Status pills */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <div className="rounded-lg bg-[#F0FFF4] p-2 text-center">
              <p className="text-base font-semibold text-[#34C759]">{movingCount}</p>
              <p className="text-[10px] text-[#8E8E93]">Moving</p>
            </div>
            <div className="rounded-lg bg-[#FFF8F0] p-2 text-center">
              <p className="text-base font-semibold text-[#FF9500]">{stoppedCount}</p>
              <p className="text-[10px] text-[#8E8E93]">Stopped</p>
            </div>
            <div className="rounded-lg bg-[#F0F7FF] p-2 text-center">
              <p className="text-base font-semibold text-[#007AFF]">{vehicles.filter(v => v.status === 'Loading').length}</p>
              <p className="text-[10px] text-[#8E8E93]">Loading</p>
            </div>
          </div>
          {/* Filter */}
          <div className="flex gap-1">
            {(['All', 'Moving', 'Stopped', 'Loading'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-1 py-1 text-[10px] rounded-full font-medium transition-colors ${filter === f ? 'bg-[#6B1F2B] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F5F5F7]">
          {filtered.map(v => (
            <button key={v.id} onClick={() => { setSelected(v.id); setCenter({ lat: v.lat, lng: v.lng }); }}
              className={`w-full text-left px-4 py-3 transition-colors hover:bg-[#F9F9FB] ${selected === v.id ? 'bg-[#F9F9FB] border-l-2 border-[#6B1F2B]' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#1D1D1F]">{v.id}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[v.status] + '20', color: STATUS_COLORS[v.status] }}>
                  {v.status}
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">{v.driver}</p>
              <p className="text-[10px] text-[#C7C7CC] mt-0.5 truncate">{v.route}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] text-[#8E8E93]">⛽ {v.fuel.toFixed(0)}%</span>
                <span className="text-[10px] text-[#8E8E93]">🚀 {v.speed.toFixed(0)} km/h</span>
                {v.eta !== 'Delivered' && v.eta !== 'Loading' && (
                  <span className="text-[10px] text-[#34C759]">ETA {v.eta}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Map area ─────────────────────────────────────────── */}
      <div className="flex-1 relative">
        {loadError ? (
          <div className="flex items-center justify-center h-full bg-[#F5F5F7]">
            <div className="text-center p-8">
              <p className="text-[#1D1D1F] font-semibold mb-2">Maps failed to load</p>
              <p className="text-sm text-[#8E8E93]">{loadError.message}</p>
            </div>
          </div>
        ) : !isLoaded ? (
          <div className="flex items-center justify-center h-full bg-[#F5F5F7]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6B1F2B] mx-auto mb-3" />
              <p className="text-sm text-[#8E8E93]">Loading Google Maps…</p>
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={center}
            zoom={selected ? 13 : 10}
            options={{ styles: MAP_STYLE, disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}
          >
            {/* Route polylines */}
            {vehicles.filter(v => v.status === 'Moving' && ROUTE_PATHS[v.id]).map(v => (
              <Polyline key={v.id + '-route'} path={ROUTE_PATHS[v.id]}
                options={{ strokeColor: STATUS_COLORS[v.status], strokeOpacity: 0.4, strokeWeight: 3, geodesic: true }} />
            ))}

            {/* Vehicle markers */}
            {filtered.map((v) => (
              <Marker
                key={v.id}
                position={{ lat: v.lat, lng: v.lng }}
                onClick={() => setSelected(v.id === selected ? null : v.id)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: STATUS_COLORS[v.status],
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
                label={{ text: v.id.split('-')[1], color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}
              >
                {selected === v.id && (
                  <InfoWindow onCloseClick={() => setSelected(null)} position={{ lat: v.lat, lng: v.lng }}>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-[#1D1D1F]">{v.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: STATUS_COLORS[v.status] + '20', color: STATUS_COLORS[v.status] }}>{v.status}</span>
                      </div>
                      <p className="text-xs text-[#8E8E93] mb-1">👤 {v.driver}</p>
                      <p className="text-xs text-[#8E8E93] mb-1">🚛 {v.type}</p>
                      <p className="text-xs text-[#8E8E93] mb-1">📦 {v.cargo}</p>
                      <p className="text-xs text-[#8E8E93] mb-1">🗺 {v.route}</p>
                      <div className="flex gap-3 mt-2 pt-2 border-t border-[#E5E5EA]">
                        <span className="text-xs"><span className="text-[#8E8E93]">Speed</span> <b>{v.speed.toFixed(0)} km/h</b></span>
                        <span className="text-xs"><span className="text-[#8E8E93]">Fuel</span> <b>{v.fuel.toFixed(0)}%</b></span>
                      </div>
                      {v.eta !== 'Delivered' && (
                        <p className="text-xs mt-1.5 text-[#34C759] font-medium">ETA: {v.eta}</p>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}

            {/* Pulse ring on selected */}
            {selectedVehicle && (
              <Circle
                center={{ lat: selectedVehicle.lat, lng: selectedVehicle.lng }}
                radius={800}
                options={{ strokeColor: STATUS_COLORS[selectedVehicle.status], strokeOpacity: 0.4, strokeWeight: 2, fillColor: STATUS_COLORS[selectedVehicle.status], fillOpacity: 0.06 }}
              />
            )}
          </GoogleMap>
        )}

        {/* Selected vehicle detail overlay */}
        {selectedVehicle && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg border border-[#E5E5EA] p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#1D1D1F]">{selectedVehicle.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: STATUS_COLORS[selectedVehicle.status] + '20', color: STATUS_COLORS[selectedVehicle.status] }}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <p className="text-sm text-[#8E8E93]">{selectedVehicle.driver} · {selectedVehicle.type}</p>
                <p className="text-xs text-[#8E8E93] mt-0.5">{selectedVehicle.route}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#8E8E93] hover:text-[#1D1D1F] text-lg leading-none">×</button>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-[#E5E5EA]">
              {[
                { label: 'Speed', value: `${selectedVehicle.speed.toFixed(0)} km/h` },
                { label: 'Fuel', value: `${selectedVehicle.fuel.toFixed(0)}%` },
                { label: 'Battery', value: `${selectedVehicle.battery}%` },
                { label: 'ETA', value: selectedVehicle.eta },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-sm font-semibold text-[#1D1D1F]">{m.value}</p>
                  <p className="text-[10px] text-[#8E8E93]">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

