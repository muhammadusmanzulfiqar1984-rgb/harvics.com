'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CT, CHART_SERIES } from './chartTheme'

const Tip = ({ active, payload, unit }: any) => {
  if (!active || !payload?.length) return null
  const e = payload[0]
  return (
    <div style={{ background: CT.tipBg, border: `1px solid ${CT.tipBorder}`, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: CT.tipLabel }}>{e.payload.name}</p>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: CT.tipText }}>{e.value?.toLocaleString()}{unit ? ` ${unit}` : ''}</p>
    </div>
  )
}

const RADIAN = Math.PI / 180
function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  return (
    <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
      fill={CT.title} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 600 }}>
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

export default function PieChartCard({ title, data, colors = [...CHART_SERIES], height = 300, className = '', innerRadius = 0, outerRadius = 100, showLegend = true, unit }: PieChartCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-5 ${className}`}
      style={{ background: CT.bg, border: `1px solid ${CT.border}`, boxShadow: CT.cardShadow }}>
      <h3 className="text-sm font-semibold tracking-wide mb-4" style={{ color: CT.title }}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius}
            dataKey="value" stroke="#FFFEF9" strokeWidth={2}
            label={renderLabel as any} labelLine={false} animationBegin={0} animationDuration={600}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip content={<Tip unit={unit} />} />
          {showLegend && <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: CT.muted, fontSize: 11, fontWeight: 600 }}>{v}</span>} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
