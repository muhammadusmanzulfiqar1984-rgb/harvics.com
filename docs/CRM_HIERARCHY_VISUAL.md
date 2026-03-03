# 🎯 Harvics CRM - Visual Hierarchy & Access Control Diagram

## 📊 Complete Role Hierarchy Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                    🛡️ SUPER ADMIN (Level 1)                      │
│              Sees EVERYTHING - All Roles, All Data              │
│                    Can Create/Delete Everything                 │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  🏢 COMPANY      │ │  📦 DISTRIBUTOR   │ │  🚚 SUPPLIER     │
│  ADMIN (Level 2) │ │  NETWORK (Level 2)│ │  NETWORK (Level 2)│
│                  │ │                  │ │                  │
│ • Sees all       │ │ • Own data only  │ │ • Own data only  │
│   company data   │ │ • Can't see      │ │ • Can't see      │
│ • All distributors│ │   others         │ │   others         │
│ • All suppliers  │ │ • Own warehouses │ │ • Own production │
│ • All departments│ │ • Own customers  │ │ • Own shipments  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                   │                   │
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│              DEPARTMENT HEADS (Level 3)                     │
└─────────────────────────────────────────────────────────────┘
          │
    ┌─────┼─────┬──────┬──────┬──────┐
    │     │     │      │      │      │
    ▼     ▼     ▼      ▼      ▼      ▼
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│📈  │ │👔  │ │💰  │ │🚚  │ │📊  │ │🌍  │
│SALES│ │ HR │ │FIN │ │OPS │ │MKT │ │CNTY│
│MGR  │ │MGR │ │MGR │ │MGR │ │MGR │ │MGR │
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘
  │       │       │       │       │       │
  │       │       │       │       │       └─── Country Data Only
  │       │       │       │       │
  │       │       │       │       └─── Marketing Data Only
  │       │       │       │
  │       │       │       └─── Operations Data Only
  │       │       │
  │       │       └─── Financial Data Only
  │       │
  │       └─── HR Data Only
  │
  └─── Sales Data + Create Distributors
       │
       └─── LEVEL 4: Sales Officers / Territory Managers
            └─── Territory Data Only
```

---

## 🔐 Access Control Matrix (What Each Role Can See)

### SUPER ADMIN 🛡️
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ ALL Distributors (All Countries)                         │
│ ✅ ALL Suppliers (All Countries)                            │
│ ✅ ALL Company Departments                                  │
│ ✅ ALL Users (All Roles)                                    │
│ ✅ ALL Financial Data                                       │
│ ✅ ALL Orders (All Sources)                                 │
│ ✅ System Configuration                                     │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ Create/Edit/Delete ANY Role                              │
│ ✅ Create/Edit/Delete ANY User                              │
│ ✅ Access System Settings                                   │
│ ✅ View ALL Audit Logs                                      │
│                                                             │
│ MODULES: All 13 CRM Modules                                 │
└────────────────────────────────────────────────────────────┘
```

### COMPANY ADMIN 🏢
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ ALL Company Data (Global)                                │
│ ✅ ALL Distributors (View & Manage)                         │
│ ✅ ALL Suppliers (View & Manage)                            │
│ ✅ ALL Departments                                          │
│ ✅ Company Employees (All)                                  │
│ ✅ Financial Overview (Company-wide)                        │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ Create Distributors                                      │
│ ✅ Create Suppliers                                         │
│ ✅ Create Company Users                                     │
│ ✅ Manage All Company Resources                             │
│                                                             │
│ CANNOT:                                                     │
│ ❌ Delete System-Level Settings                             │
│ ❌ Access Other Company's Data                              │
│                                                             │
│ MODULES: All 13 CRM Modules                                 │
└────────────────────────────────────────────────────────────┘
```

### SALES MANAGER 📈
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ ALL Distributors (Company-wide)                          │
│ ✅ Sales Team Data                                          │
│ ✅ Territory Data                                           │
│ ✅ Order Data (Sales View)                                  │
│ ✅ Pricing & Promotions                                     │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ CREATE Distributors                                      │
│ ✅ EDIT Distributors                                        │
│ ✅ ANALYZE Distributors                                     │
│ ✅ APPROVE/REJECT Orders                                    │
│ ✅ Create Sales Team Users                                  │
│ ✅ Assign Territories                                       │
│                                                             │
│ CANNOT:                                                     │
│ ❌ Supplier Management                                      │
│ ❌ HR Data (except Sales Team)                              │
│ ❌ Financial Approvals                                      │
│                                                             │
│ MODULES: Overview, Orders, CRM, Inventory (sales view),     │
│          Logistics (sales view), Finance (limited)          │
└────────────────────────────────────────────────────────────┘
```

### HR MANAGER 👔
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ ALL Employees (All Departments)                          │
│ ✅ Department Structures                                    │
│ ✅ Payroll Data                                             │
│ ✅ Performance Reviews                                      │
│ ✅ Recruitment Data                                         │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ Create/Edit Employees                                    │
│ ✅ Manage Departments                                       │
│ ✅ Process Payroll                                          │
│ ✅ Create HR Team Users                                     │
│                                                             │
│ CANNOT:                                                     │
│ ❌ Distributor/Supplier Management                          │
│ ❌ Sales Data                                               │
│ ❌ Financial Details (except payroll)                       │
│                                                             │
│ MODULES: Overview, HR, Finance (payroll only)               │
└────────────────────────────────────────────────────────────┘
```

### FINANCE MANAGER 💰
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ ALL Financial Data (Company-wide)                        │
│ ✅ ALL Invoices (Distributors + Suppliers)                  │
│ ✅ ALL Payments                                             │
│ ✅ Credit Limits (All Distributors)                         │
│ ✅ Financial Reports (All)                                  │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ APPROVE Payments                                         │
│ ✅ MANAGE Credit Limits                                     │
│ ✅ PROCESS Supplier Payments                                │
│ ✅ VIEW Financial Analytics                                 │
│ ✅ Create Finance Team Users                                │
│                                                             │
│ CANNOT:                                                     │
│ ❌ Create Distributors/Suppliers                            │
│ ❌ HR Personal Data (except compensation)                   │
│ ❌ Sales Territory Management                               │
│                                                             │
│ MODULES: Overview, Finance, Orders (financial view),        │
│          CRM (financial view), Executive (financial)        │
└────────────────────────────────────────────────────────────┘
```

### OPERATIONS MANAGER 🚚
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ ALL Inventory (All Warehouses)                           │
│ ✅ ALL Logistics Data                                       │
│ ✅ ALL Warehouses                                           │
│ ✅ ALL Shipping Routes                                      │
│ ✅ Supply Chain Data                                        │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ MANAGE Inventory                                         │
│ ✅ OPTIMIZE Routes                                          │
│ ✅ COORDINATE Shipments                                     │
│ ✅ MANAGE Warehouses                                        │
│                                                             │
│ CANNOT:                                                     │
│ ❌ Financial Approvals                                      │
│ ❌ Sales Management                                         │
│ ❌ HR Management                                            │
│                                                             │
│ MODULES: Overview, Inventory, Logistics, Orders (ops view)  │
└────────────────────────────────────────────────────────────┘
```

### COUNTRY MANAGER 🌍
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ ALL Data for Assigned Country(ies)                       │
│ ✅ Country Distributors                                     │
│ ✅ Country Suppliers                                        │
│ ✅ Country Employees                                        │
│ ✅ Country Financials                                       │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ Manage Country Operations                                │
│ ✅ Create Country Users                                     │
│ ✅ Country Budget Management                                │
│                                                             │
│ CANNOT:                                                     │
│ ❌ Other Countries' Data                                    │
│ ❌ Global System Settings                                   │
│                                                             │
│ MODULES: All 13 Modules (Country-filtered)                  │
└────────────────────────────────────────────────────────────┘
```

### SALES OFFICER / TERRITORY MANAGER 📍
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ Territory Distributors Only                              │
│ ✅ Territory Sales Data                                     │
│ ✅ Territory Orders                                         │
│ ✅ Territory Coverage                                       │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ VIEW Territory Reports                                   │
│ ✅ MANAGE Territory Orders                                  │
│                                                             │
│ CANNOT:                                                     │
│ ❌ Create Distributors                                      │
│ ❌ Other Territories' Data                                  │
│ ❌ Financial Approvals                                      │
│                                                             │
│ MODULES: Overview, Orders, Inventory, Logistics, Finance,   │
│          CRM (territory view)                               │
└────────────────────────────────────────────────────────────┘
```

### DISTRIBUTOR ADMIN 📦
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ OWN Distributor Data Only                                │
│ ✅ OWN Warehouses                                           │
│ ✅ OWN Customers/Retailers                                  │
│ ✅ OWN Orders                                               │
│ ✅ OWN Financials                                           │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ PLACE Orders                                             │
│ ✅ MANAGE Own Inventory                                     │
│ ✅ MANAGE Own Customers                                     │
│ ✅ CREATE Distributor Users                                 │
│                                                             │
│ CANNOT:                                                     │
│ ❌ Other Distributors' Data                                 │
│ ❌ Supplier Internal Data                                   │
│ ❌ Company Internal Operations                              │
│                                                             │
│ MODULES: Overview, Orders, Inventory, Logistics, Finance,   │
│          CRM (own customers)                                │
└────────────────────────────────────────────────────────────┘
```

### SUPPLIER ADMIN 🚚
```
┌────────────────────────────────────────────────────────────┐
│ DATA ACCESS:                                                │
│ ✅ OWN Supplier Data Only                                   │
│ ✅ Purchase Orders from Harvics                             │
│ ✅ OWN Inventory (Raw + Finished)                           │
│ ✅ OWN Shipments                                            │
│ ✅ OWN Invoices                                             │
│                                                             │
│ ACTIONS:                                                    │
│ ✅ MANAGE Production                                        │
│ ✅ UPDATE Shipment Status                                   │
│ ✅ MANAGE Quality Control                                   │
│ ✅ CREATE Supplier Users                                    │
│                                                             │
│ CANNOT:                                                     │
│ ❌ Other Suppliers' Data                                    │
│ ❌ Distributor Internal Data                                │
│ ❌ Company Internal Operations                              │
│                                                             │
│ MODULES: Overview, Orders (POs), Inventory, Logistics,      │
│          Finance, CRM (Harvics relationship)                │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Permission Flow Examples

### Example 1: Sales Manager Creates Distributor
```
Sales Manager
    │
    ├─→ Can Access: 'distributors' resource
    ├─→ Action: 'create'
    ├─→ Scope: 'company'
    │
    ├─→ Creates Distributor Record
    │   ├─→ Assigns Territories
    │   ├─→ Sets Credit Limit (requires Finance approval)
    │   └─→ Creates Initial Warehouse
    │
    └─→ Can Then:
        ├─→ ANALYZE the distributor
        ├─→ VIEW all distributor data
        ├─→ CREATE distributor users
        └─→ MANAGE distributor relationship
```

### Example 2: Finance Manager Views Payment
```
Finance Manager
    │
    ├─→ Can Access: 'finance' resource
    ├─→ Action: 'read' / 'approve'
    ├─→ Scope: 'company'
    │
    ├─→ Views ALL Invoices:
    │   ├─→ Distributor invoices ✅
    │   ├─→ Supplier invoices ✅
    │   └─→ Company invoices ✅
    │
    └─→ Can APPROVE payments for all
```

### Example 3: Distributor Views Orders
```
Distributor Admin
    │
    ├─→ Can Access: 'orders' resource
    ├─→ Action: 'read' / 'create'
    ├─→ Scope: 'own'
    │
    ├─→ Views ONLY:
    │   ├─→ Their own orders ✅
    │   ├─→ Their own invoices ✅
    │   └─→ Their own payments ✅
    │
    └─→ Cannot See:
        ├─→ Other distributors' orders ❌
        └─→ Supplier internal data ❌
```

---

## 📋 Quick Reference: Who Can Do What

| Action | Super Admin | Company Admin | Sales Mgr | HR Mgr | Finance Mgr | Distributor | Supplier |
|--------|-------------|---------------|-----------|--------|-------------|-------------|----------|
| **Create Distributor** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Analyze All Distributors** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View All Orders** | ✅ | ✅ | ⚠️ Limited | ❌ | ✅ Financial | ❌ Own Only | ❌ Own POs |
| **Approve Payments** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Manage All Employees** | ✅ | ✅ | ❌ Sales Only | ✅ | ❌ | ❌ | ❌ |
| **Create Company Users** | ✅ | ✅ | ❌ Sales Only | ❌ HR Only | ❌ Finance Only | ❌ | ❌ |
| **View Global Reports** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System Configuration** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🔄 Data Flow & Visibility

```
SUPER ADMIN VIEW:
┌─────────────────────────────────────────────────────────┐
│  All Distributors: [Dist1] [Dist2] [Dist3] ... [DistN] │
│  All Suppliers:   [Sup1]   [Sup2]   [Sup3] ... [SupN]  │
│  All Company:     [Dept1]  [Dept2]  [Dept3] ... [DeptN]│
│  Global Stats:    [Orders: 15,678] [Revenue: $245M]     │
└─────────────────────────────────────────────────────────┘

COMPANY ADMIN VIEW:
┌─────────────────────────────────────────────────────────┐
│  All Distributors: [Dist1] [Dist2] [Dist3] ... [DistN] │
│  All Suppliers:   [Sup1]   [Sup2]   [Sup3] ... [SupN]  │
│  All Company:     [Dept1]  [Dept2]  [Dept3] ... [DeptN]│
│  Company Stats:   [Orders: 15,678] [Revenue: $245M]     │
└─────────────────────────────────────────────────────────┘

SALES MANAGER VIEW:
┌─────────────────────────────────────────────────────────┐
│  All Distributors: [Dist1] [Dist2] [Dist3] ... [DistN] │
│  Can CREATE new distributors                            │
│  Can ANALYZE all distributors                           │
│  Sales Stats:     [Dist Orders: 12,450]                 │
│  Cannot See:      [Supplier Details] [HR Details]       │
└─────────────────────────────────────────────────────────┘

DISTRIBUTOR ADMIN VIEW:
┌─────────────────────────────────────────────────────────┐
│  Own Distributor:        [Dist1] ← ONLY THIS            │
│  Own Orders:             [45 orders]                    │
│  Own Inventory:          [125K value]                   │
│  Own Customers:          [23 retailers]                 │
│  Cannot See:             [Dist2] [Dist3] [Suppliers]    │
└─────────────────────────────────────────────────────────┘

SUPPLIER ADMIN VIEW:
┌─────────────────────────────────────────────────────────┐
│  Own Supplier:           [Sup1] ← ONLY THIS             │
│  Own POs:                [23 purchase orders]           │
│  Own Inventory:          [85K value]                    │
│  Own Customer:           [Harvics only]                 │
│  Cannot See:             [Sup2] [Sup3] [Distributors]   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Access Scope Diagram

```
                    ┌─────────────────────┐
                    │   SUPER ADMIN       │
                    │  (Sees Everything)  │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
    ┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
    │  COMPANY      │  │ DISTRIBUTOR    │  │  SUPPLIER     │
    │  (Global)     │  │ (Own Only)     │  │  (Own Only)   │
    └───────┬───────┘  └────────────────┘  └───────────────┘
            │
    ┌───────┼───────────────────────────────┐
    │       │                               │
┌───▼───┐ ┌▼───┐ ┌────┐ ┌────┐ ┌────┐ ┌───▼───┐
│SALES  │ │ HR │ │FIN │ │OPS │ │MKT │ │COUNTRY│
│       │ │    │ │    │ │    │ │    │ │       │
│Create │ │All │ │All │ │All │ │All │ │Country│
│Dist   │ │Emp │ │$   │ │Ops │ │Mkt │ │Data   │
└───┬───┘ └────┘ └────┘ └────┘ └────┘ └───────┘
    │
    └─── Sales Officers
         │
         └─── Territory Data Only
```

---

## 📝 Summary Rules

1. **Super Admin** = Root access to everything
2. **Company Admin** = Company-wide access, can create distributors/suppliers
3. **Sales Manager** = Can CREATE and ANALYZE distributors
4. **Department Heads** = Access limited to their department scope
5. **Country Manager** = Access limited to assigned country(ies)
6. **Distributor/Supplier** = Access limited to their own data only
7. **Territory Managers** = Access limited to assigned territory(ies)

---

**This hierarchy ensures proper access control and data security!**

