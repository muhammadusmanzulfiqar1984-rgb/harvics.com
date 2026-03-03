# 🌍 Geographic Hierarchy - Quick Start Guide

## 🎯 What is This?

A complete geographic hierarchy system that tracks locations from **Global** down to **Specific Locations** like "Victoria Casino".

```
🌐 Global
  └── 🌍 Europe
      └── 📍 Western Europe
          └── 🇬🇧 United Kingdom
              └── 🏙️ London
                  └── 📍 Westminster
                      └── 🏢 Edgeware Road
                          └── 🎰 Victoria Casino
```

---

## ✅ Where It's Applied

### 1. **Every Order** 📦
```typescript
Order.deliveryLocation = {
  fullPath: 'Global/Europe/Western Europe/UK/London/Westminster/Edgeware Road/Victoria Casino',
  location: 'VIC-CAS-001'
}
```

### 2. **Every Distributor** 🏢
```typescript
Distributor.territories = [
  {
    code: 'TERR-LON-WEST-EDG-001',
    fullPath: 'Global/Europe/Western Europe/UK/London/Westminster/Edgeware Road',
    covers: ['VIC-CAS-001']
  }
]
```

### 3. **Every User** 👤
```typescript
User.geographic = {
  cities: ['LON'],  // Can only see London data
  territories: ['TERR-LON-001']  // Can only see these territories
}
```

### 4. **Every Warehouse** 🏭
```typescript
Warehouse.location = {
  fullPath: 'Global/Europe/Western Europe/UK/London/Camden/Kings Cross'
}
```

### 5. **Every Report** 📊
```typescript
Report.filter = {
  geographic: {
    level: 'city',
    values: ['LON', 'MAN']  // Filter by cities
  }
}
```

---

## 🚀 How to Use

### Step 1: Import Utilities
```typescript
import { filterByGeographicScope } from '@/lib/geographic'
```

### Step 2: Filter Data
```typescript
const filteredData = filterByGeographicScope(allData, userScope.geographic)
```

### Step 3: Use Selector Component
```typescript
<GeographicHierarchySelector
  levels={['continent', 'region', 'country', 'city', 'district', 'area', 'location']}
  selectedPath={['EU', 'WEU', 'GBR', 'LON', 'WEST', 'EDG', 'VIC-CAS-001']}
  onChange={(path) => setLocation(path)}
/>
```

---

## 📋 Files You Need

1. ✅ **Database Migration:** `db/migrations/004_geographic_hierarchy.sql`
2. ✅ **Types:** `src/types/geographicScope.ts`
3. ✅ **Utilities:** `src/lib/geographic.ts`
4. ✅ **Component:** `src/components/GeographicHierarchySelector.tsx`

---

## 🎯 Example: Victoria Casino

```
Location: Victoria Casino
Path: Global → Europe → Western Europe → UK → London → Westminster → Edgeware Road → Victoria Casino

Territory: TERR-LON-WEST-EDG-001
Distributor: London Central Distributor

When order placed → System automatically assigns distributor based on location
```

---

**That's it! Simple and works everywhere!** 🎯

