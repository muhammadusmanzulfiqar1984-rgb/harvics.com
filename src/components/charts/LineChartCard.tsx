'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface LineChartCardProps {
  title: string
  data: Array<{ [key: string]: string | number }>
  dataKeys: string[]
  colors?: string[]
  height?: number
  className?: string
}

export default function LineChartCard({
  title,
  data,
  dataKeys,
  colors = ['#6B1F2B', '#C3A35E', '#6B1F2B'],
  height = 300,
  className = ''
}: LineChartCardProps) {
  return (
    <div className={`bg-white border border-[#C3A35E]/30 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis 
            dataKey="name" 
            stroke="#666666"
            tick={{ fill: '#666666', fontSize: 12 }}
          />
          <YAxis 
            stroke="#666666"
            tick={{ fill: '#666666', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #C3A35E',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(212, 175, 55, 0.1)'
            }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

