# 🔐 CRM Permissions Implementation Guide

## Permission Structure

```typescript
interface Permission {
  resource: string  // 'distributors', 'orders', 'inventory', etc.
  action: string    // 'create', 'read', 'update', 'delete', 'analyze', 'approve'
  scope?: 'own' | 'department' | 'company' | 'all'  // Data visibility scope
  conditions?: Record<string, any>  // Additional filtering conditions
}

interface Role {
  code: string
  name: string
  level: number
  parentRole?: string
  permissions: Permission[]
}
```

## Role Definitions

### 1. Super Admin
```typescript
const SUPER_ADMIN: Role = {
  code: 'super_admin',
  name: 'Super Admin',
  level: 1,
  permissions: [
    { resource: '*', action: '*', scope: 'all' }  // Everything
  ]
}
```

### 2. Company Admin
```typescript
const COMPANY_ADMIN: Role = {
  code: 'company_admin',
  name: 'Company Admin',
  level: 2,
  parentRole: 'super_admin',
  permissions: [
    { resource: 'distributors', action: '*', scope: 'company' },
    { resource: 'suppliers', action: '*', scope: 'company' },
    { resource: 'orders', action: '*', scope: 'company' },
    { resource: 'finance', action: '*', scope: 'company' },
    { resource: 'hr', action: '*', scope: 'company' },
    { resource: 'users', action: 'create', scope: 'company', conditions: { roleLevel: '<=2' } }
  ]
}
```

### 3. Sales Manager
```typescript
const SALES_MANAGER: Role = {
  code: 'sales_manager',
  name: 'Sales Manager',
  level: 3,
  parentRole: 'company_admin',
  permissions: [
    { resource: 'distributors', action: 'create', scope: 'company' },
    { resource: 'distributors', action: 'update', scope: 'company' },
    { resource: 'distributors', action: 'analyze', scope: 'company' },
    { resource: 'distributors', action: 'read', scope: 'company' },
    { resource: 'orders', action: 'approve', scope: 'company' },
    { resource: 'orders', action: 'read', scope: 'company' },
    { resource: 'sales_team', action: '*', scope: 'department' },
    { resource: 'territories', action: '*', scope: 'company' },
    { resource: 'pricing', action: 'read', scope: 'company' },
    { resource: 'promotions', action: '*', scope: 'company' }
  ]
}
```

### 4. HR Manager
```typescript
const HR_MANAGER: Role = {
  code: 'hr_manager',
  name: 'HR Manager',
  level: 3,
  parentRole: 'company_admin',
  permissions: [
    { resource: 'employees', action: '*', scope: 'company' },
    { resource: 'departments', action: '*', scope: 'company' },
    { resource: 'recruitment', action: '*', scope: 'company' },
    { resource: 'payroll', action: 'read', scope: 'company' },
    { resource: 'performance', action: '*', scope: 'company' },
    { resource: 'hr_team', action: '*', scope: 'department' }
  ]
}
```

### 5. Finance Manager
```typescript
const FINANCE_MANAGER: Role = {
  code: 'finance_manager',
  name: 'Finance Manager',
  level: 3,
  parentRole: 'company_admin',
  permissions: [
    { resource: 'finance', action: '*', scope: 'company' },
    { resource: 'invoices', action: '*', scope: 'company' },
    { resource: 'payments', action: 'approve', scope: 'company' },
    { resource: 'credit_limits', action: '*', scope: 'company' },
    { resource: 'budgets', action: '*', scope: 'company' },
    { resource: 'financial_reports', action: '*', scope: 'company' },
    { resource: 'distributors', action: 'read', scope: 'company', conditions: { view: 'financial_only' } },
    { resource: 'suppliers', action: 'read', scope: 'company', conditions: { view: 'financial_only' } }
  ]
}
```

### 6. Country Manager
```typescript
const COUNTRY_MANAGER: Role = {
  code: 'country_manager',
  name: 'Country Manager',
  level: 3,
  parentRole: 'company_admin',
  permissions: [
    { resource: '*', action: '*', scope: 'country', conditions: { country: 'user.countries' } },
    { resource: 'users', action: 'create', scope: 'country', conditions: { roleLevel: '<=3' } }
  ]
}
```

### 7. Sales Officer / Territory Manager
```typescript
const SALES_OFFICER: Role = {
  code: 'sales_officer',
  name: 'Sales Officer',
  level: 4,
  parentRole: 'sales_manager',
  permissions: [
    { resource: 'distributors', action: 'read', scope: 'territory', conditions: { territories: 'user.territories' } },
    { resource: 'orders', action: 'read', scope: 'territory' },
    { resource: 'territories', action: 'read', scope: 'own' },
    { resource: 'sales_reports', action: 'read', scope: 'territory' }
  ]
}
```

### 8. Distributor Admin
```typescript
const DISTRIBUTOR_ADMIN: Role = {
  code: 'distributor',
  name: 'Distributor Admin',
  level: 2,
  permissions: [
    { resource: '*', action: '*', scope: 'own', conditions: { distributorId: 'user.distributorId' } },
    { resource: 'users', action: 'create', scope: 'own', conditions: { roleLevel: 'distributor_*' } }
  ]
}
```

### 9. Supplier Admin
```typescript
const SUPPLIER_ADMIN: Role = {
  code: 'supplier',
  name: 'Supplier Admin',
  level: 2,
  permissions: [
    { resource: '*', action: '*', scope: 'own', conditions: { supplierId: 'user.supplierId' } },
    { resource: 'users', action: 'create', scope: 'own', conditions: { roleLevel: 'supplier_*' } }
  ]
}
```

## Permission Check Implementation

```typescript
// Permission checker utility
class PermissionChecker {
  static canAccess(
    userRole: Role,
    resource: string,
    action: string,
    userScope: UserScope
  ): boolean {
    // Check if role has permission
    const permission = userRole.permissions.find(
      p => (p.resource === '*' || p.resource === resource) &&
           (p.action === '*' || p.action === action)
    )

    if (!permission) {
      // Check parent role permissions
      if (userRole.parentRole) {
        const parentRole = getRole(userRole.parentRole)
        return this.canAccess(parentRole, resource, action, userScope)
      }
      return false
    }

    // Check scope conditions
    return this.checkScope(permission, userScope)
  }

  static checkScope(permission: Permission, userScope: UserScope): boolean {
    switch (permission.scope) {
      case 'all':
        return true  // Super admin
      case 'company':
        return !userScope.distributorId && !userScope.supplierId
      case 'own':
        return true  // Filtered by conditions in query
      case 'department':
        return true  // Filtered by department
      case 'country':
        return true  // Filtered by country
      default:
        return false
    }
  }

  static filterDataByScope(
    data: any[],
    permission: Permission,
    userScope: UserScope
  ): any[] {
    if (permission.scope === 'all') {
      return data  // No filtering
    }

    if (permission.scope === 'own') {
      // Filter by user's own ID
      if (userScope.distributorId) {
        return data.filter(d => d.distributorId === userScope.distributorId)
      }
      if (userScope.supplierId) {
        return data.filter(d => d.supplierId === userScope.supplierId)
      }
    }

    if (permission.scope === 'company') {
      // Filter out other distributors/suppliers internal data
      return data.filter(d => 
        !d.distributorId || d.distributorId === userScope.distributorId
      )
    }

    if (permission.scope === 'country') {
      return data.filter(d => 
        userScope.countries.includes(d.countryCode)
      )
    }

    return []
  }
}
```

## API Middleware for Permission Checking

```typescript
// Permission middleware
export function requirePermission(
  resource: string,
  action: string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userScope = req.userScope
    const userRole = await getRoleByCode(userScope.role)

    if (!PermissionChecker.canAccess(userRole, resource, action, userScope)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: `${resource}:${action}`,
        currentRole: userScope.role
      })
    }

    // Add permission context to request
    req.permission = { resource, action, scope: userRole.permissions[0].scope }
    next()
  }
}

// Usage in routes
router.post(
  '/distributors',
  requirePermission('distributors', 'create'),
  createDistributorHandler
)

router.get(
  '/distributors',
  requirePermission('distributors', 'read'),
  getDistributorsHandler
)
```

## Frontend Permission Checking

```typescript
// Frontend permission hook
export function usePermissions() {
  const userScope = useUserScope()
  const [permissions, setPermissions] = useState<Permission[]>([])

  useEffect(() => {
    // Load role permissions
    loadPermissions(userScope.role).then(setPermissions)
  }, [userScope.role])

  const can = (resource: string, action: string): boolean => {
    return permissions.some(
      p => (p.resource === '*' || p.resource === resource) &&
           (p.action === '*' || p.action === action)
    )
  }

  return { can, permissions }
}

// Usage in components
function DistributorManagement() {
  const { can } = usePermissions()

  return (
    <div>
      {can('distributors', 'create') && (
        <button>Create Distributor</button>
      )}
      {can('distributors', 'analyze') && (
        <button>Analyze Distributors</button>
      )}
    </div>
  )
}
```

## Data Filtering by Scope

```typescript
// Data filtering based on user scope
export function filterDataByUserScope<T>(
  data: T[],
  userScope: UserScope
): T[] {
  // Super admin sees everything
  if (userScope.role === 'super_admin' || userScope.role === 'admin') {
    return data
  }

  // Company admin sees company-wide data
  if (userScope.role === 'company_admin' || userScope.role === 'company') {
    // Filter to show only company-managed data
    return data.filter(item => 
      !item.distributorId || 
      !item.supplierId ||
      item.managedBy === 'company'
    )
  }

  // Distributor sees only their data
  if (userScope.distributorId) {
    return data.filter(item => 
      item.distributorId === userScope.distributorId
    )
  }

  // Supplier sees only their data
  if (userScope.supplierId) {
    return data.filter(item => 
      item.supplierId === userScope.supplierId
    )
  }

  // Department heads see department data
  if (userScope.department) {
    return data.filter(item => 
      item.department === userScope.department
    )
  }

  // Country manager sees country data
  if (userScope.countries && userScope.countries.length > 0) {
    return data.filter(item => 
      userScope.countries.includes(item.countryCode)
    )
  }

  return []
}
```

## Role Assignment UI Structure

```
Super Admin Dashboard
├── Role Management
│   ├── Create Role
│   ├── Edit Role Permissions
│   └── Role Hierarchy View
├── User Management
│   ├── Assign Roles to Users
│   ├── View User Permissions
│   └── Role History
└── Permission Matrix
    └── Visual Permission Grid

Sales Manager Dashboard
├── Distributor Management
│   ├── Create Distributor [✓]
│   ├── Edit Distributor [✓]
│   ├── Analyze Distributor [✓]
│   └── View All Distributors [✓]
└── Sales Team
    ├── Create Sales User [✓]
    └── Manage Sales Users [✓]
```

---

**This structure provides a complete, scalable permission system for the CRM!**

