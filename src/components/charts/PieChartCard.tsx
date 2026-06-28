'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const T = { burgundy: '#3D1212', gold: '#C3A35E', cream: '#F5F0E8', muted: '#8A7D6B', border: 'rgba(195,163,94,0.2)' }

const Tip = ({ active, payload, unit }: any) => {
  if (!active || !payload?.length) return null
  const e = payload[0]
  return (
    <div style={{ background: T.burgundy, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.gold }}>{e.payload.name}</p>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: T.cream }}>{e.value?.toLocaleString()}{unit ? ` ${unit}` : ''}</p>
    </div>
  )
}

const RADIAN = Math.PI / 180
function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  return (
    <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
      fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

interface PieChartCardProps {
  title: string
  data: Array<{ name: string; value: number }>
  colors?: string[]
  height?: number
  className?: string
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  unit?: string
}

const DEFAULTS = [T.gold, '#C3A35E99', '#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

export default function PieChartCard({ title, data, colors = DEFAULTS, height = 300, className = '', innerRadius = 0, outerRadius = 100, showLegend = true, unit }: PieChartCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${className}`}
      style={{ background: T.burgundy, border: `1px solid ${T.border}`, boxShadow: '0 4px 24px rgba(26,5,5,0.5)' }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${T.gold}80,transparent)` }} />
      <h3 className="text-sm font-black tracking-[0.06em] mb-5" style={{ color: T.cream }}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius}
            dataKey="value" stroke={T.burgundy} strokeWidth={2}
            label={renderLabel as any} labelLine={false} animationBegin={0} animationDuration={800}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip content={<Tip unit={unit} />} />
          {showLegend && <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: T.muted, fontSize: 11, fontWeight: 600 }}>{v}</span>} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
