'use client'

import SectionCard from '@/components/shared/SectionCard'
import AIInsightsPanel from '@/components/shared/AIInsightsPanel'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function DistributorAIPage() {
  return (
    <PortalSubPageLayout
      portal="distributor"
      allowedRoles={['distributor', 'sales_officer']}
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
                  title: 'Order Forecast',
                  description: 'Orders expected to increase 15% next month based on seasonal patterns and current trends.',
                  priority: 'high',
                  confidence: 85
                },
                {
                  id: '2',
                  type: 'risk',
                  title: 'Low Stock Alert',
                  description: '5 SKUs approaching reorder point. Recommend ordering within 7 days.',
                  priority: 'high'
                },
                {
                  id: '3',
                  type: 'opportunity',
                  title: 'Retailer Expansion',
                  description: 'Opportunity to add 3 new retailers in underserved territory.',
                  priority: 'medium'
                }
              ]}
            />
          </SectionCard>
    </PortalSubPageLayout>
  )
}

