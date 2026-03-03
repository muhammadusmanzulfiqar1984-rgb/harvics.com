# 🎯 Harvics CRM - Simple Hierarchy

## 🎯 The Simple Structure

```
                    🛡️ SUPER ADMIN
                    (Sees EVERYTHING)
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    🏢 COMPANY        📦 DISTRIBUTOR    🚚 SUPPLIER
    (All Company)     (Own Only)       (Own Only)
        │
    ┌───┼───┬─────┬─────┐
    │   │   │     │     │
  📈   👔   💰   🚚   🌍
SALES  HR  FIN  OPS  COUNTRY
MGR   MGR  MGR  MGR   MGR
```

**Key Rule:** Each level can only see what's below them!

---

## 🎯 What Each Role Sees

### 🛡️ SUPER ADMIN
**Sees:** EVERYTHING - All roles, all countries, all data
- ✅ All Distributors (everywhere)
- ✅ All Suppliers (everywhere)
- ✅ All Company Departments
- ✅ Global Reports

**Can Do:** Create, edit, delete anything

---

### 🏢 COMPANY ADMIN
**Sees:** All company data + All distributors + All suppliers
- ✅ Company-wide data
- ✅ All Distributors (can create new ones)
- ✅ All Suppliers (can create new ones)
- ✅ All Departments

**Can Do:** Manage company, create distributors/suppliers

---

### 📈 SALES MANAGER (Under Company)
**Sees:** All distributors + Sales data
- ✅ **CREATE new distributors** ⭐
- ✅ **ANALYZE distributors** ⭐
- ✅ View all distributors
- ✅ Manage sales team
- ✅ Territory management

**Cannot See:** Suppliers, HR, Finance details

---

### 👔 HR MANAGER (Under Company)
**Sees:** All employees
- ✅ All company employees
- ✅ Departments
- ✅ Payroll
- ✅ Recruitment

**Cannot See:** Distributors, Suppliers, Sales data

---

### 💰 FINANCE MANAGER (Under Company)
**Sees:** All money/financial data
- ✅ All invoices
- ✅ All payments
- ✅ Credit limits
- ✅ Financial reports

**Cannot See:** Employee personal data, Sales operations

---

### 📦 DISTRIBUTOR ADMIN
**Sees:** ONLY their own distributor
- ✅ Their orders
- ✅ Their inventory
- ✅ Their customers
- ✅ Their financials

**Cannot See:** Other distributors, suppliers, company data

---

### 🚚 SUPPLIER ADMIN
**Sees:** ONLY their own supplier
- ✅ Their purchase orders
- ✅ Their inventory
- ✅ Their shipments
- ✅ Their invoices

**Cannot See:** Other suppliers, distributors, company data

---

## ✅ Quick Permission Table

| Who | Create Distributor | See All Distributors | See All Suppliers | See All Company | See Everything |
|-----|-------------------|---------------------|-------------------|-----------------|----------------|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Company Admin** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Sales Manager** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Distributor** | ❌ | ❌ (own only) | ❌ | ❌ | ❌ |
| **Supplier** | ❌ | ❌ | ❌ (own only) | ❌ | ❌ |

---

## 🎯 Simple Rules

1. **Super Admin** = Sees everything
2. **Company Admin** = Sees all company + distributors + suppliers
3. **Sales Manager** = Can CREATE distributors + See all distributors
4. **Distributor** = Sees only their own data
5. **Supplier** = Sees only their own data

---

## 📊 Data Visibility Example

```
SUPER ADMIN sees:
  ├─ Distributor 1 (all data)
  ├─ Distributor 2 (all data)
  ├─ Distributor 3 (all data)
  ├─ Supplier 1 (all data)
  ├─ Supplier 2 (all data)
  └─ Company (all departments)

COMPANY ADMIN sees:
  ├─ All Distributors (can create new)
  ├─ All Suppliers (can create new)
  └─ Company (all departments)

SALES MANAGER sees:
  ├─ All Distributors (can create/analyze)
  └─ Sales team only

DISTRIBUTOR 1 sees:
  └─ Only Distributor 1 data

SUPPLIER 1 sees:
  └─ Only Supplier 1 data
```

---

That's it! Simple and clear! 🎯

