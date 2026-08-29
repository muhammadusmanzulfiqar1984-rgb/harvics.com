'use client'

/**
 * HARVICS OS — shared charts & live indicators
 * Law: burgundy #3D1212 · gold #C3A35E · cream #F5F0E8 · muted #8A7D6B
 * No blue / purple / indigo.
 */

import React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export const OS = {
  burgundy: '#3D1212',
  gold: '#C3A35E',
  cream: '#F5F0E8',
  muted: '#8A7D6B',
  /** Semantic — still on-brand (no blue/purple) */
  ok: '#8B7355', // warm gold-brown “healthy”
  warn: '#C3A35E',
  bad: '#3D1212',
  softOk: '#9CB451', // olive, for aging “current” only
  softWarn: '#B8860B',
  softBad: '#6B1D2A',
} as const

/** Pie / multi-series — burgundy→gold family only */
export const OS_PALETTE = [
  OS.burgundy,
  OS.gold,
  '#6B3A3A',
  '#8A7D6B',
  '#5C4033',
  '#A67C52',
  '#4A2C2A',
  '#C9B896',
]

/** Aging buckets — brand-safe progression */
export const OS_AGING = [
  { key: 'current', label: 'Current', color: OS.gold },
  { key: 'd30', label: '1–30 days', color: '#A67C52' },
  { key: 'd60', label: '31–60 days', color: '#8A7D6B' },
  { key: 'd90', label: '61–90 days', color: '#6B3A3A' },
  { key: 'd90plus', label: '90+ days', color: OS.burgundy },
] as const

type Point = { name: string; value: number; [k: string]: string | number }

const tipStyle: React.CSSProperties = {
  background: OS.burgundy,
  border: `1px solid ${OS.gold}`,
  borderRadius: 0,
  color: OS.cream,
  fontSize: 12,
}

function ChartBox({ height, children }: { height: number; children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', minWidth: 0, height: Math.max(height, 160), minHeight: 160 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

export function OsLivePulse({
  label = 'LIVE',
  tone = 'ok',
}: {
  label?: string
  tone?: 'ok' | 'warn' | 'down'
}) {
  const color = tone === 'ok' ? OS.gold : tone === 'warn' ? OS.softWarn : OS.burgundy
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          background: color,
          boxShadow: `0 0 0 0 ${color}`,
          animation: 'os-pulse 1.6s ease-out infinite',
        }}
      />
      {label}
      <style>{`
        @keyframes os-pulse {
          0% { box-shadow: 0 0 0 0 rgba(195,163,94,0.55); }
          70% { box-shadow: 0 0 0 10px rgba(195,163,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(195,163,94,0); }
        }
      `}</style>
    </span>
  )
}

export function OsKpi({
  label,
  value,
  hint,
  accent = OS.gold,
  live,
}: {
  label: string
  value: string | number
  hint?: string
  accent?: string
  live?: boolean
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 140,
        padding: '16px 18px',
        background: `linear-gradient(145deg, ${OS.burgundy} 0%, #2a0c0c 100%)`,
        color: OS.cream,
        borderTop: `3px solid ${accent}`,
        position: 'relative',
      }}
    >
      {live ? (
        <div style={{ position: 'absolute', top: 10, right: 12 }}>
          <OsLivePulse label="" />
        </div>
      ) : null}
      <div
        style={{
          position: 'relative',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.7,
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: 'relative',
          marginTop: 8,
          fontSize: 22,
          fontWeight: 700,
                    color: accent === OS.gold ? OS.gold : OS.cream,
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ position: 'relative', marginTop: 6, fontSize: 11, opacity: 0.55 }}>{hint}</div>
      )}
    </div>
  )
}

export function OsBarChart({
  data,
  dataKey = 'value',
  height = 220,
  color = OS.gold,
}: {
  data: Point[]
  dataKey?: string
  height?: number
  color?: string
}) {
  return (
    <ChartBox height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={`${OS.burgundy}18`} />
        <XAxis dataKey="name" tick={{ fill: OS.muted, fontSize: 11 }} axisLine={{ stroke: `${OS.burgundy}33` }} />
        <YAxis tick={{ fill: OS.muted, fontSize: 11 }} axisLine={{ stroke: `${OS.burgundy}33` }} />
        <Tooltip contentStyle={tipStyle} cursor={{ fill: `${OS.gold}18` }} />
        <Bar dataKey={dataKey} fill={color} radius={[0, 0, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ChartBox>
  )
}

export function OsPieChart({
  data,
  height = 220,
  inner = 48,
}: {
  data: Point[]
  height?: number
  inner?: number
}) {
  return (
    <ChartBox height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={inner}
          outerRadius={Math.min(90, height / 2 - 16)}
          paddingAngle={2}
          stroke={OS.cream}
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={OS_PALETTE[i % OS_PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: OS.burgundy }} />
      </PieChart>
    </ChartBox>
  )
}

export function OsAreaChart({
  data,
  dataKey = 'value',
  height = 200,
}: {
  data: Point[]
  dataKey?: string
  height?: number
}) {
  return (
    <ChartBox height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="osGoldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OS.gold} stopOpacity={0.45} />
            <stop offset="100%" stopColor={OS.gold} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={`${OS.burgundy}14`} />
        <XAxis dataKey="name" tick={{ fill: OS.muted, fontSize: 11 }} />
        <YAxis tick={{ fill: OS.muted, fontSize: 11 }} />
        <Tooltip contentStyle={tipStyle} />
        <Area type="monotone" dataKey={dataKey} stroke={OS.gold} fill="url(#osGoldFill)" strokeWidth={2} />
      </AreaChart>
    </ChartBox>
  )
}

export function OsLineChart({
  data,
  series,
  height = 200,
}: {
  data: Point[]
  series: { key: string; color: string }[]
  height?: number
}) {
  return (
    <ChartBox height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={`${OS.burgundy}14`} />
        <XAxis dataKey="name" tick={{ fill: OS.muted, fontSize: 11 }} />
        <YAxis tick={{ fill: OS.muted, fontSize: 11 }} />
        <Tooltip contentStyle={tipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: OS.burgundy }} />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color || OS_PALETTE[i % OS_PALETTE.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartBox>
  )
}

export function OsPanel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      style={{
        background: OS.cream,
        border: `1px solid ${OS.gold}4D`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 14px',
          borderBottom: `1px solid ${OS.burgundy}14`,
          background: `linear-gradient(90deg, ${OS.cream}, #fff)`,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: OS.burgundy, letterSpacing: '0.04em' }}>{title}</div>
          {subtitle && <div style={{ marginTop: 2, fontSize: 11, color: OS.muted }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      <div style={{ padding: 12, minWidth: 0, flex: 1 }}>{children}</div>
    </div>
  )
}
