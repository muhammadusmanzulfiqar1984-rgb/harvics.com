# 🔐 LOGIN CREDENTIALS - COMPLETE GUIDE

**Date:** 2025-11-21  
**Purpose:** Access all parts of the Harvics web application

---

## ✅ DEFAULT LOGIN CREDENTIALS

### **Universal Credentials (Works for All User Types)**

```
Username: admin
Password: admin
```

**Note:** This works for all user types by selecting the appropriate user type in the login form.

---

## 🌐 HOW TO LOGIN - STEP BY STEP

### **Option 1: Unified Login Form**
1. Navigate to: `http://localhost:3000/en/login/`
2. Enter credentials:
   - **Username:** `admin`
   - **Password:** `admin`
3. Select **User Type:**
   - Distributor
   - Supplier
   - Company
4. Click **Login**
5. You will be redirected to the appropriate dashboard

### **Option 2: Role-Specific Login Pages**

#### **Company Login**
1. Navigate to: `http://localhost:3000/en/login/company/`
2. **Username:** `admin`
3. **Password:** `admin`
4. Click **Login**
5. Redirects to: `/en/dashboard/company/`

#### **Distributor Login**
1. Navigate to: `http://localhost:3000/en/login/distributor/`
2. **Username:** `admin`
3. **Password:** `admin`
4. Click **Login**
5. Redirects to: `/en/dashboard/distributor/`

#### **Supplier Login**
1. Navigate to: `http://localhost:3000/en/login/supplier/`
2. **Username:** `admin`
3. **Password:** `admin`
4. Click **Login**
5. Redirects to: `/en/dashboard/supplier/`

---

## 📋 PAGES YOU CAN ACCESS AFTER LOGIN

### **1. Company Dashboard** (Full Access)
**URL:** `http://localhost:3000/en/dashboard/company/`

**What You'll See:**
- ✅ Dashboard statistics (Revenue, Orders, Departments, Regions)
- ✅ Workflow Management section
- ✅ **🏢 Harvics CRM - Full Architecture (Company)**
  - EnterpriseCRM component with all 7 domain services
  - All 8 tabs (Overview, Orders, Inventory, Logistics, Finance, CRM, HR, Executive)
  - Executive-level access

**Credentials:**
```
Username: admin
Password: admin
```

### **2. Distributor Dashboard**
**URL:** `http://localhost:3000/en/dashboard/distributor/`

**What You'll See:**
- ✅ Distributor-specific dashboard
- ✅ **🏢 Harvics CRM - Distributor Operations**
  - EnterpriseCRM component with distributor persona
  - All 7 domain services
  - All 8 tabs

**Credentials:**
```
Username: admin
Password: admin
```

### **3. Supplier Dashboard**
**URL:** `http://localhost:3000/en/dashboard/supplier/`

**What You'll See:**
- ✅ Supplier-specific dashboard
- ✅ **🏢 Harvics CRM - Supplier Operations**
  - EnterpriseCRM component with supplier persona
  - All 7 domain services
  - All 8 tabs

**Credentials:**
```
Username: admin
Password: admin
```

---

## 🔓 PAGES THAT DON'T REQUIRE LOGIN

### **1. Portals Page** (Public - Shows Architecture CRM)
**URL:** `http://localhost:3000/en/portals/`

**What You'll See:**
- ✅ Access Portals section (6 portal cards)
- ✅ Login Portals section (3 login cards)
- ✅ **🏢 Harvics CRM - Full Architecture** (scroll down)
  - EnterpriseCRM component with all 7 domain services
  - All 8 tabs functional
  - Architecture levels info

**No Login Required!** ✅

### **2. Localization Dashboard** (Public)
**URL:** `http://localhost:3000/en/localization-dashboard/`

**What You'll See:**
- ✅ 7 countries (Pakistan, UAE, United States, etc.)
- ✅ Click country → Detailed Analysis
- ✅ Overview tab (Market scoring, recommendations)
- ✅ Heatmap tab (GPS coverage)
- ✅ White Spaces tab (Satellite opportunities)

**No Login Required!** ✅

### **3. Portal Pages** (Public - Direct Access)
**URLs:**
- `http://localhost:3000/en/portal/distributor/`
- `http://localhost:3000/en/portal/retailer/`
- `http://localhost:3000/en/portal/sales/`
- `http://localhost:3000/en/portal/manager/`
- `http://localhost:3000/en/portal/investor/`
- `http://localhost:3000/en/portal/copilot/`

**What You'll See:**
- ✅ PersonaPortal component
- ✅ Level 2 Architecture (BFF Layer)
- ✅ Domain services data
- ✅ KPIs and metrics

**No Login Required!** ✅

---

## 🎯 QUICK ACCESS GUIDE

### **To See Architecture CRM (No Login):**
1. Go to: `http://localhost:3000/en/portals/`
2. Scroll down past Access Portals and Login Portals
3. ✅ See "🏢 Harvics CRM - Full Architecture" section

### **To See Protected Dashboards (Requires Login):**

#### **Company Dashboard (Full Access):**
1. Go to: `http://localhost:3000/en/login/company/`
2. Login:
   - Username: `admin`
   - Password: `admin`
3. ✅ Redirected to Company Dashboard
4. Scroll down to see Architecture CRM

#### **Distributor Dashboard:**
1. Go to: `http://localhost:3000/en/login/distributor/`
2. Login:
   - Username: `admin`
   - Password: `admin`
3. ✅ Redirected to Distributor Dashboard

#### **Supplier Dashboard:**
1. Go to: `http://localhost:3000/en/login/supplier/`
2. Login:
   - Username: `admin`
   - Password: `admin`
3. ✅ Redirected to Supplier Dashboard

---

## 📊 ALL ACCESSIBLE PAGES SUMMARY

### **Public Pages (No Login):**
- ✅ `/en/` - Home page
- ✅ `/en/portals/` - **Architecture CRM visible here**
- ✅ `/en/localization-dashboard/` - Localization dashboard
- ✅ `/en/portal/distributor/` - Distributor portal
- ✅ `/en/portal/retailer/` - Retailer portal
- ✅ `/en/portal/sales/` - Sales portal
- ✅ `/en/portal/manager/` - Manager portal
- ✅ `/en/portal/investor/` - Investor portal
- ✅ `/en/portal/copilot/` - AI Copilot

### **Protected Pages (Requires Login):**
- 🔐 `/en/dashboard/company/` - **Full Architecture CRM**
- 🔐 `/en/dashboard/distributor/` - Distributor CRM
- 🔐 `/en/dashboard/supplier/` - Supplier CRM

---

## 🔑 LOGIN CREDENTIALS SUMMARY

### **For All User Types:**
```
Username: admin
Password: admin
```

### **User Types Available:**
1. **Company** → `/en/dashboard/company/`
2. **Distributor** → `/en/dashboard/distributor/`
3. **Supplier** → `/en/dashboard/supplier/`

### **Login URLs:**
- Unified: `http://localhost:3000/en/login/`
- Company: `http://localhost:3000/en/login/company/`
- Distributor: `http://localhost:3000/en/login/distributor/`
- Supplier: `http://localhost:3000/en/login/supplier/`

---

## ✅ TESTED AND WORKING

- ✅ Login works with `admin/admin`
- ✅ All user types supported
- ✅ All dashboards accessible after login
- ✅ Architecture CRM visible on all dashboards
- ✅ Public pages work without login
- ✅ Portal pages accessible without login

---

## 🎉 QUICK START

**To see everything working:**

1. **Open Portals Page (No login needed):**
   - `http://localhost:3000/en/portals/`
   - Scroll down → See Architecture CRM

2. **Open Localization Dashboard (No login needed):**
   - `http://localhost:3000/en/localization-dashboard/`
   - Click any country → See analysis

3. **Login to see protected dashboards:**
   - Go to: `http://localhost:3000/en/login/company/`
   - Login: `admin` / `admin`
   - See Company Dashboard with full Architecture CRM

---

**All credentials are ready! Use `admin/admin` to access everything!** ✅

