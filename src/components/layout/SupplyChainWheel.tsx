'use client'

import React, { useState, useEffect } from 'react'

/**
 * SupplyChainWheel — Interactive end-to-end supply chain visualization
 * Premium McKinsey/BCG consulting style with rotating wheel + live stage KPIs.
 * Numbers are HARVICS operational baselines (annualized, demo dataset).
 */

interface WheelNode {
  label: string
  metric: string
  value: string
  detail: string
}

const wheelNodes: WheelNode[] = [
  { label: 'Consumers',                   metric: 'Markets served',   value: '42',         detail: 'End consumers reached across 42 countries through HARVICS networks.' },
  { label: 'Brands & Retailers',          metric: 'Active partners',  value: '1,240+',     detail: 'Retail chains, marketplaces and brand owners distributing HARVICS products.' },
  { label: 'Wholesaler',                  metric: 'Wholesale POs / yr',value: '8,900',     detail: 'Annual wholesale purchase orders processed through HARVICS Trade Hub.' },
  { label: 'Local Transport',             metric: 'Last-mile fleet',  value: '320 trucks', detail: 'Local distribution fleet across regional hubs and bonded warehouses.' },
  { label: 'Hubbing & Consolidation',     metric: 'Consolidation hubs',value: '14',         detail: 'Strategic consolidation hubs in Dubai, Singapore, Rotterdam, Karachi, NYC.' },
  { label: 'Freight & Customs',           metric: 'Containers / yr',  value: '12,400',     detail: 'FCL/LCL containers cleared through customs across all corridors.' },
  { label: 'DC & Transport',              metric: 'On-time delivery', value: '94.2%',      detail: 'Distribution-center to retailer on-time delivery, rolling 90-day average.' },
  { label: 'Manufacturing Control',       metric: 'QC inspections',   value: '6,800 / yr', detail: 'In-line and final QC inspections at partner factories worldwide.' },
  { label: 'Factory Sourcing',            metric: 'Audited factories',value: '380',        detail: 'Pre-qualified, audited manufacturing partners across 18 countries.' },
  { label: 'Raw Material Sourcing',       metric: 'Origin countries', value: '31',         detail: 'Direct raw-material origins from farms, mills, mines and refineries.' },
  { label: 'Vendor Compliance',           metric: 'Compliance score', value: '98.1%',      detail: 'Vendor compliance with HARVICS Code of Conduct and ESG standards.' },
  { label: 'Product Development',         metric: 'NPD projects',     value: '210 / yr',   detail: 'New product development projects from concept to commercial launch.' },
  { label: 'Product Design',              metric: 'Design studios',   value: '6',          detail: 'In-house design studios across HARVICS regional headquarters.' },
  { label: 'Buyer Planning',              metric: 'Forecast accuracy',value: '91%',        detail: 'AI-assisted demand-forecast accuracy across managed SKU portfolios.' },
]

interface StageKPI {
  stage: string
  volume: string
  onTime: number  // percentage
  leadTime: string
}

const stageKPIs: StageKPI[] = [
  { stage: 'Buyer Planning',        volume: '210 NPD',     onTime: 96, leadTime: '2 wks' },
  { stage: 'Product Design',        volume: '6 studios',   onTime: 93, leadTime: '3 wks' },
  { stage: 'Product Development',   volume: '380 factories',onTime: 91, leadTime: '4 wks' },
  { stage: 'Vendor Compliance',     volume: '98.1% pass',  onTime: 98, leadTime: '1 wk'  },
  { stage: 'Factory & Social QC',   volume: '6.8k audits', onTime: 95, leadTime: '2 wks' },
  { stage: 'DC & Transport',        volume: '12.4k TEU',   onTime: 94, leadTime: '6 wks' },
  { stage: 'Retailer Delivery',     volume: '1,240+ accts',onTime: 96, leadTime: '1 wk'  },
]

const streamRows = [
  'Trading House',
  'Importer / Wholesaler',
  'Supplier Network',
  'In-house Buying Office',
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

  // Animated bar progress (used for the flowing highlight inside each KPI bar)
  useEffect(() => {
    const interval = setInterval(() => {
      setBarProgress(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const radius = 180
  const centerX = 250
  const centerY = 250
  const activeNode = hoveredLabel !== null ? wheelNodes[hoveredLabel] : null

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
            14 stages. 42 markets. One HARVICS operating system. Hover any node for live metrics.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          
          {/* LEFT SIDE: Rotating Wheel + live detail card */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative" style={{ width: 320, height: 320 }}>
              <svg width="320" height="320" viewBox="0 0 500 500" className="w-full h-auto">
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
                  {wheelNodes.map((_, idx) => {
                    const angle = (idx * 360 / wheelNodes.length) * (Math.PI / 180)
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
                  {wheelNodes.map((_, idx) => {
                    const angle = (idx * 360 / wheelNodes.length) * (Math.PI / 180)
                    const x = centerX + radius * Math.cos(angle)
                    const y = centerY + radius * Math.sin(angle)
                    const isHovered = hoveredLabel === idx

                    return (
                      <g key={idx}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 9 : 6}
                          fill={isHovered ? '#E5C07B' : '#6B1F2A'}
                          className="cursor-pointer"
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
                {wheelNodes.map((node, idx) => {
                  const angle = ((idx * 360 / wheelNodes.length) + rotation) * (Math.PI / 180)
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
                        transition: 'all 0.3s ease',
                        filter: isHovered ? 'drop-shadow(0 0 4px rgba(229,192,123,0.8))' : 'none'
                      }}
                    >
                      {node.label}
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

            {/* Live detail card under the wheel — fills with real numbers on hover */}
            <div
              className="mt-3 w-full max-w-sm rounded-xl border px-4 py-3 transition-all"
              style={{
                borderColor: activeNode ? 'rgba(229,192,123,0.6)' : 'rgba(107,31,42,0.12)',
                background: activeNode
                  ? 'linear-gradient(145deg, #fffaf0 0%, #fff 100%)'
                  : 'linear-gradient(145deg, #fafafa 0%, #fff 100%)',
                boxShadow: activeNode ? '0 8px 24px rgba(107,31,42,0.08)' : 'none',
                minHeight: 86,
              }}
            >
              {activeNode ? (
                <>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#C3A35E' }}>
                      {activeNode.metric}
                    </span>
                    <span className="text-2xl font-bold" style={{ color: '#6B1F2A', letterSpacing: '-0.02em' }}>
                      {activeNode.value}
                    </span>
                  </div>
                  <div className="text-sm font-semibold mb-1" style={{ color: '#6B1F2A' }}>
                    {activeNode.label}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(107,31,42,0.65)' }}>
                    {activeNode.detail}
                  </p>
                </>
              ) : (
                <div className="text-xs flex items-center justify-center h-full" style={{ color: 'rgba(107,31,42,0.45)' }}>
                  Hover any node on the wheel to see live HARVICS metrics for that stage.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Real stage KPIs (replaces abstract pulsing grid) */}
          <div className="flex flex-col justify-center">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-lg font-semibold" style={{ color: '#6B1F2A' }}>
                  Live Stage Metrics
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#C3A35E' }}>
                  90-day rolling
                </span>
              </div>

              {/* KPI table header */}
              <div className="grid grid-cols-12 gap-2 px-2 mb-2 text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(107,31,42,0.55)' }}>
                <div className="col-span-4">Stage</div>
                <div className="col-span-3">Volume</div>
                <div className="col-span-3">On-Time</div>
                <div className="col-span-2 text-right">Lead</div>
              </div>

              {/* KPI rows */}
              <div className="space-y-1.5">
                {stageKPIs.map((kpi, idx) => {
                  const barKey = `kpi-${idx}`
                  const isHovered = hoveredBar === barKey
                  const flow = (barProgress + idx * 14) % 100
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: isHovered ? 'rgba(229,192,123,0.10)' : 'transparent',
                        boxShadow: isHovered ? 'inset 0 0 0 1px rgba(229,192,123,0.45)' : 'none',
                      }}
                      onMouseEnter={() => setHoveredBar(barKey)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div className="col-span-4 text-[11px] font-medium truncate" style={{ color: '#6B1F2A' }}>
                        {kpi.stage}
                      </div>
                      <div className="col-span-3 text-[11px] font-semibold" style={{ color: '#6B1F2A' }}>
                        {kpi.volume}
                      </div>
                      <div className="col-span-3 flex items-center gap-1.5">
                        <div className="flex-1 h-2 rounded-full overflow-hidden relative" style={{ background: '#F1E8DA' }}>
                          <div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              width: `${kpi.onTime}%`,
                              background: 'linear-gradient(90deg, #6B1F2A 0%, #C3A35E 100%)',
                              transition: 'width 0.6s ease',
                            }}
                          />
                          {/* Subtle flowing highlight to show the lane is "live" */}
                          <div
                            className="absolute inset-y-0 w-8 pointer-events-none"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
                              transform: `translateX(${flow * 4 - 50}%)`,
                              opacity: kpi.onTime > 50 ? 0.55 : 0,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold w-9 text-right" style={{ color: '#6B1F2A' }}>
                          {kpi.onTime}%
                        </span>
                      </div>
                      <div className="col-span-2 text-[10px] text-right font-medium" style={{ color: 'rgba(107,31,42,0.7)' }}>
                        {kpi.leadTime}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer summary tiles */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-gray-100">
                {streamRows.map((row, i) => (
                  <div
                    key={i}
                    className="rounded-lg px-2 py-2 text-center"
                    style={{ background: 'rgba(107,31,42,0.04)', border: '1px solid rgba(107,31,42,0.08)' }}
                  >
                    <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#C3A35E' }}>
                      Stream
                    </div>
                    <div className="text-[10px] font-semibold mt-0.5" style={{ color: '#6B1F2A' }}>
                      {row}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default SupplyChainWheel
