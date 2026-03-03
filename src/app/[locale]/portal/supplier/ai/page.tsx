'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import PortalSwitcher from '@/components/shared/PortalSwitcher'
import GeoSelector from '@/components/shared/GeoSelector'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import AIInsightsPanel from '@/components/shared/AIInsightsPanel'

export default function SupplierAIPage() {
  const locale = useLocale()

  return (
    <AuthGuard allowedRoles={['supplier']}>
      <div className="min-h-screen bg-[#F2F2F2]">
        <header className="bg-white border-b border-black300 sticky top-0 z-50">
          <div className="max-w-[1920px] mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-black">H</div>
                <div>
                  <h1 className="text-lg font-bold text-black leading-tight">Harvics OS — Supplier Portal</h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GeoSelector />
                <PortalSwitcher currentPortal="supplier" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1920px] mx-auto px-6 py-6">
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-black">
              <li><a href={`/${locale}/portal/supplier`} className="hover:underline">Dashboard</a></li>
              <li>/</li>
              <li className="font-semibold">AI Insights</li>
            </ol>
          </nav>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black mb-2">AI Insights</h1>
            <p className="text-black">Tier 2: AI Insights Module - AI-powered predictions, recommendations, and actionable insights</p>
          </div>

          <div className="mb-6">
            <GlobalFilters />
          </div>

          <SectionCard title="AI-Powered Insights" subtitle="Predictions, risks, opportunities, and recommended actions">
            <AIInsightsPanel
              isOpen={true}
              onClose={() => {}}
              insights={[
                {
                  id: '1',
                  type: 'prediction',
                  title: 'PO Forecast',
                  description: 'Purchase orders expected to increase 20% next quarter based on historical trends.',
                  priority: 'high',
                  confidence: 82
                },
                {
                  id: '2',
                  type: 'risk',
                  title: 'Quality Alert',
                  description: 'QC pass rate slightly below target. Review quality processes.',
                  priority: 'medium'
                },
                {
                  id: '3',
                  type: 'opportunity',
                  title: 'Capacity Expansion',
                  description: 'Opportunity to increase production capacity for high-demand products.',
                  priority: 'medium'
                }
              ]}
            />
          </SectionCard>
        </main>
      </div>
    </AuthGuard>
  )
}

