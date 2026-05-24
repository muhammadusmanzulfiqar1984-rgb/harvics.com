'use client'

import React, { useEffect, useRef } from 'react'

/**
 * AnalogClock — Miniature SVG analog clock for the header.
 * Ported from SUPREME's header clock with animated hands.
 */
const AnalogClock: React.FC<{ size?: number }> = ({ size = 32 }) => {
  const hourRef = useRef<SVGLineElement>(null)
  const minRef = useRef<SVGLineElement>(null)
  const secRef = useRef<SVGLineElement>(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours() % 12
      const m = now.getMinutes()
      const s = now.getSeconds()

      const hourDeg = h * 30 + m * 0.5
      const minDeg = m * 6
      const secDeg = s * 6

      if (hourRef.current) hourRef.current.setAttribute('transform', `rotate(${hourDeg} 16 16)`)
      if (minRef.current) minRef.current.setAttribute('transform', `rotate(${minDeg} 16 16)`)
      if (secRef.current) secRef.current.setAttribute('transform', `rotate(${secDeg} 16 16)`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className="flex-shrink-0"
      style={{ display: 'block', filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.18))' }}
    >
      <defs>
        {/* Brushed gold bezel */}
        <radialGradient id="hc-bezel" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#F2D98A" />
          <stop offset="55%" stopColor="#C3A35E" />
          <stop offset="100%" stopColor="#7A5A24" />
        </radialGradient>
        {/* Engraved dial face */}
        <radialGradient id="hc-dial" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#FFF6E0" />
          <stop offset="55%" stopColor="#F4E3B5" />
          <stop offset="100%" stopColor="#D9BE7F" />
        </radialGradient>
        {/* Inner shadow filter for engraved look */}
        <filter id="hc-inset" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" />
          <feOffset dx="0" dy="0.4" result="off" />
          <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner" />
          <feColorMatrix in="inner" values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.05  0 0 0 0.55 0" />
        </filter>
      </defs>

      {/* Outer bezel ring */}
      <circle cx="16" cy="16" r="15.2" fill="url(#hc-bezel)" />
      {/* Inner bezel highlight */}
      <circle cx="16" cy="16" r="14.2" fill="none" stroke="#FFF1C2" strokeWidth="0.35" opacity="0.55" />
      {/* Dial face */}
      <circle cx="16" cy="16" r="13.2" fill="url(#hc-dial)" filter="url(#hc-inset)" />
      {/* Engraved inner rim */}
      <circle cx="16" cy="16" r="12.4" fill="none" stroke="#7A5A24" strokeWidth="0.25" opacity="0.55" />

      {/* Hour markers — engraved into dial */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const isCardinal = i % 3 === 0
        const r1 = isCardinal ? 10.2 : 11
        const r2 = 12
        const x1 = 16 + Math.cos(angle) * r1
        const y1 = 16 + Math.sin(angle) * r1
        const x2 = 16 + Math.cos(angle) * r2
        const y2 = 16 + Math.sin(angle) * r2
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#5C3F12"
            strokeWidth={isCardinal ? 1 : 0.5}
            strokeLinecap="round"
            opacity={isCardinal ? 0.85 : 0.55}
          />
        )
      })}

      {/* Hour hand */}
      <line
        ref={hourRef}
        x1="16" y1="17.4" x2="16" y2="9"
        stroke="#3B2608"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        ref={minRef}
        x1="16" y1="17.6" x2="16" y2="6.5"
        stroke="#3B2608"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Second hand */}
      <line
        ref={secRef}
        x1="16" y1="18" x2="16" y2="5.8"
        stroke="#8B1F2B"
        strokeWidth="0.5"
        strokeLinecap="round"
      />

      {/* Center cap — domed gold */}
      <circle cx="16" cy="16" r="1.6" fill="url(#hc-bezel)" />
      <circle cx="16" cy="16" r="0.55" fill="#3B2608" />
    </svg>
  )
}

export default AnalogClock
