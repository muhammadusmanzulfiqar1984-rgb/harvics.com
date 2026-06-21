'use client'

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const T = { burgundy: '#1A0505', gold: '#C3A35E', cream: '#F5F0E8', muted: '#8A7D6B', grid: 'rgba(195,163,94,0.08)', border: 'rgba(195,163,94,0.2)' }

const Tip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: T.burgundy, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '0.08em' }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: T.cream }}>{e.name}: <strong>{e.value?.toLocaleString()}{unit ? ` ${unit}` : ''}</strong></span>
        </div>
      ))}
    </div>
  )
}

interface AreaChartCardProps {
  title: string
  data: Array<{ [key: string]: string | number }>
  dataKeys: string[]
  colors?: string[]
  height?: number
  className?: string
  stacked?: boolean
  unit?: string
}

export default function AreaChartCard({ title, data, dataKeys, colors = [T.gold, '#059669', '#3b82f6'], height = 300, className = '', stacked = false, unit }: AreaChartCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${className}`}
      style={{ background: T.burgundy, border: `1px solid ${T.border}`, boxShadow: '0 4px 24px rgba(26,5,5,0.5)' }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${T.gold}80,transparent)` }} />
      <h3 className="text-sm font-black tracking-[0.06em] mb-5" style={{ color: T.cream }}>{title}</h3>
      <defs>
        {dataKeys.map((key, i) => (
          <linearGradient key={key} id={`area-g-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
            <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.02} />
          </linearGradient>
        ))}
      </defs>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <defs>
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`area-g-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={T.grid} />
          <XAxis dataKey="name" stroke="transparent" tick={{ fill: T.muted, fontSize: 11 }} tickLine={false}
            axisLine={{ stroke: T.gold, strokeOpacity: 0.2 }} />
          <YAxis stroke="transparent" tick={{ fill: T.muted, fontSize: 11 }} tickLine={false}
            tickFormatter={(v: number) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
          <Tooltip content={<Tip unit={unit} />} cursor={{ stroke: T.gold, strokeWidth: 1, strokeOpacity: 0.2 }} />
          <Legend iconType="square" iconSize={9} formatter={(v: string) => <span style={{ color: T.muted, fontSize: 11, fontWeight: 600 }}>{v}</span>} />
          {dataKeys.map((key, i) => (
            <Area key={key} type="monotone" dataKey={key} stackId={stacked ? 'stack' : undefined}
              stroke={colors[i % colors.length]} strokeWidth={2} fill={`url(#area-g-${i})`}
              activeDot={{ r: 5, stroke: colors[i % colors.length], strokeWidth: 2, fill: T.burgundy }} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
