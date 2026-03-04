'use client'

import React, { useState } from 'react'
import { useScrollReveal, revealClass } from '@/hooks/useScrollReveal'

/**
 * SupplyChainWheel — Interactive SVG wheel showing 14 supply chain stages.
 * Ported from Supreme's supply chain visualization.
 */

const stages = [
  { id: 1, label: 'Buyer Planning', desc: 'Market research, demand forecasting, product brief' },
  { id: 2, label: 'Product Design', desc: 'Design, sampling, tech packs, development' },
  { id: 3, label: 'Vendor Compliance', desc: 'Factory audits, certifications, ethical sourcing' },
  { id: 4, label: 'Raw Material', desc: 'Fabric sourcing, dye lots, material testing' },
  { id: 5, label: 'Factory Sourcing', desc: 'Supplier matching, capacity planning, MOQ negotiation' },
  { id: 6, label: 'Manufacturing', desc: 'Cutting, sewing, assembly, finishing' },
  { id: 7, label: 'Quality Control', desc: 'AQL inspection, lab testing, defect tracking' },
  { id: 8, label: 'Packaging', desc: 'Inner packaging, carton packing, labeling' },
  { id: 9, label: 'Documentation', desc: 'Commercial invoices, packing lists, COO' },
  { id: 10, label: 'Freight & Logistics', desc: 'Booking, container loading, shipping' },
  { id: 11, label: 'Customs Clearance', desc: 'Import documentation, duties, tariffs' },
  { id: 12, label: 'Warehousing', desc: 'Receiving, storage, inventory management' },
  { id: 13, label: 'Distribution', desc: 'Order fulfillment, last-mile delivery, retail' },
  { id: 14, label: 'Consumer', desc: 'End customer, feedback, returns, loyalty' },
]

const SupplyChainWheel: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0)
  const { ref, isVisible } = useScrollReveal()
  const radius = 200
  const centerX = 250
  const centerY = 250

  return (
    <section ref={ref} className={`bg-white py-16 px-4 border-t border-b border-[#C3A35E]/20 ${revealClass(isVisible, 'up')}`}>
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-[#6B1F2B] mb-3" style={{ letterSpacing: '-0.02em' }}>
            End-to-End Supply Chain
          </h2>
          <p className="text-base text-[#6B1F2B]/60 max-w-[500px] mx-auto">
            14 integrated stages from buyer planning to consumer delivery.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
          {/* SVG Wheel */}
          <div className="relative">
            <svg width="500" height="500" viewBox="0 0 500 500" className="w-full max-w-[400px] h-auto">
              {/* Center circle */}
              <circle cx={centerX} cy={centerY} r="60" fill="#6B1F2B" />
              <text x={centerX} y={centerY - 8} textAnchor="middle" fill="#C3A35E" className="text-[10px] font-bold">
                HARVICS
              </text>
              <text x={centerX} y={centerY + 8} textAnchor="middle" fill="#F5F1E8" className="text-[8px]">
                Supply Chain
              </text>

              {/* Stage nodes */}
              {stages.map((stage, idx) => {
                const angle = (idx * 360 / stages.length - 90) * (Math.PI / 180)
                const x = centerX + radius * Math.cos(angle)
                const y = centerY + radius * Math.sin(angle)
                const isActive = activeStage === idx

                return (
                  <g key={stage.id}>
                    {/* Line from center */}
                    <line
                      x1={centerX + 60 * Math.cos(angle)}
                      y1={centerY + 60 * Math.sin(angle)}
                      x2={x}
                      y2={y}
                      stroke={isActive ? '#C3A35E' : '#C3A35E'}
                      strokeWidth={isActive ? 2 : 0.5}
                      opacity={isActive ? 1 : 0.4}
                    />
                    {/* Node circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? 22 : 18}
                      fill={isActive ? '#6B1F2B' : '#F5F1E8'}
                      stroke={isActive ? '#C3A35E' : '#6B1F2B'}
                      strokeWidth={isActive ? 2 : 1}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setActiveStage(idx)}
                    />
                    {/* Number */}
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill={isActive ? '#C3A35E' : '#6B1F2B'}
                      className="text-[10px] font-bold pointer-events-none"
                    >
                      {stage.id}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Detail panel */}
          <div className="w-full lg:w-[340px] border border-[#C3A35E]/40 bg-[#F5F1E8] p-8" style={{ borderRadius: 0 }}>
            <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-widest mb-2">
              Stage {stages[activeStage].id} of 14
            </div>
            <h3 className="text-xl font-semibold text-[#6B1F2B] mb-3">
              {stages[activeStage].label}
            </h3>
            <p className="text-sm text-[#6B1F2B]/60 leading-relaxed mb-6">
              {stages[activeStage].desc}
            </p>
            {/* Progress */}
            <div className="w-full h-1 bg-[#C3A35E]/20">
              <div
                className="h-1 bg-[#C3A35E] transition-all duration-300"
                style={{ width: `${((activeStage + 1) / stages.length) * 100}%` }}
              />
            </div>
            {/* Stage buttons */}
            <div className="flex flex-wrap gap-1 mt-4">
              {stages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStage(idx)}
                  className={`w-6 h-6 text-[10px] font-bold border transition-all ${
                    idx === activeStage
                      ? 'bg-[#6B1F2B] text-[#C3A35E] border-[#6B1F2B]'
                      : 'bg-transparent text-[#6B1F2B]/60 border-[#C3A35E]/30 hover:border-[#6B1F2B]'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SupplyChainWheel
