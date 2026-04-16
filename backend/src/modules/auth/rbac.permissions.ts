/**
 * HARVICS OS — RBAC Permission Matrix
 * Domain 16 — Admin & Security
 *
 * Defines exactly what each role can do on each resource.
 * Every route checks this before executing.
 *
 * Actions:  read | create | update | delete | approve | export | admin
 * Resources: all 20 domains + system-level resources
 */

export type RBACAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'export'
  | 'admin';

export type RBACResource =
  | 'finance'
  | 'inventory'
  | 'procurement'
  | 'crm'
  | 'hr'
  | 'logistics'
  | 'orders'
  | 'trade'
  | 'intelligence'
  | 'dataOcean'
  | 'gps'
  | 'satellite'
  | 'ai'
  | 'bff'
  | 'domains'
  | 'services'
  | 'users'
  | 'auditLog'
  | 'system'
  | 'payments';

// Matrix: role → resource → allowed actions
const PERMISSION_MATRIX: Record<string, Record<RBACResource, RBACAction[]>> = {

  // ── COMPANY (Super Admin) — full access to everything ──
  company: {
    finance:      ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    inventory:    ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    procurement:  ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    crm:          ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    hr:           ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    logistics:    ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    orders:       ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    trade:        ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    intelligence: ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    dataOcean:    ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    gps:          ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    satellite:    ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    ai:           ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    bff:          ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    domains:      ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    services:     ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    users:        ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    auditLog:     ['read', 'export', 'admin'],
    system:       ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
    payments:     ['read', 'create', 'update', 'delete', 'approve', 'export', 'admin'],
  },

  // ── HQ — all operations, no user/system admin ──
  hq: {
    finance:      ['read', 'create', 'update', 'delete', 'approve', 'export'],
    inventory:    ['read', 'create', 'update', 'delete', 'approve', 'export'],
    procurement:  ['read', 'create', 'update', 'delete', 'approve', 'export'],
    crm:          ['read', 'create', 'update', 'delete', 'approve', 'export'],
    hr:           ['read', 'create', 'update', 'delete', 'approve', 'export'],
    logistics:    ['read', 'create', 'update', 'delete', 'approve', 'export'],
    orders:       ['read', 'create', 'update', 'delete', 'approve', 'export'],
    trade:        ['read', 'create', 'update', 'delete', 'approve', 'export'],
    intelligence: ['read', 'export'],
    dataOcean:    ['read', 'export'],
    gps:          ['read', 'create', 'update'],
    satellite:    ['read'],
    ai:           ['read', 'create'],
    bff:          ['read', 'create', 'update'],
    domains:      ['read', 'create', 'update'],
    services:     ['read', 'create', 'update'],
    users:        ['read'],
    auditLog:     ['read', 'export'],
    system:       ['read'],
    payments:     ['read', 'create', 'update', 'approve', 'export'],
  },

  // ── COUNTRY_MANAGER — full ops within their country, no HR admin, no finance delete ──
  country_manager: {
    finance:      ['read', 'create', 'update', 'approve', 'export'],
    inventory:    ['read', 'create', 'update', 'delete', 'approve', 'export'],
    procurement:  ['read', 'create', 'update', 'approve', 'export'],
    crm:          ['read', 'create', 'update', 'delete', 'export'],
    hr:           ['read', 'create', 'update'],
    logistics:    ['read', 'create', 'update', 'delete'],
    orders:       ['read', 'create', 'update', 'approve', 'export'],
    trade:        ['read', 'create', 'update', 'export'],
    intelligence: ['read'],
    dataOcean:    ['read'],
    gps:          ['read', 'create', 'update'],
    satellite:    ['read'],
    ai:           ['read', 'create'],
    bff:          ['read', 'create', 'update'],
    domains:      ['read'],
    services:     ['read', 'create'],
    users:        [],
    auditLog:     ['read'],
    system:       ['read'],
    payments:     ['read', 'create', 'update', 'approve'],
  },

  // ── SALES_OFFICER — create & manage own leads, orders, CRM only ──
  sales_officer: {
    finance:      ['read'],
    inventory:    ['read'],
    procurement:  ['read'],
    crm:          ['read', 'create', 'update'],
    hr:           [],
    logistics:    ['read'],
    orders:       ['read', 'create', 'update'],
    trade:        ['read'],
    intelligence: ['read'],
    dataOcean:    ['read'],
    gps:          ['read', 'create'],
    satellite:    [],
    ai:           ['read', 'create'],
    bff:          ['read'],
    domains:      ['read'],
    services:     ['read'],
    users:        [],
    auditLog:     [],
    system:       [],
    payments:     ['read'],
  },

  // ── DISTRIBUTOR — read orders/inventory in their territory, create GRN ──
  distributor: {
    finance:      ['read'],
    inventory:    ['read', 'create', 'update'],
    procurement:  ['read', 'create'],
    crm:          ['read'],
    hr:           [],
    logistics:    ['read', 'create', 'update'],
    orders:       ['read', 'create'],
    trade:        ['read'],
    intelligence: [],
    dataOcean:    [],
    gps:          ['read', 'create'],
    satellite:    [],
    ai:           [],
    bff:          ['read'],
    domains:      ['read'],
    services:     ['read'],
    users:        [],
    auditLog:     [],
    system:       [],
    payments:     ['read'],
  },

  // ── SUPPLIER — read POs addressed to them, submit quotes, see their payments ──
  supplier: {
    finance:      [],
    inventory:    [],
    procurement:  ['read', 'create'],
    crm:          [],
    hr:           [],
    logistics:    ['read'],
    orders:       [],
    trade:        ['read'],
    intelligence: [],
    dataOcean:    [],
    gps:          [],
    satellite:    [],
    ai:           [],
    bff:          ['read'],
    domains:      [],
    services:     [],
    users:        [],
    auditLog:     [],
    system:       [],
    payments:     ['read'],
  },
};

/**
 * Check if a role has permission to perform an action on a resource.
 */
export function hasPermission(
  role: string,
  resource: RBACResource,
  action: RBACAction
): boolean {
  const rolePerms = PERMISSION_MATRIX[role];
  if (!rolePerms) return false;
  const resourcePerms = rolePerms[resource];
  if (!resourcePerms) return false;
  return resourcePerms.includes(action);
}

/**
 * Get all allowed actions for a role on a resource.
 */
export function getAllowedActions(role: string, resource: RBACResource): RBACAction[] {
  return PERMISSION_MATRIX[role]?.[resource] ?? [];
}
