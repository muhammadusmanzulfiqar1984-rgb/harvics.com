'use client'

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CT } from './chartTheme'

const Tip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: CT.tipBg, border: `1px solid ${CT.tipBorder}`, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: CT.tipLabel, letterSpacing: '0.06em' }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: CT.tipText }}>{e.name}: <strong>{e.value?.toLocaleString()}{unit ? ` ${unit}` : ''}</strong></span>
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

export default function AreaChartCard({ title, data, dataKeys, colors = [CT.burgundy, CT.gold], height = 300, className = '', stacked = false, unit }: AreaChartCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-5 ${className}`}
      style={{ background: CT.bg, border: `1px solid ${CT.border}`, boxShadow: CT.cardShadow }}>
      <h3 className="text-sm font-semibold tracking-wide mb-4" style={{ color: CT.title }}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <defs>
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`area-g-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.22} />
                <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CT.grid} />
          <XAxis dataKey="name" stroke="transparent" tick={{ fill: CT.muted, fontSize: 11 }} tickLine={false}
            axisLine={{ stroke: CT.border }} />
          <YAxis stroke="transparent" tick={{ fill: CT.muted, fontSize: 11 }} tickLine={false}
            tickFormatter={(v: number) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
          <Tooltip content={<Tip unit={unit} />} cursor={{ stroke: CT.gold, strokeWidth: 1, strokeOpacity: 0.35 }} />
          <Legend iconType="square" iconSize={9} formatter={(v: string) => <span style={{ color: CT.muted, fontSize: 11, fontWeight: 600 }}>{v}</span>} />
          {dataKeys.map((key, i) => (
            <Area key={key} type="monotone" dataKey={key} stackId={stacked ? 'stack' : undefined}
              stroke={colors[i % colors.length]} strokeWidth={2} fill={`url(#area-g-${i})`}
              activeDot={{ r: 4, stroke: colors[i % colors.length], strokeWidth: 2, fill: CT.bg }} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
