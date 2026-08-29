'use client'

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import GeminiCopilot from '@/components/ai/GeminiCopilot'

const TITLE_MAP: Record<string, string> = {
  crm: 'Smart CRM',
  pipeline: 'Deal Pipeline',
  finance: 'Finance',
  inventory: 'Inventory',
  logistics: 'Logistics',
  hr: 'HR & People',
  executive: 'Executive',
  legal: 'Legal & IPR',
  'gps-tracking': 'GPS Tracking',
  'competitor-intel': 'Competitor Intel',
  competitor: 'Competitor Intel',
  'import-export': 'Import / Export',
  'market-distribution': 'Market & Distribution',
  'supplier-procurement': 'Procurement',
  procurement: 'Procurement',
  'orders-sales': 'Orders & Sales',
  catalog: 'Module Catalog',
  module: 'Module',
  governance: 'Neural Governance',
  'data-ocean': 'Data Ocean',
  identity: 'Identity',
  localization: 'Localization',
  workflows: 'Workflows',
  tier0: 'Tier 0 Engine',
  manufacturing: 'Manufacturing',
  quality: 'Quality',
  marketing: 'Marketing',
  'investor-relations': 'Investor Relations',
  'treasury-banking': 'Treasury',
  'shipping-trade': 'Shipping & Trade',
  'payments-digital-finance': 'Digital Finance',
  'financial-planning-bi': 'Financial Planning',
  'project-management': 'Projects',
  'bi-reports': 'BI & Reporting',
  'board-pack': 'Board Pack',
  'service-tickets': 'Service Tickets',
  'professional-services': 'Professional Services',
  'integration-bus': 'Integration Bus',
  portals: 'Portals',
  'variance-ai': 'Variance AI',
  harvoice: 'Harvoice',
  'data-ocean': 'Data Ocean',
  feed: 'Universe Feed',
  marketplace: 'Marketplace',
  'trade-floor': 'Trade Floor',
  events: 'Events',
  mentorship: 'Mentorship',
  'job-board': 'Job Board',
  crypto: 'Crypto Lite',
  wallet: 'Wallets',
  referrals: 'Referrals',
  okr: 'OKR Tracking',
  'audit-log': 'Audit Log',
  'admin-users': 'Admin & Security',
  locales: 'Globalisation',
  'tax-engine': 'Tax Engine',
  'fx-engine': 'FX Engine',
  notifications: 'Notifications',
  'document-vault': 'Document Vault',
  'ai-engine': 'AI Engine',
}

function titleFromPath(pathname: string | null, locale: string): { title: string; domain?: string } {
  if (!pathname) return { title: 'Harvics OS' }
  const parts = pathname.split('/').filter(Boolean)
  // [locale, os, ...]
  const osIdx = parts.indexOf('os')
  if (osIdx < 0) return { title: 'Harvics OS' }
  const slug = parts[osIdx + 1]
  if (!slug) return { title: 'Command Center', domain: 'overview' }
  const title =
    TITLE_MAP[slug] ||
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  let domain = slug
  if (slug === 'crm' || slug === 'pipeline') domain = 'crm'
  if (slug === 'competitor-intel') domain = 'competitor'
  if (slug === 'supplier-procurement' || slug === 'procurement') domain = 'procurement'
  if (slug === 'catalog' || slug === 'module') domain = 'modules'
  if (slug === 'bi-reports') domain = 'bi'
  if (slug === 'board-pack') domain = 'board'
  if (slug === 'project-management') domain = 'projects'
  if (slug === 'service-tickets') domain = 'tickets'
  if (slug === 'integration-bus') domain = 'bus'
  if (slug === 'feed') domain = 'universe-feed'
  return { title, domain }
}

/**
 * Single OS chrome for every /[locale]/os/* route.
 * Keeps burgundy/cream HarvicsOSShell — no second sidebar systems.
 */
export default function OsAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const locale = useLocale()
  const { title, domain } = useMemo(() => titleFromPath(pathname, locale), [pathname, locale])

  // Marketing landing at /os root keeps its own full-bleed composition (no double chrome)
  const parts = (pathname || '').split('/').filter(Boolean)
  const isOsRoot = parts.length === 2 && parts[0] === locale && parts[1] === 'os'

  if (isOsRoot) {
    return <>{children}</>
  }

  return (
    <HarvicsOSShell title={title} activeDomain={domain} portal="company" showAIShortcut>
      {children}
      <GeminiCopilot />
    </HarvicsOSShell>
  )
}
