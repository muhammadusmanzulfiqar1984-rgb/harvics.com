import React from 'react'
import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import { DomainItem } from '@/components/shared/DomainGrid'
import DomainGrid from '@/components/shared/DomainGrid'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import Tier0Client from './Tier0Client'

// Generate static params for ALL supported locales (38 languages)
export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function Tier0DetailPage() {
  const locale = await getLocale()
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
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
    <OSDomainPageWrapper
      title="Tier 0 – Foundational Engines"
      description="The foundational infrastructure layer that powers all OS domains - Identity, Localization, Geo, Data Oceans, AI Foundation, and Integration layers"
      domain="tier0"
      portal={pathname?.includes('/portal/distributor') ? 'distributor' :
              pathname?.includes('/portal/supplier') ? 'supplier' : 'company'}
    >
      <Tier0Client />
    </OSDomainPageWrapper>
  )
}
