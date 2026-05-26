/**
 * HARVICS OS — CANONICAL MODULE REGISTRY
 * Single source of truth for all 71 modules across 14 architecture bands.
 *
 * Rules:
 * - Every module count, drill-down, and architecture explorer reads from here.
 * - Do NOT duplicate this list anywhere else. Import `MODULE_REGISTRY` instead.
 * - `TOTAL_MODULES` is derived; never hardcode a count in UI text — compose it.
 */

export type IntelligenceLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

export type ReportingType =
  | 'Transaction'
  | 'Operational'
  | 'Management'
  | 'Executive'
  | 'Foundation'
  | 'Interactive'
  | 'Social'
  | 'B2C'
  | 'B2B'
  | 'Field'
  | 'Gig'
  | 'Engagement'
  | 'Trading'
  | 'Wallet'
  | 'Program'

export type ModuleStatus = 'live' | 'demo' | 'stub' | 'planned'

export interface ModuleRegistryEntry {
  /** Stable numeric id, 1..71. Never reuse or renumber. */
  id: number
  /** Architecture band name. */
  band: string
  /** Human-readable module name. */
  name: string
  /** Canonical backend API route (or path prefix). */
  route: string
  /** Optional frontend OS page route, if a dedicated page exists. */
  osPath?: string
  /** Intelligence level L1..L5. */
  intelligence: IntelligenceLevel
  /** Reporting type / surface category. */
  reporting: ReportingType
  /** Backend implementation status. */
  status: ModuleStatus
}

export const MODULE_BANDS = [
  'Finance & Controlling',
  'Commercial & Sales',
  'Procurement & Sourcing',
  'Manufacturing',
  'Inventory & Warehouse',
  'Logistics & Trade',
  'Human Capital',
  'Asset & Maintenance',
  'GRC',
  'Analytics & Intelligence',
  'Projects & Services',
  'Platform & Infrastructure',
  'Data & AI',
  'HARVICS Universe',
  'Portals',
] as const

export type ModuleBand = (typeof MODULE_BANDS)[number]

export const MODULE_REGISTRY: readonly ModuleRegistryEntry[] = [
  // Finance & Controlling (1-7)
  { id: 1, band: 'Finance & Controlling', name: 'Financial Accounting', route: '/api/finance/gl', osPath: '/os/finance', intelligence: 'L2', reporting: 'Operational', status: 'demo' },
  { id: 2, band: 'Finance & Controlling', name: 'Controlling', route: '/api/finance/controlling', intelligence: 'L3', reporting: 'Management', status: 'demo' },
  { id: 3, band: 'Finance & Controlling', name: 'Accounts Receivable', route: '/api/finance/ar', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 4, band: 'Finance & Controlling', name: 'Accounts Payable', route: '/api/finance/ap', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 5, band: 'Finance & Controlling', name: 'Treasury & Risk', route: '/api/v2/treasury/accounts', osPath: '/os/treasury-banking', intelligence: 'L4', reporting: 'Executive', status: 'live' },
  { id: 6, band: 'Finance & Controlling', name: 'HPay Payments', route: '/api/finance/hpay', osPath: '/os/payments-digital-finance', intelligence: 'L4', reporting: 'Transaction', status: 'demo' },
  { id: 7, band: 'Finance & Controlling', name: 'Financial Planning', route: '/api/finance/planning', osPath: '/os/financial-planning-bi', intelligence: 'L4', reporting: 'Executive', status: 'demo' },

  // Commercial & Sales (8-12)
  { id: 8, band: 'Commercial & Sales', name: 'CRM + Sales', route: '/api/crm/sales', osPath: '/os/crm', intelligence: 'L4', reporting: 'Management', status: 'demo' },
  { id: 9, band: 'Commercial & Sales', name: 'CPQ Engine', route: '/api/crm/cpq', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 10, band: 'Commercial & Sales', name: 'Sales & Distribution', route: '/api/crm/sales-dist', osPath: '/os/orders', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 11, band: 'Commercial & Sales', name: 'Marketing Automation', route: '/api/v2/marketing/email-campaigns', osPath: '/os/marketing', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 12, band: 'Commercial & Sales', name: 'Distributor Portal', route: '/api/distributor', intelligence: 'L2', reporting: 'Operational', status: 'live' },

  // Procurement & Sourcing (13-16)
  { id: 13, band: 'Procurement & Sourcing', name: 'Procurement', route: '/api/procurement', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 14, band: 'Procurement & Sourcing', name: 'Vendor Management', route: '/api/procurement/vendors', intelligence: 'L4', reporting: 'Management', status: 'demo' },
  { id: 15, band: 'Procurement & Sourcing', name: 'Contract Lifecycle', route: '/api/procurement/contracts', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 16, band: 'Procurement & Sourcing', name: 'Sourcing Network', route: '/api/procurement/sourcing', intelligence: 'L3', reporting: 'Operational', status: 'demo' },

  // Manufacturing (17-21)
  { id: 17, band: 'Manufacturing', name: 'Production Planning', route: '/api/v2/manufacturing/work-orders', osPath: '/os/manufacturing', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 18, band: 'Manufacturing', name: 'Shop Floor Control', route: '/api/manufacturing/floor', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 19, band: 'Manufacturing', name: 'Bill of Materials', route: '/api/manufacturing/bom', intelligence: 'L2', reporting: 'Operational', status: 'demo' },
  { id: 20, band: 'Manufacturing', name: 'Quality Management', route: '/api/v2/quality/checks', osPath: '/os/quality', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 21, band: 'Manufacturing', name: 'Recipe Management', route: '/api/manufacturing/recipes', intelligence: 'L2', reporting: 'Operational', status: 'demo' },

  // Inventory & Warehouse (22-24)
  { id: 22, band: 'Inventory & Warehouse', name: 'Inventory Management', route: '/api/inventory', osPath: '/os/inventory', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 23, band: 'Inventory & Warehouse', name: 'Warehouse Management', route: '/api/warehouse', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 24, band: 'Inventory & Warehouse', name: 'Demand Planning', route: '/api/inventory/demand', intelligence: 'L4', reporting: 'Management', status: 'demo' },

  // Logistics & Trade (25-28)
  { id: 25, band: 'Logistics & Trade', name: 'Fleet Management', route: '/api/logistics/fleet', osPath: '/os/gps-tracking', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 26, band: 'Logistics & Trade', name: 'Shipping & Freight', route: '/api/logistics/shipping', osPath: '/os/shipping-trade', intelligence: 'L2', reporting: 'Operational', status: 'demo' },
  { id: 27, band: 'Logistics & Trade', name: 'Trade & Customs', route: '/api/logistics/trade', osPath: '/os/import-export', intelligence: 'L4', reporting: 'Management', status: 'demo' },
  { id: 28, band: 'Logistics & Trade', name: '3PL Integration', route: '/api/logistics/3pl', intelligence: 'L2', reporting: 'Operational', status: 'demo' },

  // Human Capital (29-33)
  { id: 29, band: 'Human Capital', name: 'HR Core & Payroll', route: '/api/hr/payroll', osPath: '/os/hr', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 30, band: 'Human Capital', name: 'Talent Acquisition', route: '/api/hr/recruitment', intelligence: 'L3', reporting: 'Management', status: 'demo' },
  { id: 31, band: 'Human Capital', name: 'Learning Management', route: '/api/hr/learning', intelligence: 'L2', reporting: 'Operational', status: 'demo' },
  { id: 32, band: 'Human Capital', name: 'Performance & Succession', route: '/api/hr/performance', intelligence: 'L3', reporting: 'Management', status: 'demo' },
  { id: 33, band: 'Human Capital', name: 'Workforce Planning', route: '/api/hr/workforce', intelligence: 'L3', reporting: 'Operational', status: 'demo' },

  // Asset & Maintenance (34-36)
  { id: 34, band: 'Asset & Maintenance', name: 'Fixed Assets', route: '/api/v2/assets', osPath: '/os/inventory', intelligence: 'L2', reporting: 'Transaction', status: 'live' },
  { id: 35, band: 'Asset & Maintenance', name: 'Plant Maintenance', route: '/api/maintenance', intelligence: 'L4', reporting: 'Management', status: 'demo' },
  { id: 36, band: 'Asset & Maintenance', name: 'Real Estate & Facilities', route: '/api/facilities', intelligence: 'L2', reporting: 'Operational', status: 'demo' },

  // GRC (37-40)
  { id: 37, band: 'GRC', name: 'GRC Core', route: '/api/grc', intelligence: 'L3', reporting: 'Management', status: 'demo' },
  { id: 38, band: 'GRC', name: 'Internal Audit', route: '/api/v2/audit-events', osPath: '/os/legal', intelligence: 'L3', reporting: 'Management', status: 'live' },
  { id: 39, band: 'GRC', name: 'Legal & Compliance', route: '/api/v2/documents', osPath: '/os/legal', intelligence: 'L4', reporting: 'Executive', status: 'live' },
  { id: 40, band: 'GRC', name: 'Neural Governance', route: '/api/governance', intelligence: 'L5', reporting: 'Executive', status: 'demo' },

  // Analytics & Intelligence (41-44)
  { id: 41, band: 'Analytics & Intelligence', name: 'BI & Reporting', route: '/api/bi', osPath: '/os/financial-planning-bi', intelligence: 'L3', reporting: 'Management', status: 'demo' },
  { id: 42, band: 'Analytics & Intelligence', name: 'Board Pack Generator', route: '/api/bi/board', osPath: '/os/executive', intelligence: 'L5', reporting: 'Executive', status: 'demo' },
  { id: 43, band: 'Analytics & Intelligence', name: 'OKR Tracking', route: '/api/bi/okr', intelligence: 'L3', reporting: 'Management', status: 'demo' },
  { id: 44, band: 'Analytics & Intelligence', name: 'AI Variance Commentary', route: '/api/ai/variance', intelligence: 'L5', reporting: 'Executive', status: 'demo' },

  // Projects & Services (45-47)
  { id: 45, band: 'Projects & Services', name: 'Project Management', route: '/api/v2/projects', osPath: '/os/project-management', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 46, band: 'Projects & Services', name: 'Service Management', route: '/api/services', intelligence: 'L3', reporting: 'Operational', status: 'demo' },
  { id: 47, band: 'Projects & Services', name: 'Professional Services', route: '/api/projects/psa', intelligence: 'L3', reporting: 'Management', status: 'demo' },

  // Platform & Infrastructure (48-54)
  { id: 48, band: 'Platform & Infrastructure', name: 'Tax Engine', route: '/api/platform/tax', osPath: '/os/localization', intelligence: 'L2', reporting: 'Transaction', status: 'demo' },
  { id: 49, band: 'Platform & Infrastructure', name: 'FX Engine', route: '/api/v2/treasury/fx-rates', osPath: '/os/treasury-banking', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 50, band: 'Platform & Infrastructure', name: 'Audit Log', route: '/api/audit-log', intelligence: 'L2', reporting: 'Management', status: 'demo' },
  { id: 51, band: 'Platform & Infrastructure', name: 'Notifications', route: '/api/v2/notifications', osPath: '/os/executive', intelligence: 'L2', reporting: 'Operational', status: 'live' },
  { id: 52, band: 'Platform & Infrastructure', name: 'Document Vault', route: '/api/v2/documents', osPath: '/os/legal', intelligence: 'L2', reporting: 'Operational', status: 'live' },
  { id: 53, band: 'Platform & Infrastructure', name: 'Admin & Security', route: '/api/admin', intelligence: 'L2', reporting: 'Management', status: 'demo' },
  { id: 54, band: 'Platform & Infrastructure', name: 'Integration Bus', route: '/api/integration', intelligence: 'L2', reporting: 'Operational', status: 'demo' },

  // Data & AI (55-58)
  { id: 55, band: 'Data & AI', name: 'Data Ocean', route: '/api/data-ocean', intelligence: 'L5', reporting: 'Foundation', status: 'demo' },
  { id: 56, band: 'Data & AI', name: 'AI Engine', route: '/api/ai/models', intelligence: 'L5', reporting: 'Foundation', status: 'live' },
  { id: 57, band: 'Data & AI', name: 'Harvoice', route: '/api/ai/harvoice', intelligence: 'L5', reporting: 'Interactive', status: 'demo' },
  { id: 58, band: 'Data & AI', name: 'Globalisation', route: '/api/ai/globalisation', intelligence: 'L3', reporting: 'Foundation', status: 'demo' },

  // HARVICS Universe (59-68)
  { id: 59, band: 'HARVICS Universe', name: 'FunFeed', route: '/api/universe/feed', intelligence: 'L2', reporting: 'Social', status: 'demo' },
  { id: 60, band: 'HARVICS Universe', name: 'Harvics Mall', route: '/api/universe/mall', intelligence: 'L2', reporting: 'B2C', status: 'demo' },
  { id: 61, band: 'HARVICS Universe', name: 'Trade Floor', route: '/api/universe/trade', intelligence: 'L3', reporting: 'B2C', status: 'demo' },
  { id: 62, band: 'HARVICS Universe', name: 'Playroom', route: '/api/universe/games', intelligence: 'L1', reporting: 'Engagement', status: 'demo' },
  { id: 63, band: 'HARVICS Universe', name: 'Experts Hub', route: '/api/universe/experts', intelligence: 'L2', reporting: 'Gig', status: 'demo' },
  { id: 64, band: 'HARVICS Universe', name: 'Jobs + Travel', route: '/api/universe/jobs', intelligence: 'L2', reporting: 'Gig', status: 'demo' },
  { id: 65, band: 'HARVICS Universe', name: 'Crypto Lite', route: '/api/universe/crypto', intelligence: 'L3', reporting: 'Trading', status: 'demo' },
  { id: 66, band: 'HARVICS Universe', name: 'Harvicoins', route: '/api/universe/harvicoins', intelligence: 'L2', reporting: 'Wallet', status: 'demo' },
  { id: 67, band: 'HARVICS Universe', name: 'HPay Wallet', route: '/api/universe/hpay', intelligence: 'L3', reporting: 'Wallet', status: 'demo' },
  { id: 68, band: 'HARVICS Universe', name: 'Circle Referral', route: '/api/universe/referral', intelligence: 'L2', reporting: 'Program', status: 'demo' },

  // Portals (69-71)
  { id: 69, band: 'Portals', name: 'Customer Portal', route: '/api/portals/customer', intelligence: 'L1', reporting: 'B2C', status: 'demo' },
  { id: 70, band: 'Portals', name: 'Vendor Portal', route: '/api/portals/vendor', intelligence: 'L2', reporting: 'B2B', status: 'demo' },
  { id: 71, band: 'Portals', name: 'Field Officer Portal', route: '/api/portals/field', intelligence: 'L2', reporting: 'Field', status: 'demo' },
] as const

/** Total modules — DERIVED, never hardcode anywhere. */
export const TOTAL_MODULES = MODULE_REGISTRY.length

/** Total bands — DERIVED. */
export const TOTAL_BANDS = MODULE_BANDS.length

/** Group modules by band — for ModuleArchitectureExplorer and similar surfaces. */
export const MODULES_BY_BAND: Record<ModuleBand, ModuleRegistryEntry[]> =
  MODULE_BANDS.reduce((acc, band) => {
    acc[band] = MODULE_REGISTRY.filter((m) => m.band === band)
    return acc
  }, {} as Record<ModuleBand, ModuleRegistryEntry[]>)

/** Count modules by implementation status — drives readiness KPIs. */
export function countByStatus(status: ModuleStatus): number {
  return MODULE_REGISTRY.filter((m) => m.status === status).length
}

/** Lookup by id (1..71). */
export function getModuleById(id: number): ModuleRegistryEntry | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id)
}

// Build-time sanity guards (run when this module is imported).
if (TOTAL_MODULES !== 71) {
  // eslint-disable-next-line no-console
  console.error(
    `[HARVICS] MODULE_REGISTRY drift: expected 71 modules, found ${TOTAL_MODULES}`,
  )
}
const _idSet = new Set(MODULE_REGISTRY.map((m) => m.id))
if (_idSet.size !== MODULE_REGISTRY.length) {
  // eslint-disable-next-line no-console
  console.error('[HARVICS] MODULE_REGISTRY contains duplicate module ids')
}
