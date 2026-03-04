'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import { DomainItem } from '@/components/shared/DomainGrid'
import DomainGrid from '@/components/shared/DomainGrid'

export default function Tier0Client() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  // Tier 0 Engines
  const tier0Engines: DomainItem[] = [
    {
      id: 'identity',
      label: 'Identity & Access Engine',
      description: 'Users, roles, permissions and SSO integration across all portals.',
      href: '/os/identity',
      icon: '🔐',
      meta: '420 users • 38 roles'
    },
    {
      id: 'localization',
      label: 'Localization Engine',
      description: 'Region → Country → City → District → Area → Location, languages & tax rules.',
      href: '/os/localization',
      icon: '🌍',
      meta: '38 languages • 45 countries'
    },
    {
      id: 'geo',
      label: 'Geo Engine',
      description: 'Territory maps, routes, outlets, heatmaps and white-space tiles.',
      href: '/os/geo',
      icon: '📍',
      meta: '1,250 routes • 89,000 outlets'
    }
  ]

  // Data Ocean Platforms
  const dataOceans: DomainItem[] = [
    {
      id: 'operational',
      label: 'Operational Data Ocean',
      description: 'Real-time transactional data from all OS domains.',
      href: '/os/data-ocean/operational',
      icon: '📊',
      meta: 'Live data streams'
    },
    {
      id: 'analytical',
      label: 'Analytical Data Ocean',
      description: 'Aggregated data warehouse for reporting and analytics.',
      href: '/os/data-ocean/analytical',
      icon: '📈',
      meta: 'Historical analytics'
    },
    {
      id: 'vector',
      label: 'Vector Data Ocean',
      description: 'AI embeddings and semantic search data for copilot intelligence.',
      href: '/os/data-ocean/vector',
      icon: '🧠',
      meta: 'AI context storage'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Total Users"
          value="2,345"
          icon="👥"
        />
        <KPICard
          label="Languages Supported"
          value="38"
          icon="🌍"
        />
        <KPICard
          label="Active Routes"
          value="1,250"
          icon="📍"
        />
        <KPICard
          label="Data Sources"
          value="12"
          icon="📊"
        />
      </div>

      {/* Foundational Engines */}
      <SectionCard
        title="Foundational Engines"
        subtitle="Core infrastructure services that all OS domains depend on"
      >
        <DomainGrid domains={tier0Engines} columns={3} />
      </SectionCard>

      {/* Data Ocean Platform */}
      <SectionCard
        title="Data Ocean Platform"
        subtitle="Unified data layer connecting all OS domains and powering AI insights"
      >
        <div className="mb-4 p-4 bg-[#F2F2F2] border border-black200">
          <p className="text-sm text-black">
            The Data Ocean Platform aggregates data from all OS domains into three specialized oceans:
          </p>
        </div>
        <DomainGrid domains={dataOceans} columns={3} />
      </SectionCard>

      {/* AI Foundation Engine */}
      <SectionCard
        title="AI Foundation Engine"
        subtitle="Core AI services powering recommendations, predictions, and automation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-black200 bg-white">
            <h4 className="font-semibold text-black mb-2">🤖 AI Copilot Core</h4>
            <p className="text-sm text-black mb-2">Natural language processing and conversation orchestration</p>
            <ul className="text-xs text-black space-y-1 list-disc list-inside">
              <li>Intent detection</li>
              <li>Action execution</li>
              <li>Context management</li>
            </ul>
          </div>
          <div className="p-4 border border-black200 bg-white">
            <h4 className="font-semibold text-black mb-2">📊 Recommendation Engine</h4>
            <p className="text-sm text-black mb-2">AI-powered suggestions for orders, inventory, pricing, and routing</p>
            <ul className="text-xs text-black space-y-1 list-disc list-inside">
              <li>Sales forecasting</li>
              <li>Upsell recommendations</li>
              <li>Route optimization</li>
            </ul>
          </div>
          <div className="p-4 border border-black200 bg-white">
            <h4 className="font-semibold text-black mb-2">🔀 Decision Graph</h4>
            <p className="text-sm text-black mb-2">Multi-factor decision flows with human override capabilities</p>
            <ul className="text-xs text-black space-y-1 list-disc list-inside">
              <li>Autonomous pricing decisions</li>
              <li>Promotion planning</li>
              <li>Stock allocation</li>
            </ul>
          </div>
          <div className="p-4 border border-black200 bg-white">
            <h4 className="font-semibold text-black mb-2">🌐 Geo-AI Model</h4>
            <p className="text-sm text-black mb-2">Location intelligence and territory optimization</p>
            <ul className="text-xs text-black space-y-1 list-disc list-inside">
              <li>Territory coverage analysis</li>
              <li>White-space identification</li>
              <li>Route efficiency scoring</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Integration / API Layer */}
      <SectionCard
        title="Integration / API Layer"
        subtitle="RESTful APIs, webhooks, and external system integrations"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-black200 bg-white">
            <h4 className="font-semibold text-black mb-2">🔌 REST APIs</h4>
            <p className="text-sm text-black">Standard REST endpoints for all OS domains</p>
          </div>
          <div className="p-4 border border-black200 bg-white">
            <h4 className="font-semibold text-black mb-2">🔔 Webhooks</h4>
            <p className="text-sm text-black">Real-time event notifications and triggers</p>
          </div>
          <div className="p-4 border border-black200 bg-white">
            <h4 className="font-semibold text-black mb-2">🔗 External Integrations</h4>
            <p className="text-sm text-black">ERP, payment gateways, shipping providers</p>
          </div>
        </div>
      </SectionCard>

      {/* Workflow Engine */}
      <SectionCard
        title="Workflow Engine"
        subtitle="Business process automation and orchestration"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-black200 bg-white">
            <h4 className="font-semibold text-black mb-2">⚙️ BPMN Orchestration</h4>
            <p className="text-sm text-black">Standard workflow definitions and execution</p>
          </div>
          <div className="p-4 border border-black200 bg-white">
            <h4 className="font-semibold text-black mb-2">📋 Rules Engine</h4>
            <p className="text-sm text-black">Business rules for discounts, credit, approvals</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

