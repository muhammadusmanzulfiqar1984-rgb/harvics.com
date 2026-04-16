'use client'

import SectionCard from '@/components/shared/SectionCard'
import AIInsightsPanel from '@/components/shared/AIInsightsPanel'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function SupplierAIPage() {
  return (
    <PortalSubPageLayout
      portal="supplier"
      allowedRoles={['supplier', 'company_admin', 'admin', 'hq']}
      currentPage="AI Insights"
      pageTitle="AI Insights"
      pageDescription="Tier 2: AI Insights Module — AI-powered predictions, recommendations, and actionable insights"
    >

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
    </PortalSubPageLayout>
  )
}

