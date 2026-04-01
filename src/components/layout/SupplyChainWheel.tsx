'use client'

import React, { useState, useEffect } from 'react'

/**
 * SupplyChainWheel — Interactive end-to-end supply chain visualization
 * Premium McKinsey/BCG consulting style with rotating wheel + workflow grid
 */

const wheelLabels = [
  'Consumers',
  'Brands / Retailers',
  'Wholesaler',
  'Local transportation',
  'Hubbing & consolidation',
  'Freight forwarding & customs clearance',
  'DC & transport management',
  'Manufacturing control',
  'Factory sourcing',
  'Raw material sourcing',
  'Vendor compliance',
  'Product development',
  'Product design',
  'Buyer planning',
]

const workflowColumns = [
  'Buyer planning',
  'Product design',
  'Product development',
  'Vendor compliance',
  'Factory & social control',
  'DC & transport',
  'Retailer'
]

const workflowRows = [
  'Supply Chain Solutions',
  'Importer / Wholesaler',
  'Supplier',
  'In-house buying office'
]

const SupplyChainWheel: React.FC = () => {
  const [hoveredLabel, setHoveredLabel] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)
  const [barProgress, setBarProgress] = useState(0)

  // Continuous rotation
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [isPaused])

  // Animated bar progress
  useEffect(() => {
    const interval = setInterval(() => {
      setBarProgress(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const radius = 180
  const centerX = 250
  const centerY = 250

  return (
    <section className="relative h-full px-6 overflow-hidden flex flex-col justify-center" style={{ background: '#ffffff' }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-1" 
            style={{ 
              color: '#6B1F2A',
              letterSpacing: '-0.02em',
              fontWeight: 600
            }}
          >
            End-to-End Supply Chain
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Comprehensive management across every stage of the global supply chain
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          
          {/* LEFT SIDE: Rotating Wheel */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative" style={{ width: 260, height: 260 }}>
              <svg width="260" height="260" viewBox="0 0 500 500" className="w-full h-auto">
                {/* Outer circle ring */}
                <circle 
                  cx={centerX} 
                  cy={centerY} 
                  r={radius} 
                  fill="none" 
                  stroke="#6B1F2A" 
                  strokeWidth="1"
                  opacity="0.2"
                />

                {/* Rotating group */}
                <g transform={`rotate(${rotation} ${centerX} ${centerY})`}>
                  {/* Connection lines */}
                  {wheelLabels.map((_, idx) => {
                    const angle = (idx * 360 / wheelLabels.length) * (Math.PI / 180)
                    const x = centerX + radius * Math.cos(angle)
                    const y = centerY + radius * Math.sin(angle)
                    
                    return (
                      <line
                        key={`line-${idx}`}
                        x1={centerX}
                        y1={centerY}
                        x2={x}
                        y2={y}
                        stroke="#6B1F2A"
                        strokeWidth="0.5"
                        opacity="0.15"
                      />
                    )
                  })}

                  {/* Label nodes */}
                  {wheelLabels.map((label, idx) => {
                    const angle = (idx * 360 / wheelLabels.length) * (Math.PI / 180)
                    const x = centerX + radius * Math.cos(angle)
                    const y = centerY + radius * Math.sin(angle)
                    const isHovered = hoveredLabel === idx

                    return (
                      <g key={idx}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 8 : 6}
                          fill={isHovered ? '#E5C07B' : '#6B1F2A'}
                          className="cursor-pointer transition-all"
                          style={{ 
                            filter: isHovered ? 'drop-shadow(0 0 8px rgba(229,192,123,0.6))' : 'none',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={() => {
                            setHoveredLabel(idx)
                            setIsPaused(true)
                          }}
                          onMouseLeave={() => {
                            setHoveredLabel(null)
                            setIsPaused(false)
                          }}
                        />
                      </g>
                    )
                  })}
                </g>

                {/* Labels (non-rotating) */}
                {wheelLabels.map((label, idx) => {
                  const angle = ((idx * 360 / wheelLabels.length) + rotation) * (Math.PI / 180)
                  const labelRadius = radius + 40
                  const x = centerX + labelRadius * Math.cos(angle)
                  const y = centerY + labelRadius * Math.sin(angle)
                  const isHovered = hoveredLabel === idx

                  return (
                    <text
                      key={`label-${idx}`}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[9px] font-medium pointer-events-none"
                      style={{
                        fill: isHovered ? '#E5C07B' : '#6B1F2A',
                        fontWeight: isHovered ? 600 : 400,
                        transform: isHovered ? `translateY(-4px)` : 'none',
                        transition: 'all 0.3s ease',
                        filter: isHovered ? 'drop-shadow(0 0 4px rgba(229,192,123,0.8))' : 'none'
                      }}
                    >
                      {label}
                    </text>
                  )
                })}

                {/* Center text */}
                <g>
                  <circle cx={centerX} cy={centerY} r="70" fill="#6B1F2A" opacity="0.95" />
                  <text 
                    x={centerX} 
                    y={centerY - 10} 
                    textAnchor="middle" 
                    className="text-[14px] font-bold"
                    fill="#E5C07B"
                    style={{ letterSpacing: '1px' }}
                  >
                    GLOBAL SUPPLY CHAIN
                  </text>
                  <text 
                    x={centerX} 
                    y={centerY + 10} 
                    textAnchor="middle" 
                    className="text-[11px] font-medium"
                    fill="#ffffff"
                    style={{ letterSpacing: '0.5px' }}
                  >
                    END-TO-END MANAGEMENT
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* RIGHT SIDE: Workflow Flow Lines */}
          <div className="flex flex-col justify-center">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#6B1F2A' }}>
                Supply Chain Operations
              </h3>
              
              {/* Column headers */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-36"></div>
                {workflowColumns.map((col, idx) => (
                  <div 
                    key={idx} 
                    className="text-[9px] font-semibold text-center flex-1"
                    style={{ color: '#6B1F2A' }}
                  >
                    {col}
                  </div>
                ))}
              </div>

              {/* Horizontal animated bars */}
              <div className="space-y-1.5">
                {workflowRows.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex items-center gap-2">
                    {/* Row label */}
                    <div className="w-36 text-xs font-medium" style={{ color: '#6B1F2A' }}>
                      {row}
                    </div>
                    
                    {/* Horizontal bar with segments */}
                    <div className="flex-1 flex gap-1">
                      {workflowColumns.map((_, colIdx) => {
                        const progress = (barProgress + rowIdx * 15 + colIdx * 10) % 100
                        const isActive = progress > 50
                        const barKey = `${rowIdx}-${colIdx}`
                        const isHovered = hoveredBar === barKey

                        return (
                          <div
                            key={colIdx}
                            className="flex-1 h-6 relative overflow-hidden cursor-pointer transition-all rounded"
                            style={{
                              background: isActive ? '#6B1F2A' : '#E5E7EB',
                              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                              boxShadow: isHovered ? '0 4px 12px rgba(107,31,42,0.4)' : 'none'
                            }}
                            onMouseEnter={() => setHoveredBar(barKey)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {/* Flowing animation left to right */}
                            <div
                              className="absolute inset-0"
                              style={{
                                background: `linear-gradient(90deg, 
                                  transparent 0%, 
                                  rgba(229,192,123,0.4) 45%, 
                                  rgba(229,192,123,0.6) 50%, 
                                  rgba(229,192,123,0.4) 55%, 
                                  transparent 100%)`,
                                transform: `translateX(${progress - 100}%)`,
                                transition: 'transform 0.05s linear'
                              }}
                            />
                            
                            {isHovered && (
                              <div className="absolute inset-0 border-2 border-[#E5C07B]" style={{ borderRadius: 4 }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: '#6B1F2A' }} />
                  <span style={{ color: '#6B1F2A' }}>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <span className="text-gray-600">Inactive</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default SupplyChainWheel
