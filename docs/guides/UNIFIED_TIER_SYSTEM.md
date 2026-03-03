# Unified Tier System Documentation

## Overview

The Harvics Operating System uses a unified 5-tier architecture that consolidates all systems (OS CRM, V16, Enterprise CRM, etc.) into a single, coherent structure.

## Tier Architecture

### TIER 0: Foundational Engines (Infrastructure)

**Purpose:** Core infrastructure that powers the entire system.

**Components:**
- **Identity & Access** (`/os/identity`) - User authentication, authorization, RBAC
- **Localization** (`/os/localization`) - Multi-language, multi-currency, regional settings
- **Geo Engine** (`/os/geo`) - GPS tracking, territory management, geographic intelligence

**Access:** Restricted to Super Admin and Company Admin

**Color Theme:** Purple

---

### TIER 1: OS Domains (Business Domains)

**Purpose:** Main business functional domains.

**Core Domains** (Available to all users):
- **Orders / Sales** (`/os/orders-sales`) - Order management, sales tracking
- **Inventory** (`/os/inventory`) - Stock management, warehouse operations
- **Finance** (`/os/finance`) - Financial management, accounting, payments
- **CRM** (`/os/crm`) - Customer relationship management
- **Logistics** (`/os/logistics`) - Fleet management, route optimization

**Enterprise Domains** (Requires enterprise subscription):
- **Market & Distribution** (`/os/market-distribution`) - Distributor management, territories
- **Supplier & Procurement** (`/os/supplier-procurement`) - Supplier management, RFQ, GRN

**Specialized Domains**:
- **HR & Talent** (`/os/hr`) - Human resources, employee management
- **Executive** (`/os/executive`) - Executive dashboard, P&L tracking
- **Legal / IPR** (`/os/legal`) - Legal operations, IPR, contracts
- **Import / Export** (`/os/import-export`) - Trade operations, customs
- **Competitor Intel** (`/os/competitor-intel`) - Competitor intelligence

**Access:** Role-based access control per domain

**Color Theme:** Blue

---

### TIER 2: Modules

**Purpose:** Functional modules within each domain.

**Example (CRM Domain):**
- Customer Management
- Lead Management
- Sales Pipeline
- Customer Analytics

**Access:** Inherits from parent domain

**Color Theme:** Green

---

### TIER 3: Screens / KPI Screens

**Purpose:** Specific views and dashboards within modules.

**Example (Customer Management Module):**
- Customer List Screen
- Customer Detail Screen
- Customer Analytics Screen

**Access:** Inherits from parent module

**Color Theme:** Yellow

---

### TIER 4: Actions

**Purpose:** Specific actions within screens.

**Example (Customer List Screen):**
- Create Customer
- Edit Customer
- Delete Customer
- Export Customer List

**Access:** Inherits from parent screen

**Color Theme:** Orange

---

## System Unification

### Legacy Systems Mapping

All legacy systems are mapped to the unified tier structure:

- **OS CRM** → TIER 1: CRM Domain
- **V16** → Multiple TIER 1 Domains (Orders, Inventory, Finance, etc.)
- **Enterprise CRM** → TIER 1: CRM Domain (with enterprise features)
- **Enterprise Tier** → Enterprise Domains in TIER 1

### Benefits of Unification

1. **Consistent Navigation:** All systems use the same tier structure
2. **Unified Access Control:** Single RBAC system across all tiers
3. **Clear Hierarchy:** Clear understanding of system structure
4. **Scalable:** Easy to add new domains, modules, screens, or actions
5. **Role-Based:** Access control at every tier level

---

## Access Control

### Role-Based Access

Each tier level can have role-based access restrictions:

```typescript
accessControl: {
  roles: ['super_admin', 'company_admin', 'country_manager'],
  permissions: ['read', 'write', 'delete'],
  requiresSubscription: ['enterprise'],
  requiresFeature: ['gps-tracking']
}
```

### Access Inheritance

- TIER 0 → TIER 1: Access to engines grants access to domains
- TIER 1 → TIER 2: Access to domain grants access to modules
- TIER 2 → TIER 3: Access to module grants access to screens
- TIER 3 → TIER 4: Access to screen grants access to actions

---

## Usage Examples

### Check Tier Access

```typescript
import { hasTierAccess } from '@/config/tier-structure'

const canAccess = hasTierAccess('1', 'company_admin', [], 'crm')
```

### Get Available Domains

```typescript
import { getAvailableDomainsForRole } from '@/config/tier-structure'

const domains = getAvailableDomainsForRole('distributor')
```

### Check Enterprise Requirement

```typescript
import { requiresEnterprise } from '@/config/tier-structure'

const isEnterprise = requiresEnterprise('market-distribution')
```

---

## Migration Guide

### From OS CRM

1. Access `/os/crm` (TIER 1: CRM Domain)
2. Navigate through TIER 2 modules
3. Use TIER 3 screens for specific views

### From V16

1. Access corresponding TIER 1 domains
2. Use unified navigation structure
3. All features remain accessible through tier hierarchy

### From Enterprise CRM

1. Access `/os/crm` with enterprise subscription
2. Additional enterprise features in enterprise domains
3. Enhanced access control based on subscription

---

## Future Enhancements

- **TIER 5:** Workflow automations
- **TIER 6:** AI/ML recommendations
- **Custom Tiers:** Domain-specific tier extensions

---

## References

- Tier Configuration: `src/config/tier-structure.ts`
- Tier Components: `src/components/shared/`
- Domain Routes: `src/app/[locale]/os/[domainId]/`

