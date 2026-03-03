'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import PLOverviewContent from '@/components/domains/executive/PLOverviewContent'
import AlertDashboardContent from '@/components/domains/executive/AlertDashboardContent'
import RiskAlertsContent from '@/components/domains/executive/RiskAlertsContent'

interface ExecutiveDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function ExecutiveDomainContent({ persona, locale }: ExecutiveDomainContentProps) {
  // Tier 2 Modules for Executive Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'p-l-control',
      label: 'P&L Control Tower',
      icon: '📊',
      description: 'Company-wide profit & loss tracking and margin control',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              📊 P&L Control Tower
            </h3>
            <p className="text-black">Company-wide profit & loss tracking and margin control</p>
          </div>
        </div>
      ),
      tier3Screens: [
        {
          id: 'pl-overview',
          label: 'P&L Overview',
          icon: '📊',
          component: <PLOverviewContent persona={persona} locale={locale} />
        },
        {
          id: 'kpis',
          label: 'KPIs',
          icon: '🎯',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Key Performance Indicators</h3><p>Executive-level KPIs and metrics</p></div>
        },
        {
          id: 'market-share',
          label: 'Market Share',
          icon: '📈',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Market Share</h3><p>Market share analysis and trends</p></div>
        }
      ]
    },
    {
      id: 'executive-alerts',
      label: 'AI Alerts & Exceptions',
      icon: '🔔',
      description: 'Executive-level AI alerts for critical exceptions and anomalies',
      tier3Screens: [
        {
          id: 'alert-dashboard',
          label: 'Alert Dashboard',
          icon: '🚨',
          component: <AlertDashboardContent persona={persona} locale={locale} />
        },
        {
          id: 'exception-tracking',
          label: 'Exception Tracking',
          icon: '⚠️',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Exception Tracking</h3><p>Track and resolve business exceptions</p></div>
        },
        {
          id: 'alert-history',
          label: 'Alert History',
          icon: '📜',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Alert History</h3><p>Historical alerts and resolution status</p></div>
        }
      ]
    },
    {
      id: 'risk-detection',
      label: 'Risk & Fraud Detection',
      icon: '🛡️',
      description: 'Compliance monitoring, fraud detection, and risk assessment',
      tier3Screens: [
        {
          id: 'risk-alerts',
          label: 'Risk Alerts',
          icon: '🛡️',
          component: <RiskAlertsContent persona={persona} locale={locale} />
        },
        {
          id: 'compliance',
          label: 'Compliance',
          icon: '✅',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Compliance Monitoring</h3><p>Regulatory compliance tracking and reports</p></div>
        },
        {
          id: 'risk-reports',
          label: 'Risk Reports',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Risk Reports</h3><p>Risk assessment and fraud detection reports</p></div>
        }
      ]
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="executive"
      domainName="Executive Control Tower"
      tier2Modules={tier2Modules}
      defaultModule="p-l-control"
    />
  )
}

