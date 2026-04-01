'use client'

import React from 'react'

// ── Mini Sparkline ──────────────────────────────────────────────────────────
interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  color?: string
  fill?: boolean
}

export function Sparkline({ values, width = 120, height = 36, color = '#6B1F2B', fill = true }: SparklineProps) {
  if (!values || values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })
  const polyline = pts.join(' ')
  const fillPath = `M${pts[0]} L${pts.slice(1).map(p => `L${p}`).join(' ')} L${width},${height} L0,${height} Z`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fill && <path d={fillPath} fill={color} opacity="0.08" />}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="2.5" fill={color} />
    </svg>
  )
}

// ── Bar Chart ───────────────────────────────────────────────────────────────
interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  formatValue?: (v: number) => string
}

export function BarChart({ data, height = 120, formatValue = (v) => String(v) }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-[#1D1D1F] text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
              {formatValue(d.value)}
            </div>
            <div className="w-full rounded-t-sm transition-all duration-500" style={{ height: `${pct}%`, backgroundColor: d.color || '#6B1F2B', minHeight: 2 }} />
            <span className="text-[10px] text-[#8E8E93] text-center leading-tight truncate w-full text-center">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Donut Chart ─────────────────────────────────────────────────────────────
interface DonutProps {
  segments: { label: string; value: number; color: string }[]
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerValue?: string
}

export function DonutChart({ segments, size = 120, strokeWidth = 16, centerLabel, centerValue }: DonutProps) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  let offset = -circ * 0.25 // start at top
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-0">
        {/* Background track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F5F5F7" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ
          const gap = circ - dash
          const el = (
            <circle
              key={i}
              cx={size/2} cy={size/2} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash - 1.5} ${gap + 1.5}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          )
          offset += dash
          return el
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-base font-semibold text-[#1D1D1F] leading-none">{centerValue}</span>}
          {centerLabel && <span className="text-[10px] text-[#8E8E93] mt-0.5">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}

// ── Horizontal Bar ──────────────────────────────────────────────────────────
interface HBarProps {
  label: string
  value: number
  max: number
  color?: string
  formatValue?: (v: number) => string
}

export function HBar({ label, value, max, color = '#6B1F2B', formatValue = (v) => String(v) }: HBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#1D1D1F] font-medium">{label}</span>
        <span className="text-[#8E8E93] tabular-nums">{formatValue(value)}</span>
      </div>
      <div className="h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ── KPI Card with sparkline ─────────────────────────────────────────────────
interface KPICardProps {
  label: string
  value: string | number
  trend?: number      // % change vs last period
  sparkline?: number[]
  icon?: React.ReactNode
  color?: string
  suffix?: string
  onClick?: () => void
}

export function KPICard({ label, value, trend, sparkline, icon, color = '#6B1F2B', suffix, onClick }: KPICardProps) {
  const trendUp = (trend || 0) >= 0
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.72)',
        border: '1.5px solid rgba(195,163,94,0.4)',
        boxShadow: '0 4px 20px rgba(107,31,43,0.06), inset 0 1px 0 rgba(255,255,255,0.9)'
      }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(107,31,43,0.14), inset 0 1px 0 rgba(255,255,255,0.9)')}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(107,31,43,0.06), inset 0 1px 0 rgba(255,255,255,0.9)')}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: 'rgba(107,31,43,0.5)' }}>{label}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums" style={{ color: '#2C1810' }}>{value}</span>
            {suffix && <span className="text-sm text-[#8E8E93]">{suffix}</span>}
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-medium flex items-center gap-0.5 ${trendUp ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
              {trendUp ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </span>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
            background: 'linear-gradient(135deg, rgba(107,31,43,0.1), rgba(107,31,43,0.05))',
            border: '1px solid rgba(195,163,94,0.35)',
            color: '#6B1F2B'
          }}>
            {icon}
          </div>
        )}
      </div>
      {sparkline && sparkline.length > 1 && (
        <Sparkline values={sparkline} width={180} height={32} color={color} />
      )}
    </div>
  )
}

// ── Live indicator ──────────────────────────────────────────────────────────
export function LiveBadge({ source, lastUpdated }: { source: 'live' | 'mock'; lastUpdated: Date | null }) {
  const time = lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${source === 'live' ? 'bg-[#F0FFF4] text-[#34C759]' : 'bg-[#FAF8F5] text-[#8E8E93]'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${source === 'live' ? 'bg-[#34C759] animate-pulse' : 'bg-[#8E8E93]'}`} />
        {source === 'live' ? 'Live' : 'Demo data'}
      </span>
      {lastUpdated && <span className="text-[11px] text-[#C7C7CC]">Updated {time}</span>}
    </div>
  )
}

// ── Status Dot ──────────────────────────────────────────────────────────────
export function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: '#34C759', Completed: '#34C759', OK: '#34C759',
    'In Transit': '#007AFF', Qualified: '#007AFF', Proposal: '#007AFF',
    Pending: '#FF9500', Negotiation: '#FF9500', Low: '#FF9500',
    Inactive: '#8E8E93', Cancelled: '#FF3B30', High: '#FF3B30',
    Resolved: '#34C759', Open: '#FF3B30',
  }
  const c = colors[status] || '#8E8E93'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D1D1F]">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c }} />
      {status}
    </span>
  )
}

// ── Section card wrapper ────────────────────────────────────────────────────
export function Card({ title, action, children, className = '' }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`} style={{
      background: 'rgba(255,255,255,0.72)',
      border: '1.5px solid rgba(195,163,94,0.4)',
      boxShadow: '0 4px 24px rgba(107,31,43,0.07), inset 0 1px 0 rgba(255,255,255,0.9)'
    }}>
      {/* Glossy sheen */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)' }} />
      {title && (
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(195,163,94,0.25)' }}>
          <h4 className="text-sm font-bold" style={{ color: '#2C1810' }}>{title}</h4>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ── Table ───────────────────────────────────────────────────────────────────
export function DataTable({ columns, rows }: { columns: { key: string; label: string; right?: boolean }[]; rows: Record<string, React.ReactNode>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="" style={{ borderBottom: '1px solid rgba(195,163,94,0.3)', background: 'linear-gradient(135deg, #6B1F2B 0%, #8B2535 100%)' }}>
            {columns.map(c => (
              <th key={c.key} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${c.right ? 'text-right' : 'text-left'}`} style={{ color: 'rgba(255,255,255,0.85)' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'rgba(195,163,94,0.15)' }}>
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid rgba(195,163,94,0.12)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(107,31,43,0.03)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              {columns.map(c => (
                <td key={c.key} className={`px-5 py-3.5 text-sm ${c.right ? 'text-right tabular-nums' : ''}`} style={{ color: '#2C1810' }}>
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-sm text-[#8E8E93]">No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Line chart (SVG, no library) ───────────────────────────────────────────
interface LineChartProps {
  data: { label: string; values: number[]; color: string }[]
  labels: string[]
  height?: number
  formatY?: (v: number) => string
}

export function LineChart({ data, labels, height = 160, formatY = (v) => String(v) }: LineChartProps) {
  const allVals = data.flatMap(d => d.values)
  const min = Math.min(...allVals) * 0.9
  const max = Math.max(...allVals) * 1.05
  const range = max - min || 1
  const W = 500, H = height
  const padL = 52, padR = 12, padT = 12, padB = 24
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const toX = (i: number) => padL + (i / (labels.length - 1)) * chartW
  const toY = (v: number) => padT + (1 - (v - min) / range) * chartH

  // Y axis ticks
  const ticks = 4
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => min + (range / ticks) * i)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {tickVals.map((v, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke="#F5F5F7" strokeWidth="1" />
          <text x={padL - 6} y={toY(v)} textAnchor="end" dominantBaseline="middle" className="text-[10px]" fill="#8E8E93" fontSize="10">
            {formatY(v)}
          </text>
        </g>
      ))}
      {/* Lines */}
      {data.map((series, si) => {
        const pts = series.values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
        const fillPts = `${toX(0)},${H - padB} ${series.values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')} ${toX(series.values.length - 1)},${H - padB}`
        return (
          <g key={si}>
            <polygon points={fillPts} fill={series.color} opacity="0.06" />
            <polyline points={pts} fill="none" stroke={series.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {series.values.map((v, i) => (
              <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill="white" stroke={series.color} strokeWidth="1.5" />
            ))}
          </g>
        )
      })}
      {/* X axis labels */}
      {labels.map((l, i) => (
        i % Math.ceil(labels.length / 8) === 0 ? (
          <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fill="#8E8E93" fontSize="10">{l}</text>
        ) : null
      ))}
    </svg>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export { MONTHS }
