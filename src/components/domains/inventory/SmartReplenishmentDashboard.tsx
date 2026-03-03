
'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useLocalization } from '@/utils/localization'

interface Opportunity {
  sku: string
  origin: string
  margin: string
  strategy: string
  voidScore: number
  status: 'Critical' | 'High' | 'Medium'
}

export default function SmartReplenishmentDashboard() {
  const { selectedCountry } = useCountry()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate "Sovereign Architect" Analysis
    setLoading(true)
    setTimeout(() => {
      const mockData: Opportunity[] = [
        {
          sku: 'Harvics Energy (20g)',
          origin: 'Local Cooperative (Ashanti)',
          margin: '65%',
          strategy: 'AGGRESSIVE ARBITRAGE',
          voidScore: 85,
          status: 'Critical'
        },
        {
          sku: 'Harvics Honey Glaze Selection',
          origin: 'Ghana (Direct Trade)',
          margin: '35%',
          strategy: 'INFLATION SHIELD',
          voidScore: 60,
          status: 'High'
        },
        {
          sku: 'Harvics Vitality Infusion',
          origin: 'Kenya (Fair Trade)',
          margin: '42%',
          strategy: 'MARKET PENETRATION',
          voidScore: 55,
          status: 'Medium'
        }
      ]
      setOpportunities(mockData)
      setLoading(false)
    }, 1500)
  }, [selectedCountry])

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C3A35E] mb-4"></div>
        <h3 className="text-lg font-bold text-[#6B1F2B]">Sovereign Architect Analysis...</h3>
        <p className="text-gray-500">Scanning market voids and supply chain routes for {selectedCountry || 'Global'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6B1F2B] to-[#5a000c] rounded-lg p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🧠</span>
            <h2 className="text-2xl font-bold font-serif text-[#C3A35E]">Smart Replenishment</h2>
          </div>
          <p className="text-white/80 max-w-2xl">
            AI-detected restocking opportunities based on real-time "Market Voids" and margin analysis.
            These SKUs are auto-generated to maximize profit while maintaining brand integrity.
          </p>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#C3A35E]/20 to-transparent"></div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {opportunities.map((opp, idx) => (
          <div key={idx} className="bg-white border border-[#C3A35E]/30 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                opp.status === 'Critical' ? 'bg-red-100 text-red-700' : 
                opp.status === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {opp.status} Void
              </span>
              <span className="text-[#6B1F2B] font-bold text-sm">Score: {opp.voidScore}/100</span>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#6B1F2B] mb-1 group-hover:text-[#C3A35E] transition-colors">
                {opp.sku}
              </h3>
              <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">Origin: {opp.origin}</p>
              
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Proj. Margin</p>
                  <p className="text-3xl font-bold text-green-600">{opp.margin}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase">Strategy</p>
                  <p className="text-xs font-bold text-[#6B1F2B] bg-[#C3A35E]/20 px-2 py-1 rounded">
                    {opp.strategy}
                  </p>
                </div>
              </div>

              <button className="w-full py-2.5 bg-[#6B1F2B] text-white font-bold rounded hover:bg-[#C3A35E] hover:text-[#6B1F2B] transition-all flex items-center justify-center gap-2">
                <span>⚡</span> Initiate Supply Chain
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insight Footer */}
      <div className="bg-[#C3A35E]/10 border border-[#C3A35E] rounded-lg p-4 flex items-start gap-4">
        <div className="bg-[#C3A35E] text-[#6B1F2B] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
          i
        </div>
        <div>
          <h4 className="font-bold text-[#6B1F2B]">Sovereign Architect Insight</h4>
          <p className="text-sm text-[#6B1F2B]/80 mt-1">
            Current market conditions in {selectedCountry || 'Global'} indicate a high demand for energy-boosting snacks due to rising temperatures (35°C+). 
            Recommended action: Prioritize "Harvics Energy" production to capture the 85/100 void score.
          </p>
        </div>
      </div>
    </div>
  )
}
