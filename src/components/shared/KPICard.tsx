'use client'

import React from 'react'

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
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString() 
    : value

  const changeColor = change?.trend === 'up' 
    ? 'text-green-700' 
    : change?.trend === 'down'
    ? 'text-red-700'
    : 'text-[#6B1F2B]'

  const changeIcon = change?.trend === 'up'
    ? '↑'
    : change?.trend === 'down'
    ? '↓'
    : ''

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#C3A35E]/30 rounded-lg p-4 sm:p-6 flex flex-col justify-between min-h-[140px] transition-all overflow-hidden ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:border-[#C3A35E] hover:bg-[#C3A35E]/5' : 'hover:shadow-md'
      } ${className}`}
      style={{
        boxShadow: '0 4px 6px -1px rgba(212, 175, 55, 0.1), 0 2px 4px -1px rgba(212, 175, 55, 0.06)'
      }}
    >
      <div className="flex items-start justify-between mb-3 gap-2 min-h-[28px]">
        {icon && <div className="text-2xl leading-none flex-shrink-0 drop-shadow-sm">{icon}</div>}
        {change && (
          <div className={`text-xs font-bold ${changeColor} flex items-center gap-1 flex-shrink-0 flex-wrap justify-end bg-[#F8F9FA] px-2 py-1 rounded-full border border-[#C3A35E]/20`}>
            <span className="leading-none">{changeIcon}</span>
            <span className="whitespace-nowrap">{Math.abs(change.value)}%</span>
            {change.label && <span className="text-[#6B1F2B]/60 text-[10px] whitespace-nowrap hidden sm:inline">vs {change.label}</span>}
          </div>
        )}
        {!icon && !change && <div></div>}
      </div>
      
      <div className="flex-1 flex flex-col justify-end gap-2">
        <div 
          className="text-[10px] sm:text-xs font-bold text-[#6B1F2B] uppercase tracking-wider break-words overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            maxHeight: '2.5rem',
            lineHeight: '1.25rem',
            wordBreak: 'break-word'
          }}
        >
          {label}
        </div>
        
        <div className="text-xl sm:text-2xl font-bold text-[#6B1F2B] leading-tight break-words overflow-hidden font-serif">
          {formattedValue}
        </div>
      </div>
    </div>
  )
}

