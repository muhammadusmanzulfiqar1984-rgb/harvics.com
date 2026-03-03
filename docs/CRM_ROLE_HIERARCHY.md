# 🏢 Harvics CRM - Complete Role Hierarchy & Access Control Matrix

## 📊 Hierarchy Overview

```
LEVEL 1: SUPER ADMIN (Root Level)
    │
    ├── LEVEL 2: COMPANY ADMIN (Global Company Management)
    │   │
    │   ├── LEVEL 3A: DEPARTMENT HEADS
    │   │   ├── Sales Manager
    │   │   ├── HR Manager
    │   │   ├── Finance Manager
    │   │   ├── Operations Manager
    │   │   ├── Marketing Manager
    │   │   └── Executive Team
    │   │
    │   └── LEVEL 3B: SPECIALIZED ROLES
    │       ├── Country Manager
    │       ├── Regional Manager
    │       └── Territory Manager
    │
    ├── LEVEL 2: DISTRIBUTOR NETWORK
    │   ├── Distributor Owner/Admin
    │   ├── Distributor Sales Team
    │   ├── Distributor Finance
    │   └── Distributor Operations
    │
    └── LEVEL 2: SUPPLIER NETWORK
        ├── Supplier Owner/Admin
        ├── Supplier Production Manager
        ├── Supplier Quality Control
        └── Supplier Logistics
```

---

## 🎯 Role Definitions & Access Control

### LEVEL 1: SUPER ADMIN 🛡️

**Role Code:** `super_admin` / `admin`

**Description:** Root level access - sees everything across all organizations, all countries, all roles.

**Can Access:**
- ✅ **ALL** data from all roles (Company, Distributor, Supplier)
- ✅ **ALL** countries and regions
- ✅ **ALL** reports and analytics
- ✅ Create/modify/delete any role or user
- ✅ System configuration and settings
- ✅ Audit logs and security
- ✅ Database access
- ✅ API management

**Data Scope:**
- 📊 Global aggregate data from ALL distributors
- 📊 Global aggregate data from ALL suppliers
- 📊 All company departments and employees
- 📊 Cross-role analytics and comparisons

**Modules Available:**
- All 13 CRM modules (Overview, Orders, Inventory, Logistics, Finance, CRM, HR, Executive, Investor, Legal-IPR, Competitor, Import-Export, Admin)

---

### LEVEL 2A: COMPANY ADMIN 🏢

**Role Code:** `company_admin` / `hq` / `company`

**Description:** Company-wide management - sees all company data but filtered to company scope only.

**Can Access:**
- ✅ All company departments
- ✅ All distributors (view and manage)
- ✅ All suppliers (view and manage)
- ✅ Company-wide reports
- ✅ Create/manage company users
- ✅ Create/manage distributors
- ✅ Create/manage suppliers
- ✅ Financial overview (company-wide)
- ✅ Strategic planning tools

**Cannot Access:**
- ❌ Individual distributor's internal data (unless shared)
- ❌ Individual supplier's internal data (unless shared)
- ❌ System-level configuration

**Data Scope:**
- 📊 Company-wide aggregate data
- 📊 All distributors' order/invoice data
- 📊 All suppliers' PO/shipment data
- 📊 Company employees across all departments

**Modules Available:**
- All 13 CRM modules

---

### LEVEL 3A: DEPARTMENT HEADS

#### 📈 SALES MANAGER

**Role Code:** `sales_manager`

**Description:** Manages sales operations, distributor relationships, and sales team.

**Can Access:**
- ✅ **CREATE** new distributors
- ✅ **EDIT** distributor information
- ✅ **ANALYZE** distributor performance
- ✅ **VIEW** all distributors' data
- ✅ Manage distributor territories
- ✅ Create/manage distributor users
- ✅ Sales team management
- ✅ Sales reports and analytics
- ✅ Order management (approve/reject)
- ✅ Pricing and promotions
- ✅ Territory assignment

**Cannot Access:**
- ❌ Supplier management
- ❌ HR data (except sales team)
- ❌ Financial details (limited view)
- ❌ Legal/IPR modules

**Data Scope:**
- 📊 All distributors' sales data
- 📊 Territory coverage
- 📊 Sales team performance
- 📊 Order pipeline

**Modules Available:**
- Overview, Orders, Inventory, Logistics, Finance (limited), CRM, Executive (sales metrics)

**Key Permissions:**
```javascript
{
  distributors: {
    create: true,
    read: true,
    update: true,
    delete: false,  // Only super_admin can delete
    analyze: true
  },
  sales_team: {
    create: true,
    read: true,
    update: true,
    delete: false
  },
  orders: {
    approve: true,
    reject: true,
    view_all: true
  }
}
```

---

#### 👔 HR MANAGER

**Role Code:** `hr_manager`

**Description:** Manages all human resources across the company.

**Can Access:**
- ✅ Employee management (all departments)
- ✅ Recruitment and hiring
- ✅ Payroll and compensation
- ✅ Performance reviews
- ✅ Training and development
- ✅ Department structure
- ✅ Employee analytics

**Cannot Access:**
- ❌ Distributor/Supplier management
- ❌ Financial details (compensation data only)
- ❌ Sales data

**Data Scope:**
- 📊 All company employees
- 📊 Department structures
- 📊 HR metrics and analytics

**Modules Available:**
- Overview, HR, Executive (people metrics), Finance (payroll only)

---

#### 💰 FINANCE MANAGER

**Role Code:** `finance_manager`

**Description:** Manages all financial operations and reporting.

**Can Access:**
- ✅ Financial reports (all)
- ✅ Invoices and payments
- ✅ Budget management
- ✅ P&L statements
- ✅ Credit limits management
- ✅ Payment approvals
- ✅ Financial analytics
- ✅ Distributor credit management
- ✅ Supplier payment processing

**Cannot Access:**
- ❌ Employee personal data (except compensation)
- ❌ Sales territory management
- ❌ Product management

**Data Scope:**
- 📊 All financial transactions
- 📊 Company-wide financial data
- 📊 Distributor payment status
- 📊 Supplier invoices

**Modules Available:**
- Overview, Finance, Executive (financial metrics), Orders (financial view), CRM (financial view)

---

#### 🚚 OPERATIONS MANAGER

**Role Code:** `operations_manager`

**Description:** Manages logistics, inventory, and supply chain operations.

**Can Access:**
- ✅ Inventory management (all warehouses)
- ✅ Logistics and shipping
- ✅ Warehouse management
- ✅ Route optimization
- ✅ Supplier logistics coordination
- ✅ Distribution network management
- ✅ Operations analytics

**Cannot Access:**
- ❌ Financial approvals
- ❌ Sales pricing
- ❌ HR management

**Data Scope:**
- 📊 All inventory data
- 📊 All logistics data
- 📊 Warehouse operations
- 📊 Supply chain metrics

**Modules Available:**
- Overview, Inventory, Logistics, Orders (operations view), Import-Export

---

#### 📊 MARKETING MANAGER

**Role Code:** `marketing_manager`

**Description:** Manages marketing campaigns, promotions, and brand management.

**Can Access:**
- ✅ Promotions and campaigns
- ✅ Marketing analytics
- ✅ Brand management
- ✅ Competitor analysis
- ✅ Marketing reports
- ✅ Campaign performance

**Cannot Access:**
- ❌ Financial approvals
- ❌ HR data
- ❌ Distributor creation

**Data Scope:**
- 📊 Marketing campaigns
- 📊 Promotion performance
- 📊 Competitor data
- 📊 Brand metrics

**Modules Available:**
- Overview, CRM (marketing view), Competitor, Executive (marketing metrics)

---

### LEVEL 3B: REGIONAL/COUNTRY ROLES

#### 🌍 COUNTRY MANAGER

**Role Code:** `country_manager`

**Description:** Manages all operations within a specific country.

**Can Access:**
- ✅ All data for their country
- ✅ All distributors in country
- ✅ All suppliers in country
- ✅ Country-level reports
- ✅ Create/manage country users
- ✅ Country budget management

**Cannot Access:**
- ❌ Other countries' data
- ❌ Global system settings

**Data Scope:**
- 📊 Country-specific aggregate data
- 📊 All distributors in country
- 📊 All suppliers in country

**Modules Available:**
- All 13 modules (filtered to country)

---

#### 🗺️ REGIONAL MANAGER

**Role Code:** `regional_manager`

**Description:** Manages operations within a region (multiple territories).

**Can Access:**
- ✅ All territories in their region
- ✅ Regional distributors
- ✅ Regional reports
- ✅ Territory management

**Data Scope:**
- 📊 Regional aggregate data
- 📊 Regional distributors

**Modules Available:**
- Overview, Orders, Inventory, Logistics, Finance, CRM

---

#### 📍 TERRITORY MANAGER / SALES OFFICER

**Role Code:** `sales_officer` / `territory_manager`

**Description:** Manages a specific territory and its distributors.

**Can Access:**
- ✅ Territory distributors
- ✅ Territory sales data
- ✅ Territory reports
- ✅ Limited distributor management

**Data Scope:**
- 📊 Territory-specific data only

**Modules Available:**
- Overview, Orders, Inventory, Logistics, Finance, CRM (territory view)

---

### LEVEL 2B: DISTRIBUTOR NETWORK

#### 📦 DISTRIBUTOR ADMIN

**Role Code:** `distributor`

**Description:** Main distributor account owner/admin.

**Can Access:**
- ✅ **ONLY** their distributor's data
- ✅ Their warehouses
- ✅ Their orders
- ✅ Their customers/retailers
- ✅ Their financial data
- ✅ Create/manage distributor users
- ✅ Territory coverage (their own)
- ✅ Their inventory

**Cannot Access:**
- ❌ Other distributors' data
- ❌ Supplier internal data
- ❌ Company internal operations
- ❌ Other territories

**Data Scope:**
- 📊 Only their distributor ID
- 📊 Their assigned territories
- 📊 Their warehouses only

**Modules Available:**
- Overview, Orders, Inventory, Logistics, Finance, CRM

**Permissions:**
```javascript
{
  distributor_data: {
    view: 'own_only',
    edit: 'own_only'
  },
  create_distributor: false,
  view_other_distributors: false
}
```

---

#### 👥 DISTRIBUTOR SALES TEAM

**Role Code:** `distributor_sales`

**Description:** Distributor's sales team members.

**Can Access:**
- ✅ Place orders
- ✅ View their distributor's catalog
- ✅ Customer management (their assigned)
- ✅ Sales reports (their own)
- ✅ Territory coverage (limited)

**Cannot Access:**
- ❌ Financial data
- ❌ Create users
- ❌ System settings

**Data Scope:**
- 📊 Limited to their assigned customers/territories

**Modules Available:**
- Overview, Orders, CRM (limited)

---

#### 💳 DISTRIBUTOR FINANCE

**Role Code:** `distributor_finance`

**Description:** Handles distributor's financial operations.

**Can Access:**
- ✅ Invoices (their distributor)
- ✅ Payments
- ✅ Credit status
- ✅ Financial reports (their distributor)

**Modules Available:**
- Overview, Finance, Orders (financial view)

---

### LEVEL 2C: SUPPLIER NETWORK

#### 🚚 SUPPLIER ADMIN

**Role Code:** `supplier`

**Description:** Main supplier account owner/admin.

**Can Access:**
- ✅ **ONLY** their supplier's data
- ✅ Purchase orders from Harvics
- ✅ Their inventory (raw materials + finished)
- ✅ Shipment management
- ✅ Quality control data
- ✅ Their invoices
- ✅ Create/manage supplier users

**Cannot Access:**
- ❌ Other suppliers' data
- ❌ Distributor internal data
- ❌ Company internal operations

**Data Scope:**
- 📊 Only their supplier ID
- 📊 Their warehouses
- 📊 Their shipments

**Modules Available:**
- Overview, Orders (POs), Inventory, Logistics, Finance, CRM (Harvics relationship)

---

#### 🏭 SUPPLIER PRODUCTION MANAGER

**Role Code:** `supplier_production`

**Description:** Manages production operations.

**Can Access:**
- ✅ Production schedules
- ✅ Inventory (raw materials)
- ✅ Quality control
- ✅ Production reports

**Modules Available:**
- Overview, Inventory, Orders (production view)

---

#### ✅ SUPPLIER QUALITY CONTROL

**Role Code:** `supplier_quality`

**Description:** Manages quality control processes.

**Can Access:**
- ✅ Quality reports
- ✅ Inspection data
- ✅ Quality metrics

**Modules Available:**
- Overview, Inventory (quality view)

---

## 📋 Complete Access Control Matrix

| Role | Distributors | Suppliers | Company | HR | Finance | Sales | Create Users | System Config |
|------|--------------|-----------|---------|----|---------|----|--------------|--------------| 
| Super Admin | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ Yes |
| Company Admin | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ Company | ❌ No |
| Sales Manager | ✅ Create/Edit/Analyze All | ❌ View Only | ❌ View Only | ❌ No | ⚠️ Limited | ✅ All | ✅ Sales Team | ❌ No |
| HR Manager | ❌ No | ❌ No | ✅ All Depts | ✅ All | ⚠️ Payroll Only | ❌ No | ✅ HR Team | ❌ No |
| Finance Manager | ⚠️ Financial View | ⚠️ Financial View | ✅ All | ⚠️ Compensation | ✅ All | ❌ No | ✅ Finance Team | ❌ No |
| Operations Manager | ⚠️ Logistics View | ⚠️ Logistics View | ⚠️ Operations | ❌ No | ❌ No | ❌ No | ✅ Operations Team | ❌ No |
| Country Manager | ✅ Country Only | ✅ Country Only | ✅ Country Only | ✅ Country Only | ✅ Country Only | ✅ Country Only | ✅ Country | ❌ No |
| Sales Officer | ⚠️ Territory Only | ❌ No | ❌ No | ❌ No | ❌ No | ✅ Territory Only | ❌ No | ❌ No |
| Distributor Admin | ✅ Own Only | ❌ No | ❌ No | ❌ No | ✅ Own Only | ✅ Own Only | ✅ Own Users | ❌ No |
| Supplier Admin | ❌ No | ✅ Own Only | ❌ No | ❌ No | ✅ Own Only | ❌ No | ✅ Own Users | ❌ No |

---

## 🔐 Permission Levels

### CREATE (C)
- Can create new entities

### READ (R)
- Can view data

### UPDATE (U)
- Can modify existing data

### DELETE (D)
- Can remove data

### ANALYZE (A)
- Can run analytics and reports

### APPROVE (AP)
- Can approve/reject actions

---

## 📊 Data Visibility Matrix

| Role | Own Data | Department Data | Company Data | All Distributors | All Suppliers | Global Data |
|------|----------|-----------------|--------------|------------------|---------------|-------------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Company Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Sales Manager | ✅ | ✅ Sales Only | ⚠️ Limited | ✅ | ❌ | ❌ |
| HR Manager | ✅ | ✅ HR Only | ⚠️ Limited | ❌ | ❌ | ❌ |
| Country Manager | ✅ | ✅ | ✅ Country | ✅ Country | ✅ Country | ❌ |
| Distributor Admin | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ |
| Supplier Admin | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🎯 Key Workflows & Permissions

### SALES MANAGER - Distributor Creation Workflow

```
Sales Manager can:
1. CREATE new distributor account
   - Fill distributor details (name, address, country, etc.)
   - Assign territories
   - Set credit limits (requires Finance approval)
   - Create initial warehouse

2. CREATE distributor users
   - Assign roles (distributor_admin, distributor_sales, distributor_finance)
   - Set permissions

3. ANALYZE distributor performance
   - View sales reports
   - View order history
   - View territory coverage
   - Compare with other distributors

4. MANAGE distributor relationships
   - Update distributor info
   - Reassign territories
   - Approve/reject orders
   - Manage promotions

5. VIEW distributor analytics
   - Sales trends
   - Order patterns
   - Credit utilization
   - Customer growth
```

### FINANCE MANAGER - Payment Workflow

```
Finance Manager can:
1. VIEW all invoices (company, distributors, suppliers)
2. APPROVE payments
3. MANAGE credit limits
4. VIEW financial reports
5. PROCESS supplier payments
6. TRACK distributor payments
```

---

## 🗄️ Database Schema for Role Management

```sql
-- User Roles Table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,  -- 'super_admin', 'sales_manager', etc.
  name VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL,  -- 1=Super Admin, 2=Company/Distributor/Supplier, 3=Department
  parent_role_id UUID REFERENCES user_roles(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,  -- 'distributors.create', 'orders.approve'
  name VARCHAR(200) NOT NULL,
  resource VARCHAR(50) NOT NULL,  -- 'distributors', 'orders', 'inventory'
  action VARCHAR(50) NOT NULL,  -- 'create', 'read', 'update', 'delete', 'analyze'
  description TEXT
);

-- Role Permissions Mapping
CREATE TABLE role_permissions (
  role_id UUID REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT TRUE,
  conditions JSONB,  -- Additional conditions (e.g., only own data)
  PRIMARY KEY (role_id, permission_id)
);

-- User Role Assignments
CREATE TABLE user_role_assignments (
  user_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES user_roles(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES portal_users(id),
  scope JSONB,  -- Additional scope (territories, countries, etc.)
  PRIMARY KEY (user_id, role_id)
);
```

---

## 🔧 Implementation Notes

1. **Role Hierarchy**: Use parent_role_id to create hierarchy
2. **Permission Inheritance**: Child roles inherit parent permissions unless overridden
3. **Scope Filtering**: Always filter data by user's scope (distributorId, supplierId, territories, countries)
4. **Audit Logging**: Log all permission-sensitive actions
5. **Dynamic Permissions**: Check permissions at runtime, not just UI visibility

---

## 📝 Next Steps

1. Create role management UI for Super Admin
2. Implement permission checking middleware
3. Add role assignment UI for each level
4. Create permission matrix visualization
5. Implement scope-based data filtering

---

**Last Updated:** 2025-01-21
**Version:** 1.0

