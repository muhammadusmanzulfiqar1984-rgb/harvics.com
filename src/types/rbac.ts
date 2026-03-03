/**
 * RBAC (Role-Based Access Control) Definitions
 * 
 * ROLE_SET defines all available roles in the system.
 * Route middleware uses these roles to restrict access.
 * 
 * Rules:
 * - NEVER show modules not permitted for the role
 * - Portals must be strictly separated (no mixing staff UI in distributor portal)
 */

export const ROLE_SET = {
  ADMIN: 'admin',
  STAFF: 'staff',
  DISTRIBUTOR: 'distributor',
  SUPPLIER: 'supplier',
  HR: 'hr_manager',
  FINANCE: 'finance_manager',
  EXECUTIVE: 'executive',
  SALES_MANAGER: 'sales_manager',
  OPERATIONS_MANAGER: 'operations_manager',
  MARKETING_MANAGER: 'marketing_manager',
  LEGAL_ADMIN: 'legal_admin',
  COMPANY_ADMIN: 'company_admin',
  SALES_OFFICER: 'sales_officer',
  COUNTRY_MANAGER: 'country_manager',
  HQ: 'hq',
  SUPER_ADMIN: 'super_admin'
} as const

export type Role = typeof ROLE_SET[keyof typeof ROLE_SET]

// Module permissions by role
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [ROLE_SET.SUPER_ADMIN]: ['*'], // All access
  [ROLE_SET.ADMIN]: ['*'], // All access
  
  [ROLE_SET.DISTRIBUTOR]: [
    'portal:distributor',
    'orders:view',
    'orders:create',
    'orders:update',
    'inventory:view',
    'inventory:update',
    'logistics:view',
    'finance:view',
    'finance:invoices',
    'crm:view',
    'crm:leads',
    'crm:activities'
  ],
  
  [ROLE_SET.SUPPLIER]: [
    'portal:supplier',
    'orders:view',
    'inventory:view',
    'inventory:create',
    'inventory:update',
    'logistics:view',
    'finance:view',
    'finance:invoices',
    'crm:view'
  ],
  
  [ROLE_SET.STAFF]: [
    'portal:staff',
    'orders:view',
    'orders:create',
    'orders:update',
    'inventory:view',
    'logistics:view',
    'logistics:create',
    'logistics:update',
    'crm:view',
    'crm:create',
    'crm:update'
  ],
  
  [ROLE_SET.HR]: [
    'portal:staff',
    'hr:view',
    'hr:employees',
    'hr:roles',
    'hr:attendance',
    'hr:create',
    'hr:update'
  ],
  
  [ROLE_SET.FINANCE]: [
    'portal:staff',
    'finance:view',
    'finance:invoices',
    'finance:payments',
    'finance:reports',
    'finance:create',
    'finance:update',
    'orders:view'
  ],
  
  [ROLE_SET.EXECUTIVE]: [
    'portal:admin',
    'dashboard:executive',
    'orders:view',
    'inventory:view',
    'logistics:view',
    'finance:view',
    'crm:view',
    'hr:view',
    'reports:view',
    'analytics:view'
  ],
  
  [ROLE_SET.SALES_MANAGER]: [
    'portal:staff',
    'crm:view',
    'crm:create',
    'crm:update',
    'crm:leads',
    'crm:activities',
    'orders:view',
    'orders:create',
    'reports:sales'
  ],
  
  [ROLE_SET.OPERATIONS_MANAGER]: [
    'portal:staff',
    'orders:view',
    'orders:update',
    'inventory:view',
    'inventory:update',
    'logistics:view',
    'logistics:create',
    'logistics:update',
    'reports:operations'
  ],
  
  [ROLE_SET.MARKETING_MANAGER]: [
    'portal:staff',
    'crm:view',
    'crm:create',
    'reports:marketing',
    'analytics:view'
  ],
  
  [ROLE_SET.LEGAL_ADMIN]: [
    'portal:staff',
    'legal:view',
    'legal:create',
    'legal:update',
    'legal:cases',
    'legal:trademarks',
    'legal:contracts'
  ],
  
  [ROLE_SET.COMPANY_ADMIN]: [
    'portal:admin',
    'company:view',
    'company:update',
    'users:view',
    'users:create',
    'users:update'
  ],
  
  [ROLE_SET.SALES_OFFICER]: [
    'portal:staff',
    'crm:view',
    'crm:create',
    'crm:update',
    'orders:view',
    'orders:create'
  ],
  
  [ROLE_SET.COUNTRY_MANAGER]: [
    'portal:staff',
    'dashboard:country',
    'orders:view',
    'inventory:view',
    'logistics:view',
    'finance:view',
    'crm:view',
    'reports:country'
  ],
  
  [ROLE_SET.HQ]: [
    'portal:admin',
    'dashboard:global',
    'orders:view',
    'inventory:view',
    'logistics:view',
    'finance:view',
    'crm:view',
    'hr:view',
    'reports:global',
    'analytics:global'
  ]
}

// Portal access by role
export const ROLE_PORTALS: Record<Role, string[]> = {
  [ROLE_SET.SUPER_ADMIN]: ['admin', 'staff', 'distributor', 'supplier'],
  [ROLE_SET.ADMIN]: ['admin', 'staff'],
  [ROLE_SET.DISTRIBUTOR]: ['distributor'],
  [ROLE_SET.SUPPLIER]: ['supplier'],
  [ROLE_SET.STAFF]: ['staff'],
  [ROLE_SET.HR]: ['staff'],
  [ROLE_SET.FINANCE]: ['staff'],
  [ROLE_SET.EXECUTIVE]: ['admin'],
  [ROLE_SET.SALES_MANAGER]: ['staff'],
  [ROLE_SET.OPERATIONS_MANAGER]: ['staff'],
  [ROLE_SET.MARKETING_MANAGER]: ['staff'],
  [ROLE_SET.LEGAL_ADMIN]: ['staff'],
  [ROLE_SET.COMPANY_ADMIN]: ['admin'],
  [ROLE_SET.SALES_OFFICER]: ['staff'],
  [ROLE_SET.COUNTRY_MANAGER]: ['staff'],
  [ROLE_SET.HQ]: ['admin']
}

// Check if role has permission
export function hasPermission(role: Role, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  
  // Super admin and admin have all permissions
  if (permissions.includes('*')) {
    return true
  }
  
  // Check exact match
  if (permissions.includes(permission)) {
    return true
  }
  
  // Check wildcard match (e.g., 'orders:*' matches 'orders:view')
  const permissionParts = permission.split(':')
  if (permissionParts.length === 2) {
    const wildcardPermission = `${permissionParts[0]}:*`
    if (permissions.includes(wildcardPermission)) {
      return true
    }
  }
  
  return false
}

// Check if role can access portal
export function canAccessPortal(role: Role, portal: 'distributor' | 'supplier' | 'staff' | 'admin'): boolean {
  const portals = ROLE_PORTALS[role] || []
  return portals.includes(portal)
}

// Get allowed portals for role
export function getAllowedPortals(role: Role): string[] {
  return ROLE_PORTALS[role] || []
}

