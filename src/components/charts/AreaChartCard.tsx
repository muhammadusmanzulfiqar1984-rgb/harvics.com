'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AreaChartCardProps {
  title: string
  data: Array<{ [key: string]: string | number }>
  dataKeys: string[]
  colors?: string[]
  height?: number
  className?: string
  stacked?: boolean
  showGrid?: boolean
  unit?: string
  gradient?: boolean
}

const SUPREME_COLORS = ['#6B1F2B', '#C3A35E', '#8B3A3A', '#D4B86A', '#4A1520']

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  unit?: string
}) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #C3A35E',
        borderRadius: 0,
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(107, 31, 43, 0.12)',
      }}
    >
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#6B1F2B', marginBottom: 6 }}>
        {label}
      </p>
      {payload.map((entry, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span
            style={{
              width: 8,
              height: 8,
              backgroundColor: entry.color,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: '#6B1F2B' }}>
            {entry.name}: <strong>{entry.value.toLocaleString()}{unit ? ` ${unit}` : ''}</strong>
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AreaChartCard({
  title,
  data,
  dataKeys,
  colors = SUPREME_COLORS,
  height = 300,
  className = '',
  stacked = false,
  showGrid = true,
  unit,
  gradient = true,
}: AreaChartCardProps) {
  return (
    <div
      className={`bg-white border border-[#C3A35E]/30 p-6 ${className}`}
      style={{ borderRadius: 0, boxShadow: 'none' }}
    >
      <h3 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">{title}</h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-sm text-[#6B1F2B]/40">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            {gradient && (
              <defs>
                {dataKeys.map((key, index) => {
                  const color = colors[index % colors.length]
                  return (
                    <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                  )
                })}
              </defs>
            )}
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />}
            <XAxis
              dataKey="name"
              stroke="#999"
              tick={{ fill: '#6B1F2B', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#C3A35E', strokeOpacity: 0.3 }}
            />
            <YAxis
              stroke="#999"
              tick={{ fill: '#6B1F2B', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#C3A35E', strokeOpacity: 0.3 }}
              tickFormatter={(val: number) => {
                if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
                if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
                return val.toString()
              }}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="square"
              iconSize={10}
              formatter={(value: string) => (
                <span style={{ color: '#6B1F2B', fontSize: 12, fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />
            {dataKeys.map((key, index) => {
              const color = colors[index % colors.length]
              return (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId={stacked ? 'stack' : undefined}
                  stroke={color}
                  strokeWidth={2}
                  fill={gradient ? `url(#gradient-${key})` : color}
                  fillOpacity={gradient ? 1 : 0.15}
                  activeDot={{
                    r: 5,
                    stroke: color,
                    strokeWidth: 2,
                    fill: 'white',
                  }}
                  animationDuration={1000}
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
