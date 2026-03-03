# 🌍 Geographic Hierarchy - Simple Guide

## 🎯 The Hierarchy Path

```
🌐 Global
  └── 🌍 Europe
      └── 📍 Western Europe
          └── 🇬🇧 United Kingdom
              └── 🏙️ London
                  └── 📍 Westminster
                      └── 🏢 Edgeware Road
                          └── 🎰 Victoria Casino
                              └── 📦 Distributor: London Central
```

---

## ✅ Where It Applies

### 1. **USER ACCESS** 👤
**Who can see what location?**

```
Super Admin → Sees ALL locations globally
Country Manager → Sees only UK locations
City Manager → Sees only London locations
Distributor → Sees only their assigned territories
```

### 2. **ORDERS** 📦
**Where is order delivered?**

```
Order #12345
  → Delivery: Victoria Casino
  → Path: Global/Europe/Western Europe/UK/London/Westminster/Edgeware/Victoria Casino
  → Assigned to: London Central Distributor
```

### 3. **DISTRIBUTORS** 🏢
**What territory do they cover?**

```
London Central Distributor
  → Territory: TERR-LON-WEST-001
  → Covers: Westminster, London
  → Locations: Victoria Casino, etc.
```

### 4. **TERRITORIES** 🗺️
**Which locations are in this territory?**

```
Territory: TERR-LON-WEST-EDG-001
  → Scope: Edgeware Road, Westminster, London
  → Includes: Victoria Casino
  → Distributor: London Central
```

### 5. **REPORTS** 📊
**Filter by location level**

```
Sales Report
  → Filter: City = London
  → Shows: All sales in London (all districts)
  
Or Filter: District = Westminster
  → Shows: Only Westminster sales
```

### 6. **INVENTORY** 📋
**Warehouse locations**

```
London Warehouse
  → Location: Global/Europe/Western Europe/UK/London/Camden
  → Serves: All London territories
```

---

## 🎯 Simple Rules

1. **Every location has a full path** from Global down to specific location
2. **Territories** define what distributors cover
3. **Users** can only see locations they have access to
4. **Orders** are tagged with full location path
5. **Reports** can filter by any level

---

## 📝 Example: Victoria Casino

```
Location: Victoria Casino
Full Path: Global → Europe → Western Europe → UK → London → Westminster → Edgeware → Victoria Casino

Territory: TERR-LON-WEST-EDG-001
Distributor: London Central Distributor

When order placed:
  → System finds territory from location
  → Assigns to correct distributor
  → Routes to nearest warehouse in same area
```

---

**This geographic system applies to EVERYTHING in the CRM!** 🌍

