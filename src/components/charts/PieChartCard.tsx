'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PieChartCardProps {
  title: string
  data: Array<{ name: string; value: number }>
  colors?: string[]
  height?: number
  className?: string
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  showLabels?: boolean
  unit?: string
}

const SUPREME_COLORS = [
  '#6B1F2B', // Maroon
  '#C3A35E', // Gold
  '#8B3A3A', // Dark rose
  '#D4B86A', // Light gold
  '#4A1520', // Deep maroon
  '#9B7D3C', // Antique gold
  '#A0522D', // Sienna
  '#B8860B', // Dark goldenrod
  '#722F37', // Wine
  '#DAA520', // Goldenrod
]

const CustomTooltip = ({ active, payload, unit }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; value: number } }>; unit?: string }) => {
  if (!active || !payload || !payload.length) return null
  const entry = payload[0]
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
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#6B1F2B' }}>
        {entry.payload.name}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B1F2B' }}>
        {entry.value.toLocaleString()}{unit ? ` ${unit}` : ''}
      </p>
    </div>
  )
}

const RADIAN = Math.PI / 180
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 700 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function PieChartCard({
  title,
  data,
  colors = SUPREME_COLORS,
  height = 300,
  className = '',
  innerRadius = 0,
  outerRadius = 100,
  showLegend = true,
  showLabels = true,
  unit,
}: PieChartCardProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div
      className={`bg-white border border-[#C3A35E]/30 p-6 ${className}`}
      style={{ borderRadius: 0, boxShadow: 'none' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#6B1F2B] font-serif">{title}</h3>
        {total > 0 && (
          <span className="text-xs text-[#6B1F2B]/50 font-medium uppercase tracking-wider">
            Total: {total.toLocaleString()}{unit ? ` ${unit}` : ''}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-sm text-[#6B1F2B]/40">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              stroke="#F5F1E8"
              strokeWidth={2}
              label={showLabels ? (renderCustomLabel as unknown as boolean) : undefined}
              labelLine={false}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip unit={unit} />} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                iconType="square"
                iconSize={10}
                formatter={(value: string) => (
                  <span style={{ color: '#6B1F2B', fontSize: 12, fontWeight: 500 }}>
                    {value}
                  </span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
