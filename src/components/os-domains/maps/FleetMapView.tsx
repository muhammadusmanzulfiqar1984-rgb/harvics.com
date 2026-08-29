'use client'

import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline, Circle } from '@react-google-maps/api'

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
  Planned: '#8E8E93',
}

type MapVehicle = {
  id: string
  plate: string
  driver: string
  type: string
  lat: number
  lng: number
  status: 'Moving' | 'Stopped' | 'Loading' | 'Planned'
  route: string
  tripId?: string
  stopCount: number
}

type TripStop = { address?: string; lat?: number; lng?: number }

function mapFleetStatus(vehicleStatus: string, tripStatus?: string): MapVehicle['status'] {
  if (tripStatus === 'Active') return 'Moving'
  if (tripStatus === 'Planned') return 'Loading'
  if (vehicleStatus === 'InRoute') return 'Moving'
  if (vehicleStatus === 'Maintenance' || vehicleStatus === 'OffDuty') return 'Stopped'
  return 'Stopped'
}

function buildVehicles(vehs: any[], trips: any[]): MapVehicle[] {
  const activeByVehicle = new Map<string, any>()
  for (const trip of trips) {
    if (trip.status === 'Active' || trip.status === 'Planned') {
      activeByVehicle.set(trip.vehicleId, trip)
    }
  }

  return vehs
    .map((v) => {
      const trip = activeByVehicle.get(v.id)
      const stops = (Array.isArray(trip?.stops) ? trip.stops : []) as TripStop[]
      const withCoords = stops.filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
      if (withCoords.length === 0) return null

      const current = withCoords[0]
      const dest = withCoords[withCoords.length - 1]
      const routeLabel =
        withCoords.length >= 2
          ? `${current.address || 'Stop 1'} → ${dest.address || `Stop ${withCoords.length}`}`
          : current.address || v.plate

      return {
        id: v.id,
        plate: v.plate,
        driver: trip?.driver || v.driver || 'Unassigned',
        type: v.type,
        lat: current.lat as number,
        lng: current.lng as number,
        status: mapFleetStatus(v.status, trip?.status),
        route: routeLabel,
        tripId: trip?.id,
        stopCount: withCoords.length,
      }
    })
    .filter(Boolean) as MapVehicle[]
}

function buildRoutePaths(trips: any[]): Record<string, Array<{ lat: number; lng: number }>> {
  const paths: Record<string, Array<{ lat: number; lng: number }>> = {}
  for (const trip of trips) {
    if (trip.status !== 'Active') continue
    const stops = (Array.isArray(trip.stops) ? trip.stops : []) as TripStop[]
    const path = stops
      .filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
      .map((s) => ({ lat: s.lat as number, lng: s.lng as number }))
    if (path.length >= 2) paths[trip.vehicleId] = path
  }
  return paths
}

export default function FleetMapView() {
  const [vehicles, setVehicles] = useState<MapVehicle[]>([])
  const [routePaths, setRoutePaths] = useState<Record<string, Array<{ lat: number; lng: number }>>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [center, setCenter] = useState({ lat: 25.1124, lng: 55.139 })
  const [filter, setFilter] = useState<'All' | 'Moving' | 'Stopped' | 'Loading'>('All')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [loadError, setLoadError] = useState('')
  const [empty, setEmpty] = useState(false)

  const loadFleet = useCallback(async () => {
    try {
      const [vRes, tRes] = await Promise.all([
        fetch('/api/wave4/vehicles', { cache: 'no-store' }),
        fetch('/api/wave4/trips', { cache: 'no-store' }),
      ])
      const vJson = await vRes.json()
      const tJson = await tRes.json()
      const vehs = vJson.data || []
      const trips = tJson.data || []
      const mapped = buildVehicles(vehs, trips)
      setVehicles(mapped)
      setRoutePaths(buildRoutePaths(trips))
      setEmpty(mapped.length === 0)
      setLoadError('')
      setLastUpdate(new Date())
      if (mapped.length > 0) setCenter({ lat: mapped[0].lat, lng: mapped[0].lng })
    } catch (e: any) {
      setLoadError(e?.message || 'Failed to load fleet data')
    }
  }, [])

  useEffect(() => {
    void loadFleet()
    const interval = setInterval(() => void loadFleet(), 30000)
    return () => clearInterval(interval)
  }, [loadFleet])

  const { isLoaded, loadError: mapsLoadError } = useJsApiLoader({
    id: 'harvics-fleet-map',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  })

  const filtered = filter === 'All' ? vehicles : vehicles.filter((v) => v.status === filter)
  const selectedVehicle = vehicles.find((v) => v.id === selected)

  const movingCount = vehicles.filter((v) => v.status === 'Moving').length
  const stoppedCount = vehicles.filter((v) => v.status === 'Stopped').length

  return (
    <div className="flex h-full" style={{ minHeight: 600 }}>
      <div className="w-72 bg-white border-r border-[#E5E5EA] flex flex-col overflow-hidden flex-shrink-0">
        <div className="px-4 py-4 border-b border-[#E5E5EA]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Live Fleet</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-[#8E8E93]">
              {lastUpdate && (
                <>
                  <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full animate-pulse" />
                  {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </>
              )}
            </div>
          </div>
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
              <p className="text-base font-semibold text-[#007AFF]">{vehicles.filter((v) => v.status === 'Loading').length}</p>
              <p className="text-[10px] text-[#8E8E93]">Planned</p>
            </div>
          </div>
          <div className="flex gap-1">
            {(['All', 'Moving', 'Stopped', 'Loading'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1 text-[10px] rounded-full font-medium transition-colors ${filter === f ? 'bg-harvics-burgundy text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#F5F5F7]">
          {loadError && <p className="px-4 py-3 text-xs text-red-600">{loadError}</p>}
          {empty && !loadError && (
            <p className="px-4 py-6 text-xs text-[#8E8E93] text-center">
              No vehicles with trip coordinates yet. Add vehicles and plan trips with lat/lng stops in Module #25.
            </p>
          )}
          {filtered.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setSelected(v.id)
                setCenter({ lat: v.lat, lng: v.lng })
              }}
              className={`w-full text-left px-4 py-3 transition-colors hover:bg-[#F9F9FB] ${selected === v.id ? 'bg-[#F9F9FB] border-l-2 border-harvics-burgundy' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#1A1A1A]">{v.plate}</span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[v.status] + '20', color: STATUS_COLORS[v.status] }}
                >
                  {v.status}
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">{v.driver}</p>
              <p className="text-[10px] text-[#C7C7CC] mt-0.5 truncate">{v.route}</p>
              <p className="text-[10px] text-[#8E8E93] mt-1">{v.stopCount} stops</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        {mapsLoadError ? (
          <div className="flex items-center justify-center h-full bg-[#F5F5F7]">
            <div className="text-center p-8">
              <p className="text-[#1A1A1A] font-semibold mb-2">Maps failed to load</p>
              <p className="text-sm text-[#8E8E93]">{mapsLoadError.message}</p>
            </div>
          </div>
        ) : !isLoaded ? (
          <div className="flex items-center justify-center h-full bg-[#F5F5F7]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-harvics-burgundy mx-auto mb-3" />
              <p className="text-sm text-[#8E8E93]">Loading Google Maps…</p>
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={center}
            zoom={selected ? 13 : 10}
            options={{
              styles: MAP_STYLE,
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {Object.entries(routePaths).map(([vehicleId, path]) => {
              const v = vehicles.find((x) => x.id === vehicleId)
              if (!v) return null
              return (
                <Polyline
                  key={vehicleId + '-route'}
                  path={path}
                  options={{
                    strokeColor: STATUS_COLORS[v.status],
                    strokeOpacity: 0.4,
                    strokeWeight: 3,
                    geodesic: true,
                  }}
                />
              )
            })}

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
              >
                {selected === v.id && (
                  <InfoWindow onCloseClick={() => setSelected(null)} position={{ lat: v.lat, lng: v.lng }}>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-[#1A1A1A]">{v.plate}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: STATUS_COLORS[v.status] + '20', color: STATUS_COLORS[v.status] }}
                        >
                          {v.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#8E8E93] mb-1">👤 {v.driver}</p>
                      <p className="text-xs text-[#8E8E93] mb-1">🚛 {v.type}</p>
                      <p className="text-xs text-[#8E8E93] mb-1">🗺 {v.route}</p>
                      <p className="text-xs text-[#8E8E93]">{v.stopCount} stops on trip</p>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}

            {selectedVehicle && (
              <Circle
                center={{ lat: selectedVehicle.lat, lng: selectedVehicle.lng }}
                radius={800}
                options={{
                  strokeColor: STATUS_COLORS[selectedVehicle.status],
                  strokeOpacity: 0.4,
                  strokeWeight: 2,
                  fillColor: STATUS_COLORS[selectedVehicle.status],
                  fillOpacity: 0.06,
                }}
              />
            )}
          </GoogleMap>
        )}

        {selectedVehicle && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg border border-[#E5E5EA] p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#1A1A1A]">{selectedVehicle.plate}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: STATUS_COLORS[selectedVehicle.status] + '20',
                      color: STATUS_COLORS[selectedVehicle.status],
                    }}
                  >
                    {selectedVehicle.status}
                  </span>
                </div>
                <p className="text-sm text-[#8E8E93]">
                  {selectedVehicle.driver} · {selectedVehicle.type}
                </p>
                <p className="text-xs text-[#8E8E93] mt-0.5">{selectedVehicle.route}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#8E8E93] hover:text-[#1A1A1A] text-lg leading-none">
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
