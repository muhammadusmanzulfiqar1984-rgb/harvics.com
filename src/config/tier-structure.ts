/**
 * Unified Tier Structure Configuration
 * 
 * Defines the complete tier hierarchy for the Harvics Operating System:
 * - TIER 0: Foundational Engines (infrastructure)
 * - TIER 1: OS Domains (business domains)
 * - TIER 2: Modules (within domains)
 * - TIER 3: Screens/KPI Screens (within modules)
 * - TIER 4: Actions (within screens)
 * 
 * This unifies all systems: OS CRM, V16, Enterprise CRM, etc.
 */

export type TierLevel = '0' | '1' | '2' | '3' | '4'

export interface Tier0Engine {
  id: string
  label: string
  description: string
  icon: string
  path: string
  color: string
  accessControl?: {
    roles?: string[]
    permissions?: string[]
  }
}

export interface Tier1Domain {
  id: string
  label: string
  description: string
  icon: string
  path: string
  color: string
  category: 'core' | 'enterprise' | 'specialized'
  accessControl?: {
    roles?: string[]
    permissions?: string[]
    requiresTier?: TierLevel[]
    requiresSubscription?: string[]
    requiresFeature?: string[]
  }
}

export interface TierAccessControl {
  roles?: string[]
  permissions?: string[]
  requiresSubscription?: string[]
  requiresFeature?: string[]
}

// TIER 0: Foundational Engines
export const TIER_0_ENGINES: Tier0Engine[] = [
  {
    id: 'identity',
    label: 'Identity & Access',
    description: 'User authentication, authorization, and access management',
    icon: '🔐',
    path: '/os/identity',
    color: 'purple',
    accessControl: {
      roles: ['super_admin', 'company_admin']
    }
  },
  {
    id: 'localization',
    label: 'Localization',
    description: 'Multi-language, multi-currency, and regional localization engine',
    icon: '🌍',
    path: '/os/localization',
    color: 'purple',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager']
    }
  },
  {
    id: 'geo',
    label: 'Geo Engine',
    description: 'GPS tracking, territory management, and geographic intelligence',
    icon: '📍',
    path: '/os/geo',
    color: 'purple',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager']
    }
  }
]

// TIER 1: OS Domains
export const TIER_1_DOMAINS: Tier1Domain[] = [
  // Core Domains (Available to all)
  {
    id: 'orders-sales',
    label: 'Orders / Sales',
    description: 'Order management and sales tracking',
    icon: '📋',
    path: '/os/orders-sales',
    color: 'blue',
    category: 'core',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager', 'distributor', 'supplier', 'sales_officer']
    }
  },
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'Stock management and warehouse operations',
    icon: '📦',
    path: '/os/inventory',
    color: 'blue',
    category: 'core',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager', 'distributor', 'supplier']
    }
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Financial management, accounting, and payments',
    icon: '💰',
    path: '/os/finance',
    color: 'blue',
    category: 'core',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager', 'distributor', 'supplier']
    }
  },
  {
    id: 'crm',
    label: 'CRM',
    description: 'Customer relationship management',
    icon: '👥',
    path: '/os/crm',
    color: 'blue',
    category: 'core',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager', 'distributor', 'sales_officer']
    }
  },
  {
    id: 'logistics',
    label: 'Logistics',
    description: 'Fleet management, route optimization, and delivery tracking',
    icon: '🚚',
    path: '/os/logistics',
    color: 'blue',
    category: 'core',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager', 'distributor']
    }
  },
  
  // Enterprise Domains (Premium access)
  {
    id: 'market-distribution',
    label: 'Market & Distribution',
    description: 'Distributor management, territories, and pricing',
    icon: '📦',
    path: '/os/market-distribution',
    color: 'emerald',
    category: 'enterprise',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager'],
      requiresSubscription: ['enterprise']
    }
  },
  {
    id: 'supplier-procurement',
    label: 'Supplier & Procurement',
    description: 'Supplier management, RFQ, GRN, and performance tracking',
    icon: '🏭',
    path: '/os/supplier-procurement',
    color: 'emerald',
    category: 'enterprise',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'supplier'],
      requiresSubscription: ['enterprise']
    }
  },
  
  // Specialized Domains
  {
    id: 'hr',
    label: 'HR & Talent',
    description: 'Human resources and employee management',
    icon: '👔',
    path: '/os/hr',
    color: 'indigo',
    category: 'specialized',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager']
    }
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'Executive dashboard and P&L tracking',
    icon: '🎯',
    path: '/os/executive',
    color: 'amber',
    category: 'specialized',
    accessControl: {
      roles: ['super_admin', 'company_admin']
    }
  },
  {
    id: 'legal',
    label: 'Legal / IPR',
    description: 'Legal operations, IPR, contracts, and compliance',
    icon: '⚖️',
    path: '/os/legal',
    color: 'red',
    category: 'specialized',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager']
    }
  },
  {
    id: 'import-export',
    label: 'Import / Export',
    description: 'Trade operations, customs, and documentation',
    icon: '🌐',
    path: '/os/import-export',
    color: 'teal',
    category: 'specialized',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager']
    }
  },
  {
    id: 'competitor',
    label: 'Competitor Intel',
    description: 'Competitor intelligence and market analysis',
    icon: '🔍',
    path: '/os/competitor-intel',
    color: 'orange',
    category: 'specialized',
    accessControl: {
      roles: ['super_admin', 'company_admin', 'country_manager']
    }
  }
]

// System Mapping: Map legacy systems to unified tier structure
export const SYSTEM_TO_TIER_MAP: Record<string, {
  tier: TierLevel
  domainId?: string
  moduleId?: string
  description: string
}> = {
  'OS_CRM': {
    tier: '1',
    domainId: 'crm',
    description: 'Operating System CRM - Tier 1 Domain'
  },
  // Note: V16 was a legacy system reference - removed as it was never implemented
  // All functionality is now covered by the unified Tier 1-4 structure
  'CRM_ENTERPRISE': {
    tier: '1',
    domainId: 'crm',
    description: 'Enterprise CRM - Tier 1 Domain with enterprise features'
  },
  'ENTERPRISE': {
    tier: '1',
    description: 'Enterprise tier - Access to enterprise domains'
  }
}

/**
 * Check if user has access to a tier level
 */
export function hasTierAccess(
  tier: TierLevel,
  userRole?: string,
  userPermissions?: string[],
  domainId?: string
): boolean {
  // Super admin has access to everything
  if (userRole === 'super_admin') {
    return true
  }

  if (tier === '0') {
    // Check TIER 0 access
    const engine = TIER_0_ENGINES.find(e => domainId ? e.id === domainId : true)
    if (engine?.accessControl?.roles) {
      return engine.accessControl.roles.includes(userRole || '')
    }
    return false
  }

  if (tier === '1') {
    // Check TIER 1 access
    const domain = TIER_1_DOMAINS.find(d => d.id === domainId)
    if (domain?.accessControl?.roles) {
      return domain.accessControl.roles.includes(userRole || '')
    }
    return false
  }

  // Tier 2, 3, 4 inherit from parent domain
  return true
}

/**
 * Get available domains for a user role
 */
export function getAvailableDomainsForRole(role?: string): Tier1Domain[] {
  if (role === 'super_admin') {
    return TIER_1_DOMAINS
  }

  return TIER_1_DOMAINS.filter(domain => {
    if (!domain.accessControl?.roles) {
      return true // No restrictions
    }
    return domain.accessControl.roles.includes(role || '')
  })
}

/**
 * Get available engines for a user role
 */
export function getAvailableEnginesForRole(role?: string): Tier0Engine[] {
  if (role === 'super_admin') {
    return TIER_0_ENGINES
  }

  return TIER_0_ENGINES.filter(engine => {
    if (!engine.accessControl?.roles) {
      return true
    }
    return engine.accessControl.roles.includes(role || '')
  })
}

/**
 * Check if domain requires enterprise subscription
 */
export function requiresEnterprise(domainId: string): boolean {
  const domain = TIER_1_DOMAINS.find(d => d.id === domainId)
  return domain?.category === 'enterprise' || false
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: TierLevel): string {
  const colorMap: Record<TierLevel, string> = {
    '0': 'purple',
    '1': 'blue',
    '2': 'green',
    '3': 'yellow',
    '4': 'orange'
  }
  return colorMap[tier]
}

/**
 * Get tier label
 */
export function getTierLabel(tier: TierLevel): string {
  const labelMap: Record<TierLevel, string> = {
    '0': 'Foundational Engines',
    '1': 'OS Domains',
    '2': 'Modules',
    '3': 'Screens',
    '4': 'Actions'
  }
  return labelMap[tier]
}

