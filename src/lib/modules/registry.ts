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
  | 'Strategic'
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
  { id: 1, band: 'Finance & Controlling', name: 'Financial Accounting', route: '/api/wave3/coa', osPath: '/os/finance', intelligence: 'L2', reporting: 'Operational', status: 'live' },
  { id: 2, band: 'Finance & Controlling', name: 'Controlling', route: '/api/finance/controlling', intelligence: 'L3', reporting: 'Management', status: 'demo' },
  { id: 3, band: 'Finance & Controlling', name: 'Accounts Receivable', route: '/api/wave3/ar/aging', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 4, band: 'Finance & Controlling', name: 'Accounts Payable', route: '/api/wave3/ap/receipts', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 5, band: 'Finance & Controlling', name: 'Treasury & Risk', route: '/api/v2/treasury/accounts', osPath: '/os/treasury-banking', intelligence: 'L4', reporting: 'Executive', status: 'live' },
  { id: 6, band: 'Finance & Controlling', name: 'HPay Payments', route: '/api/wave5/payment-runs', osPath: '/os/payment-runs', intelligence: 'L4', reporting: 'Transaction', status: 'live' },
  { id: 7, band: 'Finance & Controlling', name: 'Financial Planning', route: '/api/wave4/budgets', osPath: '/os/budgets', intelligence: 'L4', reporting: 'Executive', status: 'live' },

  // Commercial & Sales (8-12)
  { id: 8, band: 'Commercial & Sales', name: 'CRM + Sales', route: '/api/wave3/crm/pipeline', osPath: '/os/pipeline', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 9, band: 'Commercial & Sales', name: 'CPQ Engine', route: '/api/wave5/quotes', osPath: '/os/cpq', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 10, band: 'Commercial & Sales', name: 'Sales & Distribution', route: '/api/wave4/channels', osPath: '/os/sales-distribution', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 11, band: 'Commercial & Sales', name: 'Marketing Automation', route: '/api/v2/marketing/email-campaigns', osPath: '/os/marketing', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 12, band: 'Commercial & Sales', name: 'Distributor Portal', route: '/api/distributor', intelligence: 'L2', reporting: 'Operational', status: 'live' },

  // Procurement & Sourcing (13-16)
  { id: 13, band: 'Procurement & Sourcing', name: 'Procurement', route: '/api/wave3/procurement/rfqs', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 14, band: 'Procurement & Sourcing', name: 'Vendor Management', route: '/api/wave3/vendors/scorecards', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 15, band: 'Procurement & Sourcing', name: 'Contract Lifecycle', route: '/api/wave5/contracts', osPath: '/os/contracts', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 16, band: 'Procurement & Sourcing', name: 'Sourcing Network', route: '/api/wave5/sourcing-suppliers', osPath: '/os/sourcing', intelligence: 'L3', reporting: 'Operational', status: 'live' },

  // Manufacturing (17-21)
  { id: 17, band: 'Manufacturing', name: 'Production Planning', route: '/api/v2/manufacturing/work-orders', osPath: '/os/manufacturing', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 18, band: 'Manufacturing', name: 'Shop Floor Control', route: '/api/wave5/shop-floor-ops', osPath: '/os/shop-floor', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 19, band: 'Manufacturing', name: 'Bill of Materials', route: '/api/wave4/boms', osPath: '/os/bom', intelligence: 'L2', reporting: 'Operational', status: 'live' },
  { id: 20, band: 'Manufacturing', name: 'Quality Management', route: '/api/v2/quality/checks', osPath: '/os/quality', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 21, band: 'Manufacturing', name: 'Recipe Management', route: '/api/wave4/recipes', osPath: '/os/recipes', intelligence: 'L2', reporting: 'Operational', status: 'live' },

  // Inventory & Warehouse (22-24)
  { id: 22, band: 'Inventory & Warehouse', name: 'Inventory Management', route: '/api/wave3/inventory/abc-analysis', osPath: '/os/inventory', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 23, band: 'Inventory & Warehouse', name: 'Warehouse Management', route: '/api/wave4/warehouses', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 24, band: 'Inventory & Warehouse', name: 'Demand Planning', route: '/api/wave4/demand/history', intelligence: 'L4', reporting: 'Strategic', status: 'live' },

  // Logistics & Trade (25-28)
  { id: 25, band: 'Logistics & Trade', name: 'Fleet Management', route: '/api/wave4/vehicles', osPath: '/os/fleet', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 26, band: 'Logistics & Trade', name: 'Shipping & Freight', route: '/api/wave3/shipping/shipments', osPath: '/os/shipping-trade', intelligence: 'L2', reporting: 'Operational', status: 'live' },
  { id: 27, band: 'Logistics & Trade', name: 'Trade & Customs', route: '/api/wave3/trade/hs-codes', osPath: '/os/import-export', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 28, band: 'Logistics & Trade', name: '3PL Integration', route: '/api/wave5/threepl-partners', osPath: '/os/threepl', intelligence: 'L2', reporting: 'Operational', status: 'live' },

  // Human Capital (29-33)
  { id: 29, band: 'Human Capital', name: 'HR Core & Payroll', route: '/api/wave3/hr/leave', osPath: '/os/hr', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 30, band: 'Human Capital', name: 'Talent Acquisition', route: '/api/wave5/postings', osPath: '/os/talent', intelligence: 'L3', reporting: 'Management', status: 'live' },
  { id: 31, band: 'Human Capital', name: 'Learning Management', route: '/api/wave5/courses', osPath: '/os/lms', intelligence: 'L2', reporting: 'Operational', status: 'live' },
  { id: 32, band: 'Human Capital', name: 'Performance & Succession', route: '/api/wave5/perf-reviews', osPath: '/os/performance', intelligence: 'L3', reporting: 'Management', status: 'live' },
  { id: 33, band: 'Human Capital', name: 'Workforce Planning', route: '/api/wave5/headcount-plans', osPath: '/os/workforce', intelligence: 'L3', reporting: 'Operational', status: 'live' },

  // Asset & Maintenance (34-36)
  { id: 34, band: 'Asset & Maintenance', name: 'Fixed Assets', route: '/api/v2/assets', osPath: '/os/inventory', intelligence: 'L2', reporting: 'Transaction', status: 'live' },
  { id: 35, band: 'Asset & Maintenance', name: 'Plant Maintenance', route: '/api/wave5/pm-orders', osPath: '/os/plant-maintenance', intelligence: 'L4', reporting: 'Management', status: 'live' },
  { id: 36, band: 'Asset & Maintenance', name: 'Real Estate & Facilities', route: '/api/wave5/properties', osPath: '/os/properties', intelligence: 'L2', reporting: 'Operational', status: 'live' },

  // GRC (37-40)
  { id: 37, band: 'GRC', name: 'GRC Core', route: '/api/t14/incidents', intelligence: 'L3', reporting: 'Management', status: 'live' },
  { id: 38, band: 'GRC', name: 'Internal Audit', route: '/api/v2/audit-events', osPath: '/os/legal', intelligence: 'L3', reporting: 'Management', status: 'live' },
  { id: 39, band: 'GRC', name: 'Legal & Compliance', route: '/api/v2/documents', osPath: '/os/legal', intelligence: 'L4', reporting: 'Executive', status: 'live' },
  { id: 40, band: 'GRC', name: 'Neural Governance', route: '/api/platform/governance/policies', intelligence: 'L5', reporting: 'Executive', status: 'live' },

  // Analytics & Intelligence (41-44)
  { id: 41, band: 'Analytics & Intelligence', name: 'BI & Reporting', route: '/api/wave5/reports', osPath: '/os/bi-reports', intelligence: 'L3', reporting: 'Management', status: 'live' },
  { id: 42, band: 'Analytics & Intelligence', name: 'Board Pack Generator', route: '/api/wave5/board-packs', osPath: '/os/board-pack', intelligence: 'L5', reporting: 'Executive', status: 'live' },
  { id: 43, band: 'Analytics & Intelligence', name: 'OKR Tracking', route: '/api/t14/okr', intelligence: 'L3', reporting: 'Management', status: 'live' },
  { id: 44, band: 'Analytics & Intelligence', name: 'AI Variance Commentary', route: '/api/wave5/variance-commentary', osPath: '/os/variance-ai', intelligence: 'L5', reporting: 'Executive', status: 'live' },

  // Projects & Services (45-47)
  { id: 45, band: 'Projects & Services', name: 'Project Management', route: '/api/v2/projects', osPath: '/os/project-management', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 46, band: 'Projects & Services', name: 'Service Management', route: '/api/wave5/service-tickets', osPath: '/os/service-tickets', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 47, band: 'Projects & Services', name: 'Professional Services', route: '/api/wave5/engagements', osPath: '/os/professional-services', intelligence: 'L3', reporting: 'Management', status: 'live' },

  // Platform & Infrastructure (48-54)
  { id: 48, band: 'Platform & Infrastructure', name: 'Tax Engine', route: '/api/platform/tax/rates', osPath: '/os/localization', intelligence: 'L2', reporting: 'Transaction', status: 'live' },
  { id: 49, band: 'Platform & Infrastructure', name: 'FX Engine', route: '/api/v2/treasury/fx-rates', osPath: '/os/treasury-banking', intelligence: 'L3', reporting: 'Operational', status: 'live' },
  { id: 50, band: 'Platform & Infrastructure', name: 'Audit Log', route: '/api/platform/audit/search', intelligence: 'L2', reporting: 'Management', status: 'live' },
  { id: 51, band: 'Platform & Infrastructure', name: 'Notifications', route: '/api/v2/notifications', osPath: '/os/executive', intelligence: 'L2', reporting: 'Operational', status: 'live' },
  { id: 52, band: 'Platform & Infrastructure', name: 'Document Vault', route: '/api/v2/documents', osPath: '/os/legal', intelligence: 'L2', reporting: 'Operational', status: 'live' },
  { id: 53, band: 'Platform & Infrastructure', name: 'Admin & Security', route: '/api/platform/admin/users', intelligence: 'L2', reporting: 'Management', status: 'live' },
  { id: 54, band: 'Platform & Infrastructure', name: 'Integration Bus', route: '/api/integration', intelligence: 'L2', reporting: 'Operational', status: 'demo' },

  // Data & AI (55-58)
  { id: 55, band: 'Data & AI', name: 'Data Ocean', route: '/api/data-ocean', intelligence: 'L5', reporting: 'Foundation', status: 'demo' },
  { id: 56, band: 'Data & AI', name: 'AI Engine', route: '/api/ai/models', intelligence: 'L5', reporting: 'Foundation', status: 'live' },
  { id: 57, band: 'Data & AI', name: 'Harvoice', route: '/api/ai/harvoice', intelligence: 'L5', reporting: 'Interactive', status: 'demo' },
  { id: 58, band: 'Data & AI', name: 'Globalisation', route: '/api/platform/locales', intelligence: 'L3', reporting: 'Foundation', status: 'live' },

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
