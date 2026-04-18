'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

const OFFICES = [
  { id: 'london',  city: 'London',   role: 'Headquarters', country: 'United Kingdom', flag: '🇬🇧', cx: 487, cy: 165, isHQ: true  },
  { id: 'newyork', city: 'New York', role: 'Trade Office', country: 'United States',  flag: '🇺🇸', cx: 261, cy: 178, isHQ: false },
  { id: 'dubai',   city: 'Dubai',    role: 'Regional Hub', country: 'UAE',            flag: '🇦🇪', cx: 590, cy: 213, isHQ: false },
  { id: 'karachi', city: 'Karachi',  role: 'Sourcing Hub', country: 'Pakistan',       flag: '🇵🇰', cx: 617, cy: 203, isHQ: false },
  { id: 'milan',   city: 'Milan',    role: 'Procurement',  country: 'Italy',          flag: '🇮🇹', cx: 505, cy: 170, isHQ: false },
]

const ROUTES = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 0, to: 4 },
  { from: 2, to: 3 },
]

function arc(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.28
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
}

function pathLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.5
}

function useCountUp(target: number, dur: number, go: boolean) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!go) return
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1)
      setV(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [go, target, dur])
  return v
}

export default function InteractiveWorldMap() {
  const [active, setActive]         = useState(0)
  const [ak, setAk]                 = useState(0)
  const [worldPaths, setWorldPaths] = useState<string[]>([])
  const [hoveredPath, setHoveredPath] = useState<number | null>(null)
  const [hoveredDot, setHoveredDot] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const offices = useCountUp(5, 1200, visible)
  const markets = useCountUp(42, 1600, visible)
  const volume = useCountUp(14, 1400, visible)
  const industries = useCountUp(10, 1000, visible)

  useEffect(() => {
    fetch('/world-paths.json').then(r => r.json()).then(setWorldPaths)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const go = useCallback((i: number) => { setActive(i); setAk(k => k + 1) }, [])

  useEffect(() => {
    timer.current = setInterval(() => {
      setActive(p => { const n = (p + 1) % OFFICES.length; setAk(k => k + 1); return n })
    }, 4000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  return (
    <section ref={sectionRef} style={{ background: '#ffffff', padding: '40px 0 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      {/* Heading */}
      <div style={{
        textAlign: 'center', marginBottom: 20,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ height: 1, width: 28, background: 'linear-gradient(90deg, transparent, #C3A35E)' }} />
          <span style={{ color: '#C3A35E', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Global Presence</span>
          <div style={{ height: 1, width: 28, background: 'linear-gradient(90deg, #C3A35E, transparent)' }} />
        </div>
        <h2 style={{ color: '#1d1d1f', fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {offices} Offices.{' '}
          <span style={{ background: 'linear-gradient(135deg, #C3A35E 0%, #6B1F2B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {markets}+ Markets.
          </span>
        </h2>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        {/* Map container with gold shimmer border */}
        <div className="map-gold-container" style={{
          position: 'relative',
          borderRadius: 14,
          overflow: 'hidden',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
        }}>
          <svg viewBox="0 0 1000 480" style={{ width: '100%', display: 'block' }}>
            <defs>
              <linearGradient id="ocean" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#f5f0eb" />
                <stop offset="100%" stopColor="#ede6dc" />
              </linearGradient>
              <linearGradient id="land" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#6b1f2b" />
                <stop offset="100%" stopColor="#521828" />
              </linearGradient>
              <linearGradient id="goldArc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C3A35E" />
                <stop offset="50%" stopColor="#f0d08e" />
                <stop offset="100%" stopColor="#C3A35E" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="dotglow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="bigglow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="8" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Ocean background */}
            <rect width="1000" height="480" fill="url(#ocean)" />

            {/* Land */}
            <g>
              {worldPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill={hoveredPath === i ? '#7d2a38' : 'url(#land)'}
                  stroke={hoveredPath === i ? 'rgba(195,163,94,0.5)' : 'rgba(195,163,94,0.15)'}
                  strokeWidth={hoveredPath === i ? 0.8 : 0.4}
                  style={{ transition: 'fill 0.3s ease, stroke 0.3s ease', cursor: 'default' }}
                  onMouseEnter={() => setHoveredPath(i)}
                  onMouseLeave={() => setHoveredPath(null)}
                />
              ))}
            </g>

            {/* Trade route arcs — thicker gold with glow */}
            {ROUTES.map((r, i) => {
              const a = OFFICES[r.from], b = OFFICES[r.to]
              const d = arc(a.cx, a.cy, b.cx, b.cy)
              const len = pathLen(a.cx, a.cy, b.cx, b.cy)
              const hot = r.from === active || r.to === active
              return (
                <g key={`${ak}-${i}`}>
                  {/* Glow trail behind the arc */}
                  {hot && (
                    <path d={d} fill="none"
                      stroke="rgba(195,163,94,0.25)"
                      strokeWidth={4}
                      filter="url(#glow)"
                      strokeDasharray={len}
                      strokeDashoffset={len}
                      style={{ animation: `drawArc 1.6s ease forwards ${i * 0.15}s` }}
                    />
                  )}
                  {/* Main arc line */}
                  <path d={d} fill="none"
                    stroke={hot ? 'url(#goldArc)' : 'rgba(195,163,94,0.2)'}
                    strokeWidth={hot ? 2.5 : 1}
                    filter={hot ? 'url(#glow)' : undefined}
                    strokeDasharray={len}
                    strokeDashoffset={len}
                    style={{ animation: `drawArc 1.6s ease forwards ${i * 0.15}s` }}
                  />
                  {/* Travelling dot */}
                  {hot && (
                    <circle r="4.5" fill="#f0d08e" filter="url(#glow)">
                      <animateMotion dur={`${3 + i * 0.2}s`} repeatCount="indefinite" path={d} />
                    </circle>
                  )}
                </g>
              )
            })}

            {/* City dots — larger, pulsing */}
            {OFFICES.map((o, i) => {
              const isA = i === active
              const isH = i === hoveredDot
              const labelRight = o.id !== 'newyork'
              return (
                <g key={o.id} style={{ cursor: 'pointer' }}
                  onClick={() => go(i)}
                  onMouseEnter={() => setHoveredDot(i)}
                  onMouseLeave={() => setHoveredDot(null)}
                >
                  {/* Pulse rings for active */}
                  {isA && (
                    <>
                      <circle cx={o.cx} cy={o.cy} fill="none" stroke="rgba(195,163,94,0.5)" strokeWidth="1.2">
                        <animate attributeName="r" values="6;32" dur="2.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="2.2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={o.cx} cy={o.cy} fill="none" stroke="rgba(195,163,94,0.35)" strokeWidth="0.8">
                        <animate attributeName="r" values="6;24" dur="2.2s" begin="0.7s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0" dur="2.2s" begin="0.7s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={o.cx} cy={o.cy} fill="none" stroke="rgba(195,163,94,0.2)" strokeWidth="0.6">
                        <animate attributeName="r" values="6;18" dur="2.2s" begin="1.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0" dur="2.2s" begin="1.4s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  {/* Main dot */}
                  <circle cx={o.cx} cy={o.cy} r={isA ? 7 : isH ? 6 : 4.5}
                    fill={isA ? '#C3A35E' : isH ? '#d4b36a' : 'rgba(195,163,94,0.6)'}
                    filter={isA ? 'url(#bigglow)' : isH ? 'url(#dotglow)' : undefined}
                    style={{ transition: 'r 0.3s ease, fill 0.3s ease' }}
                  />
                  <circle cx={o.cx} cy={o.cy} r={isA ? 2.5 : 1.8} fill="#fff" />

                  {/* Label */}
                  <text
                    x={labelRight ? o.cx + 12 : o.cx - 12}
                    y={o.cy - 10}
                    fontSize={isA ? 10 : 8}
                    fill={isA ? '#C3A35E' : isH ? '#C3A35E' : 'rgba(195,163,94,0.5)'}
                    fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                    textAnchor={labelRight ? 'start' : 'end'}
                    fontWeight={isA || isH ? 'bold' : 'normal'}
                    style={{ transition: 'fill 0.3s ease, font-size 0.3s ease' }}
                  >
                    {o.city}
                  </text>

                  {/* Hover tooltip */}
                  {isH && !isA && (
                    <g>
                      <rect
                        x={labelRight ? o.cx + 10 : o.cx - 100}
                        y={o.cy - 32}
                        width={90} height={20} rx={4}
                        fill="rgba(26,13,0,0.85)"
                      />
                      <text
                        x={labelRight ? o.cx + 55 : o.cx - 55}
                        y={o.cy - 19}
                        fontSize={8} fill="#f0d08e" textAnchor="middle"
                        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                        fontWeight={600}
                      >
                        {o.flag} {o.role}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <style>{`
          @keyframes drawArc { to { stroke-dashoffset: 0; } }
        `}</style>

        {/* Office selector — gold shimmer tabs */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18, flexWrap: 'wrap',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.4s',
        }}>
          {OFFICES.map((o, i) => (
            <button
              key={o.id}
              onClick={() => go(i)}
              className="map-tab-btn"
              style={{
                background: i === active
                  ? 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)'
                  : 'transparent',
                backgroundSize: i === active ? '220% 100%' : undefined,
                border: `1.5px solid ${i === active ? '#C3A35E' : 'rgba(195,163,94,0.3)'}`,
                color: i === active ? '#1a0d00' : 'rgba(107,31,43,0.5)',
                padding: '7px 16px',
                fontSize: 10, fontWeight: i === active ? 700 : 600,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                textTransform: 'uppercase' as const,
                borderRadius: 6,
                transition: 'all 0.25s ease',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {o.flag} {o.city}{o.isHQ ? ' ◆' : ''}
            </button>
          ))}
        </div>

        {/* Stats — animated counters */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 5vw, 56px)', marginTop: 22, flexWrap: 'wrap',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
        }}>
          {[
            { v: String(offices), s: '', l: 'Offices' },
            { v: String(markets), s: '+', l: 'Countries' },
            { v: `$${(volume / 10).toFixed(1)}B`, s: '+', l: 'Trade Volume' },
            { v: String(industries), s: '', l: 'Industries' },
          ].map((item) => (
            <div key={item.l} style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, #C3A35E 0%, #E5C07B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 700,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}>
                {item.v}{item.s}
              </div>
              <div style={{ color: 'rgba(107,31,43,0.4)', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 3, fontFamily: '-apple-system, sans-serif' }}>
                {item.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .map-gold-container {
          border: 2px solid #C3A35E;
          box-shadow: 0 0 0 1px rgba(195,163,94,0.2), 0 4px 20px rgba(195,163,94,0.12);
        }
        .map-gold-container::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(110deg, transparent 20%, rgba(255,215,120,0.2) 50%, transparent 80%);
          animation: mapSweep 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .map-tab-btn:hover {
          border-color: #C3A35E !important;
          color: #C3A35E !important;
        }
        @keyframes mapSweep {
          0%   { left: -100%; }
          50%  { left: 200%; }
          100% { left: 200%; }
        }
      `}</style>
    </section>
  )
}
