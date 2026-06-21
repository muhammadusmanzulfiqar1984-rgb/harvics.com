'use client'

/**
 * Harvics OS — Chart Primitives
 * Design system: burgundy/cream/gold only. No inline styles, no hardcoded hex.
 * All color values map to Tailwind tokens or CSS variables from tailwind.config.js.
 */

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Design tokens (CSS values matching tailwind.config.js) ─────────────────
const T = {
  burgundy:    '#1A0505',
  gold:        '#C3A35E',
  goldDim:     'rgba(195,163,94,0.18)',
  goldDiv:     'rgba(195,163,94,0.2)',
  goldBorder:  'rgba(195,163,94,0.3)',
  cream:       '#F5F0E8',
  muted:       '#8A7D6B',
  surface:     'rgba(255,255,255,0.04)',
  surfaceHov:  'rgba(255,255,255,0.07)',
  gridLine:    'rgba(195,163,94,0.08)',
  shadow:      '0 4px 24px rgba(26,5,5,0.5)',
}

// ── Sparkline ────────────────────────────────────────────────────────────────
interface SparklineProps {
  values: number[]
  width?: number
  height?: number
}

export function Sparkline({ values, width = 120, height = 32 }: SparklineProps) {
  if (!values || values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const fillPath = `M${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(' ')} L${width},${height} L0,${height} Z`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.gold} stopOpacity="0.25" />
          <stop offset="100%" stopColor={T.gold} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#spk)" />
      <polyline points={pts.join(' ')} fill="none" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={parseFloat(pts[pts.length - 1].split(',')[0])}
        cy={parseFloat(pts[pts.length - 1].split(',')[1])}
        r="2.5" fill={T.gold}
      />
    </svg>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string
  value: string | number
  trend?: number
  sparkline?: number[]
  icon?: React.ReactNode
  suffix?: string
  onClick?: () => void
}

export function KPICard({ label, value, trend, sparkline, icon, suffix, onClick }: KPICardProps) {
  const up = (trend || 0) >= 0
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 ${onClick ? 'cursor-pointer hover:brightness-110' : ''}`}
      style={{ background: T.burgundy, border: `1px solid ${T.goldBorder}`, boxShadow: T.shadow }}
    >
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: T.muted }}>{label}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[26px] font-black tabular-nums leading-none" style={{ color: T.cream }}>{value}</span>
            {suffix && <span className="text-sm" style={{ color: T.muted }}>{suffix}</span>}
          </div>
          {trend !== undefined && (
            <span className={`text-[11px] font-semibold flex items-center gap-1 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
              {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(trend)}% vs last month
            </span>
          )}
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: T.goldDim, border: `1px solid ${T.goldBorder}`, color: T.gold }}>
            {icon}
          </div>
        )}
      </div>
      {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} width={160} height={28} />}
    </div>
  )
}

// ── Bar Chart ────────────────────────────────────────────────────────────────
interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  formatValue?: (v: number) => string
}

export function BarChart({ data, height = 120, formatValue = String }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        const col = d.color || T.gold
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex whitespace-nowrap z-10 px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg"
              style={{ background: T.burgundy, border: `1px solid ${T.goldBorder}`, color: T.cream }}
            >
              {formatValue(d.value)}
            </div>
            <div className="w-full rounded-t-lg overflow-hidden relative transition-all duration-500" style={{ height: `${pct}%`, minHeight: 4 }}>
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${col}dd, ${col})` }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }} />
            </div>
            <span className="text-[9px] font-medium text-center leading-tight truncate w-full" style={{ color: T.muted }}>{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Donut Chart ──────────────────────────────────────────────────────────────
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
  let offset = -circ * 0.25

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.surface} strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={seg.color} strokeWidth={strokeWidth}
              strokeDasharray={`${dash - 1.5} ${circ - dash + 1.5}`}
              strokeDashoffset={-offset} strokeLinecap="round"
            />
          )
          offset += dash
          return el
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <span className="text-sm font-black leading-none" style={{ color: T.cream }}>{centerValue}</span>}
          {centerLabel && <span className="text-[9px] mt-0.5" style={{ color: T.muted }}>{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}

// ── Horizontal Bar ───────────────────────────────────────────────────────────
interface HBarProps {
  label: string
  value: number
  max: number
  formatValue?: (v: number) => string
}

export function HBar({ label, value, max, formatValue = String }: HBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium" style={{ color: T.cream }}>{label}</span>
        <span className="tabular-nums" style={{ color: T.muted }}>{formatValue(value)}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.surface }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: T.gold }} />
      </div>
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ title, action, children, className = '' }: {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ background: T.burgundy, border: `1px solid ${T.goldBorder}`, boxShadow: T.shadow }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.gold}80, transparent)` }} />
      {title && (
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.goldDiv}` }}>
          <h4 className="text-sm font-black tracking-[0.05em]" style={{ color: T.cream }}>{title}</h4>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ── Data Table ───────────────────────────────────────────────────────────────
export function DataTable({ columns, rows }: {
  columns: { key: string; label: string; right?: boolean }[]
  rows: Record<string, React.ReactNode>[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.goldDiv}`, background: `linear-gradient(135deg, ${T.burgundy}, rgba(26,5,5,0.8))` }}>
            {columns.map(c => (
              <th key={c.key} className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] whitespace-nowrap ${c.right ? 'text-right' : 'text-left'}`}
                style={{ color: T.gold }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors duration-150"
              style={{ borderBottom: `1px solid ${T.gridLine}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.surfaceHov}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              {columns.map(c => (
                <td key={c.key} className={`px-5 py-3.5 text-sm ${c.right ? 'text-right tabular-nums' : ''}`} style={{ color: T.cream }}>
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-sm" style={{ color: T.muted }}>No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Status Dot ───────────────────────────────────────────────────────────────
const STATUS_CLS: Record<string, string> = {
  Active: 'bg-emerald-400', Completed: 'bg-emerald-400', OK: 'bg-emerald-400', Resolved: 'bg-emerald-400', Won: 'bg-emerald-400',
  'In Transit': 'bg-sky-400', Qualified: 'bg-sky-400', Proposal: 'bg-violet-400',
  Pending: 'bg-amber-400', Negotiation: 'bg-amber-400', Low: 'bg-amber-400', Scheduled: 'bg-amber-400',
  Inactive: 'bg-stone-500', Cancelled: 'bg-red-500', High: 'bg-red-500', Open: 'bg-red-500', Critical: 'bg-red-500',
}

export function StatusDot({ status }: { status: string }) {
  const dot = STATUS_CLS[status] || 'bg-stone-500'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: T.cream }}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {status}
    </span>
  )
}

// ── Live Badge ───────────────────────────────────────────────────────────────
export function LiveBadge({ source, lastUpdated }: { source: 'live' | 'mock'; lastUpdated: Date | null }) {
  const time = lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
        source === 'live'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : 'border-harvics-goldDivider text-harvics-muted'
      }`}
        style={source !== 'live' ? { background: T.surface } : undefined}>
        <span className={`w-1.5 h-1.5 rounded-full ${source === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-harvics-muted'}`} />
        {source === 'live' ? 'Live' : 'Demo'}
      </span>
      {lastUpdated && <span className="text-[10px]" style={{ color: T.muted }}>Updated {time}</span>}
    </div>
  )
}

// ── Line Chart (SVG) ─────────────────────────────────────────────────────────
interface LineChartProps {
  data: { label: string; values: number[]; color: string }[]
  labels: string[]
  height?: number
  formatY?: (v: number) => string
}

export function LineChart({ data, labels, height = 160, formatY = String }: LineChartProps) {
  const allVals = data.flatMap(d => d.values)
  const min = Math.min(...allVals) * 0.9
  const max = Math.max(...allVals) * 1.05
  const range = max - min || 1
  const W = 500, H = height
  const padL = 52, padR = 16, padT = 16, padB = 28
  const cW = W - padL - padR
  const cH = H - padT - padB

  const toX = (i: number) => padL + (i / Math.max(labels.length - 1, 1)) * cW
  const toY = (v: number) => padT + (1 - (v - min) / range) * cH
  const ticks = Array.from({ length: 5 }, (_, i) => min + (range / 4) * i)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        {data.map((s, si) => (
          <linearGradient key={`g${si}`} id={`lg${si}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>
      {ticks.map((v, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke={T.gridLine} strokeWidth="1" />
          <text x={padL - 6} y={toY(v)} textAnchor="end" dominantBaseline="middle" fill={T.muted} fontSize="10" fontWeight="500">
            {formatY(v)}
          </text>
        </g>
      ))}
      {data.map((s, si) => {
        const pts = s.values.map((v, i) => ({ x: toX(i), y: toY(v) }))
        const path = pts.map((p, i) => {
          if (i === 0) return `M${p.x},${p.y}`
          const prev = pts[i - 1]
          const cx = (prev.x + p.x) / 2
          return `C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`
        }).join(' ')
        const area = `${path} L${pts[pts.length - 1].x},${H - padB} L${pts[0].x},${H - padB} Z`
        return (
          <g key={si}>
            <path d={area} fill={`url(#lg${si})`} />
            <path d={path} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill={s.color} opacity="0.15" />
                <circle cx={p.x} cy={p.y} r="2.5" fill={T.burgundy} stroke={s.color} strokeWidth="1.5" />
              </g>
            ))}
          </g>
        )
      })}
      {labels.map((l, i) => (
        i % Math.ceil(labels.length / 8) === 0 ? (
          <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fill={T.muted} fontSize="10" fontWeight="500">{l}</text>
        ) : null
      ))}
      <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.gold} strokeWidth="0.5" strokeOpacity="0.4" />
    </svg>
  )
}
