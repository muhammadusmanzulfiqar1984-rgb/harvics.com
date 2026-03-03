'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import PortalSwitcher from '@/components/shared/PortalSwitcher'
import GeoSelector from '@/components/shared/GeoSelector'
import KPICard from '@/components/shared/KPICard'
import LineChartCard from '@/components/charts/LineChartCard'
import BarChartCard from '@/components/charts/BarChartCard'
import AIInsightsPanel from '@/components/shared/AIInsightsPanel'
import PortalOSHeader from '@/components/shared/PortalOSHeader'

interface SupplierKPIs {
  rfqs: number
  pos: number
  grns: number
  qcFailures: number
  leadTime: number
  paymentScore: number
}

export default function V16SupplierDashboard() {
  const locale = useLocale()
  const { selectedCountry, countryData } = useCountry()
  
  const [kpis, setKpis] = useState<SupplierKPIs>({
    rfqs: 45,
    pos: 128,
    grns: 95,
    qcFailures: 3,
    leadTime: 5.2,
    paymentScore: 98.5
  })
  const [activeTab, setActiveTab] = useState<'rfqs' | 'pos' | 'grn' | 'qc' | 'payments' | 'contracts' | 'ai-insights'>('rfqs')
  const [aiPanelOpen, setAiPanelOpen] = useState(false)

  const tabs = [
    { id: 'rfqs', label: 'RFQs', icon: '📄' },
    { id: 'pos', label: 'Purchase Orders', icon: '📋' },
    { id: 'grn', label: 'Deliveries / GRN', icon: '🚚' },
    { id: 'qc', label: 'QC', icon: '✅' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'contracts', label: 'Contracts', icon: '📜' },
    { id: 'ai-insights', label: 'AI Insights', icon: '🤖' }
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <PortalOSHeader 
        portal="supplier" 
        showBackButton={false}
      />

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Supplier KPIs */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard
              label="RFQs"
              value={kpis.rfqs.toLocaleString()}
              icon="📄"
              onClick={() => setActiveTab('rfqs')}
            />
            <KPICard
              label="POs"
              value={kpis.pos.toLocaleString()}
              change={{ value: 12.3, trend: 'up', label: 'previous period' }}
              icon="📋"
              onClick={() => setActiveTab('pos')}
            />
            <KPICard
              label="GRNs"
              value={kpis.grns.toLocaleString()}
              icon="🚚"
              onClick={() => setActiveTab('grn')}
            />
            <KPICard
              label="QC Failures"
              value={kpis.qcFailures}
              change={{ value: -15.0, trend: 'down', label: 'previous period' }}
              icon="⚠️"
              onClick={() => setActiveTab('qc')}
            />
            <KPICard
              label="Lead Time"
              value={`${kpis.leadTime} days`}
              change={{ value: -0.8, trend: 'down', label: 'previous period' }}
              icon="⏱️"
            />
            <KPICard
              label="Payment Score"
              value={`${kpis.paymentScore}%`}
              change={{ value: 1.2, trend: 'up', label: 'previous period' }}
              icon="💰"
              onClick={() => setActiveTab('payments')}
            />
          </div>
        </section>

        {/* Tabs Navigation */}
        <section className="mb-6">
          <div className="bg-white border-b border-[#C3A35E]/30 rounded-t-lg overflow-hidden shadow-sm">
            <div className="flex gap-0 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap border-r border-[#C3A35E]/10 ${
                    activeTab === tab.id
                      ? 'text-[#6B1F2B] border-b-2 border-[#C3A35E] bg-[#F8F9FA] font-bold'
                      : 'text-[#6B1F2B]/70 hover:text-[#6B1F2B] hover:bg-[#C3A35E]/5'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section>
          <div className="bg-white border border-[#C3A35E]/30 rounded-b-lg p-6 shadow-sm min-h-[400px]">
            {activeTab === 'rfqs' && (
              <div>
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Request for Quotations (RFQs)</h2>
                <p className="text-[#6B1F2B]/70">No active RFQs requiring attention.</p>
              </div>
            )}
            {activeTab === 'pos' && (
              <div>
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Purchase Orders</h2>
                <p className="text-[#6B1F2B]/70">3 active purchase orders in process.</p>
              </div>
            )}
            {activeTab === 'grn' && (
              <div>
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Deliveries / GRN</h2>
                <p className="text-[#6B1F2B]/70">Next delivery expected: Tomorrow, 10:00 AM.</p>
              </div>
            )}
            {activeTab === 'qc' && (
              <div>
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Quality Control</h2>
                <p className="text-[#6B1F2B]/70">QC Pass Rate: 98.5% this month.</p>
              </div>
            )}
            {activeTab === 'payments' && (
              <div>
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Payments & Invoices</h2>
                <p className="text-[#6B1F2B]/70">Next payment run: Friday.</p>
              </div>
            )}
            {activeTab === 'contracts' && (
              <div>
                <h2 className="text-xl font-bold text-[#6B1F2B] mb-4 font-serif">Contract Management</h2>
                <p className="text-[#6B1F2B]/70">All contracts are active and compliant.</p>
              </div>
            )}
            {activeTab === 'ai-insights' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#6B1F2B] font-serif">AI Insights</h2>
                  <button
                    onClick={() => setAiPanelOpen(true)}
                    className="px-4 py-2 bg-[#C3A35E] text-[#6B1F2B] rounded-md text-sm font-bold hover:bg-[#b5952f] transition-colors shadow-sm"
                  >
                    Open AI Panel
                  </button>
                </div>
                <p className="text-[#6B1F2B]/70 mb-4">Click "Open AI Panel" to view detailed AI insights and recommendations.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* AI Insights Panel */}
      <AIInsightsPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        insights={[
          {
            id: '1',
            type: 'prediction',
            title: 'Demand Forecast',
            description: 'Expected increase in PO volume by 15% next quarter based on historical patterns.',
            priority: 'high',
            confidence: 82
          },
          {
            id: '2',
            type: 'risk',
            title: 'Quality Alert',
            description: 'QC failure rate has increased. Review production processes to maintain quality standards.',
            priority: 'high'
          },
          {
            id: '3',
            type: 'opportunity',
            title: 'Efficiency Improvement',
            description: 'Optimize production schedule to reduce lead time by 2 days.',
            priority: 'medium'
          },
          {
            id: '4',
            type: 'action',
            title: 'Inventory Optimization',
            description: 'Review raw material inventory levels to reduce carrying costs.',
            priority: 'medium'
          }
        ]}
        title="Supplier AI Insights"
      />
    </div>
  )
}

