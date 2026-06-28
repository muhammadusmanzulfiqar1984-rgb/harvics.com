import React, { useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 20,
  lng: 0
};

export const GoogleMapComponent = ({ shipments, selectedShipment, onSelectShipment, onMapClick, isNaked, corridors = [] }: any) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [hoveredCorridor, setHoveredCorridor] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: !isNaked,
    styles: [
      {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#ffffff" }]
      },
      {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#000000" }, { lightness: 13 }]
      },
      {
        featureType: "administrative",
        elementType: "geometry.fill",
        stylers: [{ color: "#000000" }]
      },
      {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{ color: "#144b53" }, { lightness: 14 }, { weight: 1.4 }]
      },
      {
        featureType: "landscape",
        elementType: "all",
        stylers: [{ color: "#08304b" }]
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#0c4152" }, { lightness: 5 }]
      },
      {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [{ color: "#000000" }]
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#0b434f" }, { lightness: 25 }]
      },
      {
        featureType: "road.arterial",
        elementType: "geometry.fill",
        stylers: [{ color: "#000000" }]
      },
      {
        featureType: "road.arterial",
        elementType: "geometry.stroke",
        stylers: [{ color: "#0b3d51" }, { lightness: 16 }]
      },
      {
        featureType: "road.local",
        elementType: "geometry",
        stylers: [{ color: "#000000" }]
      },
      {
        featureType: "transit",
        elementType: "all",
        stylers: [{ color: "#146474" }]
      },
      {
        featureType: "water",
        elementType: "all",
        stylers: [{ color: "#021019" }]
      }
    ]
  }), [isNaked]);

  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-[#08304b] text-white">Loading Maps...</div>;

  return (
    <div className="w-full h-full relative" onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2}
        options={mapOptions}
        onClick={(e) => {
          if (onMapClick && e.latLng) {
            onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }
        }}
      >
        {/* Render Corridors */}
        {corridors.map((corridor: any) => (
          <Polyline
            key={corridor.id}
            path={[
              { lat: corridor.from[1], lng: corridor.from[0] },
              { lat: corridor.to[1], lng: corridor.to[0] }
            ]}
            options={{
              strokeColor: hoveredCorridor?.id === corridor.id ? '#D4AF37' : '#5A0F1A',
              strokeOpacity: 0.8,
              strokeWeight: hoveredCorridor?.id === corridor.id ? 4 : 2,
              geodesic: true,
            }}
            onMouseOver={() => setHoveredCorridor(corridor)}
            onMouseOut={() => setHoveredCorridor(null)}
          />
        ))}

        {shipments.map((shipment: any) => {
          // Mock coordinates if not provided
          const lat = shipment.lat || (Math.random() * 40 - 20);
          const lng = shipment.lng || (Math.random() * 80 - 40);
          
          return (
            <Marker
              key={shipment.id}
              position={{ lat, lng }}
              onClick={() => {
                setActiveMarker(shipment.id);
                if (onSelectShipment) onSelectShipment(shipment);
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: shipment.status === 'Delayed' ? '#e11d48' : '#10b981',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff'
              }}
            >
              {activeMarker === shipment.id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="maroon-text p-2">
                    <h3 className="font-bold text-sm">{shipment.name}</h3>
                    <p className="text-xs">{shipment.route}</p>
                    <p className="text-xs font-semibold mt-1">Status: {shipment.status}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>

      {/* Elegant Tooltip for Corridors */}
      <AnimatePresence>
        {hoveredCorridor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: 'fixed',
              left: mousePos.x + 20,
              top: mousePos.y + 20,
              zIndex: 1000,
              pointerEvents: 'none'
            }}
            className="bg-white/90 backdrop-blur-xl border border-harvics-maroon/10 p-5 rounded-[24px] shadow-[0_16px_48px_rgba(90,15,26,0.15)] min-w-[220px]"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-harvics-maroon/5 pb-2">
                <div className="w-2 h-2 rounded-full bg-harvics-gold animate-pulse" />
                <h4 className="font-serif text-sm maroon-text font-bold uppercase tracking-wider">
                  {hoveredCorridor.name}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-widest maroon-text opacity-40 font-bold">Volume</span>
                  <span className="text-xs maroon-text font-medium">{hoveredCorridor.metrics.volume}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-widest maroon-text opacity-40 font-bold">Risk Level</span>
                  <span className={`text-xs font-bold ${
                    hoveredCorridor.metrics.risk === 'Low' ? 'text-emerald-600' : 
                    hoveredCorridor.metrics.risk === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {hoveredCorridor.metrics.risk}
                  </span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-[8px] uppercase tracking-widest maroon-text opacity-40 font-bold">Avg. Transit Time</span>
                  <span className="text-xs maroon-text font-medium">{hoveredCorridor.metrics.avgTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
