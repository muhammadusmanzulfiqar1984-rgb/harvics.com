'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import KPICard from '@/components/shared/KPICard'

interface InvestorDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const investorData = {
  overview: { stockPrice: 42.50, change24h: '+2.3%', marketCap: '$1.2B', peRatio: 18.5, dividendYield: '2.1%' },
  financials: {
    quarterly: [
      { quarter: 'Q4 2024', revenue: 125000000, netIncome: 18500000, eps: 0.92, margin: 14.8 },
      { quarter: 'Q3 2024', revenue: 118000000, netIncome: 17200000, eps: 0.86, margin: 14.6 },
      { quarter: 'Q2 2024', revenue: 112000000, netIncome: 15800000, eps: 0.79, margin: 14.1 },
      { quarter: 'Q1 2024', revenue: 105000000, netIncome: 14500000, eps: 0.72, margin: 13.8 }
    ]
  },
  reports: [
    { title: 'Annual Report 2024', type: 'Annual', date: '2025-01-15', status: 'Published' },
    { title: 'Annual Report 2023', type: 'Annual', date: '2024-01-20', status: 'Published' },
    { title: 'Q4 2024 Earnings', type: 'Quarterly', date: '2025-01-10', status: 'Published' }
  ],
  news: [
    { date: 'January 15, 2025', title: 'Strong Q4 Performance', summary: 'Record quarterly revenue and expansion into new markets.' },
    { date: 'December 10, 2024', title: 'New Product Launch', summary: 'Introduction of premium product line in European markets.' },
    { date: 'November 5, 2024', title: 'Partnership Announcement', summary: 'Strategic distribution partnership in Asia-Pacific region.' }
  ]
}

function InvestorOverviewScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Stock Price" value={`$${investorData.overview.stockPrice}`} icon="" />
        <KPICard label="24h Change" value={investorData.overview.change24h} icon="" />
        <KPICard label="Market Cap" value={investorData.overview.marketCap} icon="" />
        <KPICard label="P/E Ratio" value={investorData.overview.peRatio} icon="" />
        <KPICard label="Dividend Yield" value={investorData.overview.dividendYield} icon="" />
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Stock Performance</h4>
        <div className="bg-[#F5F5F7] h-48 flex items-center justify-center border-2 border-dashed border-[#E5E5EA]/30" style={{ borderRadius: 0 }}>
          <div className="text-center">
            <div className="text-3xl mb-2"></div>
            <div className="font-semibold text-[#1D1D1F]">Interactive Stock Chart</div>
            <div className="text-sm text-[#8E8E93]">HRVC — ${investorData.overview.stockPrice} ({investorData.overview.change24h})</div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Latest News</h4>
        <div className="space-y-4">
          {investorData.news.map((n, i) => (
            <div key={i} className="border-b border-[#E5E5EA]/20 pb-4 last:border-0">
              <div className="text-xs text-[#8E8E93]">{n.date}</div>
              <div className="font-semibold text-[#1D1D1F]">{n.title}</div>
              <div className="text-sm text-[#8E8E93]">{n.summary}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FinancialResultsScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Quarterly Financial Results</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Quarter</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Revenue</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Net Income</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">EPS</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Margin</th>
            </tr></thead>
            <tbody>
              {investorData.financials.quarterly.map((q, i) => (
                <tr key={q.quarter} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{q.quarter}</td>
                  <td className="px-4 py-3 text-right">${(q.revenue / 1e6).toFixed(1)}M</td>
                  <td className="px-4 py-3 text-right">${(q.netIncome / 1e6).toFixed(1)}M</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1D1D1F]">${q.eps.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{q.margin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ReportsScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Annual Reports & Filings</h4>
        <div className="space-y-4">
          {investorData.reports.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-[#E5E5EA]/20" style={{ borderRadius: 0 }}>
              <div>
                <div className="font-semibold text-[#1D1D1F]">{r.title}</div>
                <div className="text-sm text-[#8E8E93]">{r.type} | {r.date}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1D1D1F]" style={{ borderRadius: 0 }}>{r.status}</span>
                <button className="px-4 py-2 text-sm font-bold text-white" style={{ background: '#6B1F2B', borderRadius: 0 }}>Download PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function InvestorDomainContent({ persona, locale }: InvestorDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    { id: 'investor-overview', label: 'Investor Dashboard', icon: '', description: 'Stock performance, market cap, KPIs, and latest news', component: <InvestorOverviewScreen />, tier3Screens: [{ id: 'overview', label: 'Overview', icon: '', component: <InvestorOverviewScreen /> }] },
    { id: 'financial-results', label: 'Financial Results', icon: '', description: 'Quarterly and annual financial performance data', component: <FinancialResultsScreen />, tier3Screens: [{ id: 'quarterly', label: 'Quarterly', icon: '', component: <FinancialResultsScreen /> }] },
    { id: 'reports-filings', label: 'Reports & Filings', icon: '', description: 'Annual reports, earnings reports, and regulatory filings', component: <ReportsScreen />, tier3Screens: [{ id: 'reports', label: 'Reports', icon: '', component: <ReportsScreen /> }] }
  ]

  return (
    <OSDomainTierStructure
      domainId="investor-relations"
      domainName="Investor Relations OS"
      tier2Modules={tier2Modules}
      defaultModule="investor-overview"
    />
  )
}
