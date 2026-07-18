'use client'

import { useEffect, useState } from 'react'

/** textile-v2 / LPP horology palette */
export const HOROLOGY_GOLD = '#c8a96e'
export const HOROLOGY_GOLD_LIGHT = '#e8cc8a'
export const HOROLOGY_GOLD_MUTED = 'rgba(200,169,110,0.5)'
export const HOROLOGY_DIAL = 'rgba(13,11,8,0.94)'

const HOUR_MARKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

function useLiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const s = now.getSeconds()
  const m = now.getMinutes()
  const h = now.getHours() % 12
  return {
    sDeg: s * 6,
    mDeg: m * 6 + s * 0.1,
    hDeg: h * 30 + m * 0.5,
  }
}

const HANDSET_PATH =
  'M20.01 15.57l-3.15-1.35a1 1 0 0 0-1.02.24l-2.2 2.2a11.86 11.86 0 0 1-5.17-5.17l2.2-2.2a1 1 0 0 0 .24-1.02L10.4 3.01a1.5 1.5 0 0 0-1.54-.99H6.5A2.5 2.5 0 0 0 4 4.5v2A15 15 0 0 0 19.5 22h2a2.5 2.5 0 0 0 2.48-2.46v-2.37a1.5 1.5 0 0 0-1.54-1.54l-2.36-.71a1 1 0 0 0-1.06.71z'

/** Live analog clock — textile-v2 nav-clock (XII · III · VI · IX) */
export function VictorianAnalogClock({
  size = 40,
  className = '',
  title = 'Local time',
}: {
  size?: number
  className?: string
  title?: string
}) {
  const { sDeg, mDeg, hDeg } = useLiveClock()

  return (
    <div
      className={`harvics-victorian-clock-wrap flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={title}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="harvics-victorian-clock-svg w-full h-full">
        <circle cx="50" cy="50" r="48" fill={HOROLOGY_DIAL} />
        <circle cx="50" cy="50" r="46" fill="none" stroke={HOROLOGY_GOLD} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(200,169,110,0.15)" strokeWidth="0.5" />

        {HOUR_MARKS.map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="8"
            x2="50"
            y2={deg % 90 === 0 ? '14' : '12'}
            stroke={deg % 90 === 0 ? HOROLOGY_GOLD : HOROLOGY_GOLD_MUTED}
            strokeWidth={deg % 90 === 0 ? 2 : 1}
            transform={`rotate(${deg} 50 50)`}
          />
        ))}

        <text x="50" y="20" textAnchor="middle" fill={HOROLOGY_GOLD} fontSize="7" fontFamily="Georgia, 'Times New Roman', serif">
          XII
        </text>
        <text x="80" y="54" textAnchor="middle" fill={HOROLOGY_GOLD} fontSize="7" fontFamily="Georgia, 'Times New Roman', serif">
          III
        </text>
        <text x="50" y="86" textAnchor="middle" fill={HOROLOGY_GOLD} fontSize="7" fontFamily="Georgia, 'Times New Roman', serif">
          VI
        </text>
        <text x="20" y="54" textAnchor="middle" fill={HOROLOGY_GOLD} fontSize="7" fontFamily="Georgia, 'Times New Roman', serif">
          IX
        </text>

        <line
          x1="50"
          y1="50"
          x2="50"
          y2="24"
          stroke={HOROLOGY_GOLD}
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${hDeg} 50 50)`}
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="16"
          stroke={HOROLOGY_GOLD_LIGHT}
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${mDeg} 50 50)`}
        />
        <line
          x1="50"
          y1="55"
          x2="50"
          y2="14"
          stroke="rgba(200,169,110,0.45)"
          strokeWidth="0.6"
          strokeLinecap="round"
          transform={`rotate(${sDeg} 50 50)`}
        />
        <circle cx="50" cy="50" r="2.5" fill={HOROLOGY_GOLD} />
        <circle cx="50" cy="50" r="1" fill="var(--harvics-burgundy)" />
      </svg>
    </div>
  )
}

/** Victorian telephone — same black dial + gold material, no clock hands */
export function VictorianTelephoneIcon({ isOpen = false }: { isOpen?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="harvics-victorian-clock-svg w-full h-full" aria-hidden>
      <circle cx="50" cy="50" r="48" fill={HOROLOGY_DIAL} />
      <circle cx="50" cy="50" r="46" fill="none" stroke={HOROLOGY_GOLD} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(200,169,110,0.15)" strokeWidth="0.5" />

      {!isOpen ? (
        <g transform="translate(50 50) rotate(-22) scale(1.55) translate(-12 -12)">
          <path
            d={HANDSET_PATH}
            fill={HOROLOGY_GOLD_LIGHT}
            stroke={HOROLOGY_GOLD}
            strokeWidth="0.55"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        <g stroke={HOROLOGY_GOLD_LIGHT} strokeWidth="2.5" strokeLinecap="round">
          <line x1="38" y1="38" x2="62" y2="62" />
          <line x1="62" y1="38" x2="38" y2="62" />
        </g>
      )}

      <circle cx="50" cy="50" r="2.5" fill={HOROLOGY_GOLD} />
      <circle cx="50" cy="50" r="1" fill="var(--harvics-burgundy)" />
    </svg>
  )
}
