'use client'

import React, { useEffect, useRef, useState } from 'react'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

// Key Harvics markets to plot on the globe
const MARKETS = [
  { name: 'London', lng: -0.1276, lat: 51.5074 },
  { name: 'Dubai', lng: 55.2708, lat: 25.2048 },
  { name: 'New York', lng: -74.006, lat: 40.7128 },
  { name: 'Milan', lng: 9.1900, lat: 45.4654 },
  { name: 'Mumbai', lng: 72.8777, lat: 19.0760 },
  { name: 'Singapore', lng: 103.8198, lat: 1.3521 },
  { name: 'Lagos', lng: 3.3792, lat: 6.5244 },
  { name: 'Istanbul', lng: 28.9784, lat: 41.0082 },
  { name: 'São Paulo', lng: -46.6333, lat: -23.5505 },
  { name: 'Tokyo', lng: 139.6917, lat: 35.6895 },
  { name: 'Karachi', lng: 67.0099, lat: 24.8607 },
  { name: 'Cairo', lng: 31.2357, lat: 30.0444 },
]

export default function HarvicsGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) return

    if (!MAPBOX_TOKEN) {
      setError('NEXT_PUBLIC_MAPBOX_TOKEN is not set. Add it to .env.local to enable the globe.')
      return
    }

    let loadTimeout: NodeJS.Timeout | null = null
    let didLoad = false
    let rafId: number | null = null
    let rotateStarted = false
    let isVisible = false
    let cancelled = false
    let visibilityObserver: IntersectionObserver | null = null

    import('mapbox-gl').then((mapboxgl) => {
      // If the effect was torn down (strict-mode double mount) before the
      // dynamic import resolved, do NOT create an orphan map that would keep
      // a rAF loop alive on a disposed container.
      if (cancelled || !mapContainer.current) return

      mapboxgl.default.accessToken = MAPBOX_TOKEN

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
        zoom: 1.4,
        center: [20, 25],
        pitch: 0,
        // Critical: do NOT hijack page wheel scroll
        scrollZoom: false,
        boxZoom: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
        dragRotate: false,
        dragPan: false,
        keyboard: false,
        interactive: false,
        attributionControl: false,
      })

      mapRef.current = map

      map.on('error', () => {
        if (!didLoad) {
          setError('Map tiles could not load. Please check internet or token permissions.')
        }
      })

      map.on('load', () => {
        didLoad = true
        setLoaded(true)
        // Defer resize one frame so the container has its final laid-out size
        requestAnimationFrame(() => map.resize())
        // And once more after fonts/layout settle
        setTimeout(() => map.resize(), 250)
      })

      map.on('style.load', () => {
        map.setFog({
          color: 'rgb(12, 12, 20)',
          'high-color': 'rgb(30, 20, 50)',
          'horizon-blend': 0.05,
          'space-color': 'rgb(4, 4, 12)',
          'star-intensity': 0.6,
        })

        // Make continent/country division lines gold.
        if (map.getLayer('country-boundaries-dash')) {
          map.setPaintProperty('country-boundaries-dash', 'line-color', '#C3A35E')
          map.setPaintProperty('country-boundaries-dash', 'line-opacity', 0.4)
        }

        // Hide default Mapbox place labels so only branded city labels remain visible.
        map.getStyle().layers?.forEach((layer) => {
          if (layer.type === 'symbol' && (layer as any).layout?.['text-field']) {
            map.setLayoutProperty(layer.id, 'visibility', 'none')
          }
        })

        // Add branded market markers with always-visible city labels.
        MARKETS.forEach((m) => {
          const el = document.createElement('div')
          el.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:translateY(-6px);'
          el.innerHTML = `
            <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;width:24px;height:24px;border:1.5px solid rgba(201,168,76,0.55);border-radius:50%;animation:harvics-globe-pulse 2s ease-out infinite;"></div>
              <div style="width:10px;height:10px;background:#C3A35E;border-radius:50%;box-shadow:0 0 10px rgba(201,168,76,0.95);position:relative;z-index:2;"></div>
            </div>
            <div style="margin-top:4px;font-size:10px;line-height:1.1;color:#FFD700;font-family:Georgia,serif;white-space:nowrap;text-align:center;text-shadow:0 0 8px rgba(201,168,76,0.35);">${m.name}</div>
          `

          new mapboxgl.default.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([m.lng, m.lat])
            .addTo(map)
        })

      })

      // Slow auto-rotate — only while section is on-screen, throttled to ~30fps
      let userInteracting = false
      map.on('mousedown', () => { userInteracting = true })
      map.on('mouseup', () => { userInteracting = false })

      let lastTick = 0
      const rotate = (ts: number) => {
        if (cancelled) return
        if (isVisible && !userInteracting && ts - lastTick > 33) {
          lastTick = ts
          const c = map.getCenter()
          map.setCenter([(c.lng + 0.12) % 360, c.lat])
        }
        rafId = requestAnimationFrame(rotate)
      }
      map.on('load', () => {
        if (rotateStarted || cancelled) return
        rotateStarted = true
        rafId = requestAnimationFrame(rotate)
      })

      // Pause rotation when section is off-screen. One-shot resize on visibility
      // transition (NO ResizeObserver — that was feeding back into mapbox's
      // own canvas resize and ballooning the section to 100k+ px).
      if (mapContainer.current) {
        visibilityObserver = new IntersectionObserver(
          ([entry]) => {
            isVisible = entry.isIntersecting && entry.intersectionRatio > 0.1
            if (isVisible && mapRef.current) {
              requestAnimationFrame(() => mapRef.current?.resize())
            }
          },
          { threshold: [0, 0.1, 0.5] }
        )
        visibilityObserver.observe(mapContainer.current)
      }

      loadTimeout = setTimeout(() => {
        if (!didLoad) {
          setError('Map is taking too long to load. Showing fallback view.')
        }
      }, 10000)
    }).catch(() => {
      setError('Failed to load mapbox-gl.')
    })

    return () => {
      cancelled = true
      if (loadTimeout) clearTimeout(loadTimeout)
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (visibilityObserver) visibilityObserver.disconnect()
      try { mapRef.current?.remove() } catch {}
      mapRef.current = null
    }
  }, [])

  return (
    <section
      className="relative w-full overflow-hidden bg-[#06080a]"
      style={{ height: 'calc(100vh - 136px)', minHeight: 'calc(100vh - 136px)' }}
    >
      {/* Header */}
      <div className="absolute top-10 left-8 md:left-14 z-10 max-w-xl">
        <p style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em',
          color: '#C3A35E', textTransform: 'uppercase', marginBottom: '12px',
          borderLeft: '2px solid #C3A35E', paddingLeft: '10px',
        }}>
          42 Active Markets &nbsp;·&nbsp; Global Reach
        </p>
        <h2 style={{
          fontSize: 'clamp(24px, 3vw, 44px)', fontWeight: 600,
          color: '#E6ECFF', lineHeight: 1.1, letterSpacing: '-0.03em',
        }}>
          Where we trade.
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
          Hover over a market to explore Harvics presence.
        </p>
      </div>

      {/* Globe or error */}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
          <div style={{
            border: '1px solid rgba(195,163,94,0.3)',
            background: 'rgba(10,10,10,0.8)',
            padding: '32px 40px',
            maxWidth: '480px',
          }}>
            <p className="text-[#C3A35E] text-sm font-mono mb-2">⚠ Globe unavailable</p>
            <p className="text-white/50 text-xs">{error}</p>
          </div>
          {/* Fallback: static dot grid of markets */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {MARKETS.map(m => (
              <div key={m.name} className="text-center">
                <div style={{ width: 8, height: 8, background: '#C3A35E', borderRadius: '50%', margin: '0 auto 4px' }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={mapContainer}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            touchAction: 'pan-y',
          }}
        />
      )}

      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#06080a]">
          <div className="w-10 h-10 border-2 border-[#C3A35E] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <style jsx global>{`
        @keyframes harvics-globe-pulse {
          0% {
            transform: scale(0.7);
            opacity: 0.85;
          }
          70% {
            transform: scale(1.9);
            opacity: 0;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  )
}
