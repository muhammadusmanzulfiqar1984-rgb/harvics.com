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
      style={{ display: 'block' }}
    >
      {/* Clock face */}
      <circle cx="16" cy="16" r="14" fill="none" stroke="#C3A35E" strokeWidth="1" opacity="0.6" />

      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const x1 = 16 + Math.cos(angle) * 11
        const y1 = 16 + Math.sin(angle) * 11
        const x2 = 16 + Math.cos(angle) * 13
        const y2 = 16 + Math.sin(angle) * 13
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C3A35E" strokeWidth="0.8" opacity="0.5" />
        )
      })}

      {/* Hour hand */}
      <line
        ref={hourRef}
        x1="16" y1="16" x2="16" y2="9"
        stroke="#C3A35E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        ref={minRef}
        x1="16" y1="16" x2="16" y2="6"
        stroke="#C3A35E"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Second hand */}
      <line
        ref={secRef}
        x1="16" y1="16" x2="16" y2="5"
        stroke="#C3A35E"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Center dot */}
      <circle cx="16" cy="16" r="1.2" fill="#C3A35E" />
    </svg>
  )
}

export default AnalogClock
