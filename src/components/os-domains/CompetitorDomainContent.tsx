'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import KPICard from '@/components/shared/KPICard'
import { CompetitorAnalyticsCharts } from '@/components/os-domains/DomainAnalyticsCharts'

interface CompetitorDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const competitorData = {
  competitors: [
    { name: 'Coca-Cola', share: 28, focus: 'Beverages, mass market penetration' },
    { name: 'PepsiCo', share: 22, focus: 'Beverages & snacks, youth marketing' },
    { name: 'Nestlé', share: 15, focus: 'FMCG, health & wellness' },
    { name: 'Unilever', share: 12, focus: 'Personal care, sustainability' },
    { name: 'Local Brand A', share: 8, focus: 'Regional beverages, low-cost' }
  ],
  products: [
    { name: 'Competitor Beverage X', competitor: 'Coca-Cola', price: 2.50, ourPrice: 2.30, change: '-5%', category: 'Carbonated' },
    { name: 'Competitor Snack Y', competitor: 'PepsiCo', price: 3.00, ourPrice: 2.80, change: '+2%', category: 'Snacks' },
    { name: 'Competitor Water Z', competitor: 'Nestlé', price: 1.20, ourPrice: 1.10, change: '0%', category: 'Water' }
  ],
  swot: {
    strengths: ['Strong FMCG portfolio', 'Multi-country presence', 'AI-driven analytics', 'Direct distribution network'],
    weaknesses: ['Newer market entrant', 'Limited brand awareness', 'Smaller marketing budget'],
    opportunities: ['Emerging markets in Africa', 'Health-conscious products', 'Digital distribution channels', 'Private label partnerships'],
    threats: ['Aggressive competitor pricing', 'Regulatory changes', 'Supply chain disruptions', 'Currency fluctuations']
  }
}

function MarketShareScreen() {
  const totalShare = competitorData.competitors.reduce((acc, c) => acc + c.share, 0)
  const harvicsShare = Math.max(0, 100 - totalShare)
  const topCompetitor = competitorData.competitors[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Harvics Share" value={`${harvicsShare.toFixed(1)}%`} icon="" />
        <KPICard label="Top Competitor" value={`${topCompetitor.name} (${topCompetitor.share}%)`} icon="" />
        <KPICard label="Tracked Competitors" value={competitorData.competitors.length} icon="" />
        <KPICard label="Competitive Gap" value={`${Math.max(0, topCompetitor.share - harvicsShare).toFixed(1)}%`} icon="" />
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Competitor Pricing & Focus</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Brand</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Market Share</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Focus Area</th>
            </tr></thead>
            <tbody>
              {competitorData.competitors.map((c, i) => (
                <tr key={c.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{c.name}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">{c.share}%</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{c.focus}</td>
                </tr>
              ))}
              <tr className="bg-[#F5F5F7] border-t-2 border-[#E5E5EA]">
                <td className="px-4 py-3 font-semibold text-[#1A1A1A]">Harvics (You)</td>
                <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">{harvicsShare.toFixed(1)}%</td>
                <td className="px-4 py-3 text-[#8E8E93]">FMCG, multi-vertical, AI-powered</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ProductTrackingScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Product Price Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Product</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Competitor</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Category</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Their Price</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Our Price</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">24h Change</th>
            </tr></thead>
            <tbody>
              {competitorData.products.map((p, i) => (
                <tr key={p.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{p.name}</td>
                  <td className="px-4 py-3">{p.competitor}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{p.category}</span></td>
                  <td className="px-4 py-3 text-right">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">${p.ourPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${p.change.startsWith('-') ? 'bg-[#F5F5F7] text-[#1A1A1A]' : p.change === '0%' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{p.change}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SWOTScreen() {
  const sections = [
    { title: 'Strengths', icon: '', items: competitorData.swot.strengths, color: 'bg-[#F5F5F7] border-green-200' },
    { title: 'Weaknesses', icon: '️', items: competitorData.swot.weaknesses, color: 'bg-[#F5F5F7] border-red-200' },
    { title: 'Opportunities', icon: '', items: competitorData.swot.opportunities, color: 'bg-[#F5F5F7] border-blue-200' },
    { title: 'Threats', icon: '', items: competitorData.swot.threats, color: 'bg-[#F5F5F7] border-orange-200' }
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map(s => (
        <div key={s.title} className={`border p-6 ${s.color}`} style={{ borderRadius: 0 }}>
          <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">{s.icon} {s.title}</h4>
          <ul className="space-y-2">
            {s.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A1A]">
                <span className="text-harvics-gold mt-1">•</span>{item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function CompetitorDomainContent({ persona, locale }: CompetitorDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'market-share',
      label: 'Market Share Analysis',
      icon: '',
      description: 'Market share breakdown, competitor positioning, and competitive gap analysis',
      component: <MarketShareScreen />,
      tier3Screens: [
        { id: 'share-overview', label: 'Share Overview', icon: '', component: <MarketShareScreen /> }
      ]
    },
    {
      id: 'product-tracking',
      label: 'Product & Price Tracking',
      icon: '',
      description: 'Track competitor products, pricing changes, and category performance',
      component: <ProductTrackingScreen />,
      tier3Screens: [
        { id: 'price-comparison', label: 'Price Comparison', icon: '', component: <ProductTrackingScreen /> }
      ]
    },
    {
      id: 'swot-analysis',
      label: 'SWOT Analysis',
      icon: '',
      description: 'Strategic strengths, weaknesses, opportunities, and threats assessment',
      component: <SWOTScreen />,
      tier3Screens: [
        { id: 'swot', label: 'SWOT Matrix', icon: '', component: <SWOTScreen /> }
      ]
    }
  ]

  tier2Modules.unshift({
    id: 'competitor-analytics',
    label: 'Analytics Dashboard',
    icon: '',
    description: 'Competitive intelligence — market share, pricing index, trend analysis',
    component: <CompetitorAnalyticsCharts />,
    tier3Screens: [{ id: 'competitor-charts', label: 'Competitor Charts', icon: '', component: <CompetitorAnalyticsCharts /> }]
  })

  return (
    <OSDomainTierStructure
      domainId="competitor-intelligence"
      domainName="Competitor Intelligence OS"
      tier2Modules={tier2Modules}
      defaultModule="competitor-analytics"
    />
  )
}
