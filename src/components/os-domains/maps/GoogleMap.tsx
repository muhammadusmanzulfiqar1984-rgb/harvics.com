'use client'

import { useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api'

interface Location {
  lat: number
  lng: number
  label?: string
  info?: string
}

interface GoogleMapComponentProps {
  center: { lat: number; lng: number }
  zoom?: number
  markers?: Location[]
  selectedMarker?: number | null
  onMarkerClick?: (index: number) => void
  directions?: google.maps.DirectionsResult | null
  height?: string
  mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  apiKey?: string
}

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places', 'geometry']

export default function GoogleMapComponent({
  center,
  zoom = 10,
  markers = [],
  selectedMarker = null,
  onMarkerClick,
  directions = null,
  height = '100%',
  mapTypeId = 'roadmap',
  apiKey
}: GoogleMapComponentProps) {
  // Get API key from environment or prop
  const mapsApiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey,
    libraries
  })

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      mapTypeId,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    }),
    [mapTypeId]
  )

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold">Error loading Google Maps</p>
          <p className="text-sm text-black mt-2">
            {loadError.message || 'Please check your API key configuration'}
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-black mt-4">Loading Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height, width: '100%' }}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        {/* Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            label={marker.label}
            onClick={() => onMarkerClick && onMarkerClick(index)}
            animation={selectedMarker === index ? google.maps.Animation.BOUNCE : undefined}
          >
            {selectedMarker === index && marker.info && (
              <InfoWindow
                position={{ lat: marker.lat, lng: marker.lng }}
                onCloseClick={() => onMarkerClick && onMarkerClick(-1)}
              >
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{marker.label || 'Location'}</h3>
                  <p className="text-xs text-black mt-1">{marker.info}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Directions */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  )
}

