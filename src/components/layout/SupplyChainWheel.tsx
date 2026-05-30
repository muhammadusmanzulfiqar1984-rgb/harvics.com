'use client'

import React, { useState, useEffect } from 'react'

/**
 * SupplyChainWheel — Option C "Dark Cockpit"
 * Single unified burgundy card: gold-on-dark wheel (left) + live metrics (right).
 * Palantir / Bloomberg-terminal aesthetic.
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
  onTime: number
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

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [isPaused])

  useEffect(() => {
    const interval = setInterval(() => {
      setBarProgress(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const radius = 170
  const centerX = 250
  const centerY = 250
  const activeNode = hoveredLabel !== null ? wheelNodes[hoveredLabel] : null

  return (
    <section className="relative px-6 py-16 lg:py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #faf7f1 100%)' }}>
      <div className="max-w-[1400px] mx-auto">

        {/* Section Header */}
        <div className="text-center mb-10">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ height: '1px', width: '36px', background: '#C3A35E' }} />
            <span style={{ color: '#C3A35E', fontSize: '10px', fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase' }}>End-to-End Operating System</span>
            <div style={{ height: '1px', width: '36px', background: '#C3A35E' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(30px, 4.2vw, 48px)', fontWeight: 200, letterSpacing: '-0.025em', color: '#1A0505', lineHeight: 1.1, marginBottom: '12px' }}>
            14 stages.{' '}
            <span style={{ color: '#6B1F2B', fontWeight: 400 }}>One supply chain.</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#888', maxWidth: '580px', margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>
            Every brief flows through the same operating system — one cockpit, 42 markets, one accountable team.
          </p>
        </div>

        {/* ============ COCKPIT CARD ============ */}
        <div style={{ background: '#1A0505', border: '1px solid rgba(201,168,76,0.3)', overflow: 'hidden' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* LEFT — Wheel (5/12) */}
            <div className="lg:col-span-5" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(201,168,76,0.15)' }}>
              <div className="relative" style={{ width: 360, height: 360, maxWidth: '100%' }}>
                <svg width="100%" height="100%" viewBox="0 0 500 500">
                  {/* Outer dashed ring */}
                  <circle cx={centerX} cy={centerY} r={radius + 18} fill="none" stroke="rgba(201,168,76,0.18)" strokeWidth="0.8" strokeDasharray="3 5" />
                  <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="rgba(201,168,76,0.25)" strokeWidth="1" />

                  {/* Rotating group with spokes + nodes */}
                  <g transform={`rotate(${rotation} ${centerX} ${centerY})`}>
                    {wheelNodes.map((_, idx) => {
                      const angle = (idx * 360 / wheelNodes.length) * (Math.PI / 180)
                      const x = centerX + radius * Math.cos(angle)
                      const y = centerY + radius * Math.sin(angle)
                      return (
                        <line key={`line-${idx}`} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#C3A35E" strokeWidth="0.5" opacity="0.12" />
                      )
                    })}
                    {wheelNodes.map((_, idx) => {
                      const angle = (idx * 360 / wheelNodes.length) * (Math.PI / 180)
                      const x = centerX + radius * Math.cos(angle)
                      const y = centerY + radius * Math.sin(angle)
                      const isHovered = hoveredLabel === idx
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r={isHovered ? 10 : 6.5}
                          fill={isHovered ? '#fff' : '#C3A35E'}
                          stroke="#1A0505"
                          strokeWidth="1.5"
                          className="cursor-pointer"
                          style={{
                            filter: isHovered ? 'drop-shadow(0 0 10px rgba(201,168,76,0.8))' : 'none',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={() => { setHoveredLabel(idx); setIsPaused(true) }}
                          onMouseLeave={() => { setHoveredLabel(null); setIsPaused(false) }}
                        />
                      )
                    })}
                  </g>

                  {/* Labels (non-rotating) */}
                  {wheelNodes.map((node, idx) => {
                    const angle = ((idx * 360 / wheelNodes.length) + rotation) * (Math.PI / 180)
                    const labelRadius = radius + 42
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
                        className="pointer-events-none"
                        style={{
                          fontSize: '9px',
                          fill: isHovered ? '#fff' : 'rgba(245,240,232,0.65)',
                          fontWeight: isHovered ? 700 : 500,
                          letterSpacing: '0.05em',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {node.label}
                      </text>
                    )
                  })}

                  {/* Center — gold disc on dark */}
                  <circle cx={centerX} cy={centerY} r="62" fill="#C3A35E" />
                  <circle cx={centerX} cy={centerY} r="62" fill="none" stroke="#1A0505" strokeWidth="2" />
                  <text x={centerX} y={centerY - 8} textAnchor="middle" style={{ fontSize: '9px', fontWeight: 700, fill: '#1A0505', letterSpacing: '3px' }}>HARVICS</text>
                  <text x={centerX} y={centerY + 6} textAnchor="middle" style={{ fontSize: '10px', fontWeight: 600, fill: '#1A0505', letterSpacing: '0.5px' }}>Operating</text>
                  <text x={centerX} y={centerY + 18} textAnchor="middle" style={{ fontSize: '10px', fontWeight: 600, fill: '#1A0505', letterSpacing: '0.5px' }}>System</text>
                </svg>
              </div>

              {/* Live detail card under wheel */}
              <div
                style={{
                  marginTop: '20px',
                  width: '100%',
                  maxWidth: '380px',
                  padding: '14px 18px',
                  background: activeNode ? 'rgba(201,168,76,0.08)' : 'rgba(245,240,232,0.04)',
                  border: `1px solid ${activeNode ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.15)'}`,
                  minHeight: '86px',
                  transition: 'all 0.25s ease',
                }}
              >
                {activeNode ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C3A35E' }}>{activeNode.metric}</span>
                      <span style={{ fontSize: '22px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>{activeNode.value}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{activeNode.label}</div>
                    <p style={{ fontSize: '11px', lineHeight: 1.6, color: 'rgba(245,240,232,0.6)' }}>{activeNode.detail}</p>
                  </>
                ) : (
                  <div style={{ fontSize: '10px', color: 'rgba(245,240,232,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '58px' }}>
                    Hover any node for live metrics
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Live Metrics (7/12) */}
            <div className="lg:col-span-7" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#fff' }}>Live Stage Metrics</h3>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C3A35E', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', background: '#C3A35E', borderRadius: '50%', animation: 'harvicsCockpitPulse 2s infinite' }} />
                  90-Day Rolling
                </span>
              </div>

              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 px-2 mb-2" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C3A35E' }}>
                <div className="col-span-4">Stage</div>
                <div className="col-span-3">Volume</div>
                <div className="col-span-3">On-Time</div>
                <div className="col-span-2 text-right">Lead</div>
              </div>

              {/* KPI rows */}
              <div className="space-y-1">
                {stageKPIs.map((kpi, idx) => {
                  const barKey = `kpi-${idx}`
                  const isHovered = hoveredBar === barKey
                  const flow = (barProgress + idx * 14) % 100
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center px-2 py-2 cursor-pointer transition-all"
                      style={{
                        background: isHovered ? 'rgba(201,168,76,0.08)' : 'transparent',
                        borderBottom: '1px solid rgba(201,168,76,0.08)',
                      }}
                      onMouseEnter={() => setHoveredBar(barKey)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div className="col-span-4" style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{kpi.stage}</div>
                      <div className="col-span-3" style={{ fontSize: '12px', color: 'rgba(245,240,232,0.75)' }}>{kpi.volume}</div>
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="flex-1 relative" style={{ height: '4px', background: 'rgba(201,168,76,0.15)' }}>
                          <div
                            className="absolute inset-y-0 left-0"
                            style={{
                              width: `${kpi.onTime}%`,
                              background: '#C3A35E',
                              transition: 'width 0.6s ease',
                            }}
                          />
                          <div
                            className="absolute inset-y-0 w-6 pointer-events-none"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                              transform: `translateX(${flow * 4 - 50}%)`,
                              opacity: 0.5,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#C3A35E', minWidth: '32px', textAlign: 'right' }}>{kpi.onTime}%</span>
                      </div>
                      <div className="col-span-2 text-right" style={{ fontSize: '11px', color: 'rgba(245,240,232,0.55)', fontWeight: 500 }}>{kpi.leadTime}</div>
                    </div>
                  )
                })}
              </div>

              {/* Streams */}
              <div className="grid grid-cols-4 gap-0 mt-5 pt-4" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
                {streamRows.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      borderRight: i < streamRows.length - 1 ? '1px solid rgba(201,168,76,0.15)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C3A35E', marginBottom: '4px' }}>Stream</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>{row}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes harvicsCockpitPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        ` }} />
      </div>
    </section>
  )
}

export default SupplyChainWheel
