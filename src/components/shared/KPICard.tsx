'use client'

import React, { useState, useEffect } from 'react'

interface KPICardProps {
  label: string
  value: string | number
  change?: {
    value: number
    label?: string
    trend?: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

export default function KPICard({
  label,
  value,
  change,
  icon,
  onClick,
  className = ''
}: KPICardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  // Only format with locale on client to avoid SSR hydration mismatch
  const formattedValue = typeof value === 'number' ? (mounted ? value.toLocaleString() : String(value)) : value
  const trendUp = change?.trend === 'up'
  const trendDown = change?.trend === 'down'

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col gap-4 rounded-2xl p-5 overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        background: 'rgba(255,255,255,0.72)',
        border: '1.5px solid rgba(195, 163, 94,0.4)',
        boxShadow: '0 4px 24px rgba(107,31,43,0.10), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(195, 163, 94,0.12)',
      }}
      onMouseEnter={e => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(107,31,43,0.22), inset 0 1px 0 rgba(255,255,255,0.98), inset 0 -1px 0 rgba(195, 163, 94,0.2)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(195, 163, 94,0.75)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(107,31,43,0.10), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(195, 163, 94,0.12)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(195, 163, 94,0.4)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        }
      }}
    >
      {/* Glossy top sheen */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)' }} />
      <div className="flex items-center justify-between">
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, rgba(107,31,43,0.12), rgba(107,31,43,0.06))',
            border: '1px solid rgba(195, 163, 94,0.3)',
            color: 'var(--harvics-burgundy)'
          }}>
            {icon}
          </div>
        )}
        {change && (
          <span className={`text-xs font-semibold tabular-nums ${
            trendUp ? 'text-emerald-600' : trendDown ? 'text-red-500' : 'text-amber-600'
          }`}>
            {trendUp ? '↑' : trendDown ? '↓' : ''}{Math.abs(change.value)}%
          </span>
        )}
        {!icon && !change && <div />}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(107,31,43,0.5)' }}>{label}</p>
        <p className="text-2xl font-bold tracking-tight leading-none" style={{ color: '#2C1810' }}>{formattedValue}</p>
      </div>
    </div>
  )
}

