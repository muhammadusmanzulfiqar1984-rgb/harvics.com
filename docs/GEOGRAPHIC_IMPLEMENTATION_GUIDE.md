# 🌍 Geographic Hierarchy - Implementation Guide

## Quick Start: How to Use Geographic Hierarchy Everywhere

### 1. **In User Scope** (Who Can See What Location)

```typescript
// User's geographic access
const userScope = {
  userId: 'sales_mgr_001',
  role: 'sales_manager',
  
  // Geographic Access Levels
  geographic: {
    // Option 1: Global access (Super Admin)
    global: true,
    
    // Option 2: Continent level
    continents: ['EU', 'AS'],
    
    // Option 3: Country level
    countries: ['GBR', 'FRA', 'DEU'],
    
    // Option 4: City level
    cities: ['LON', 'PAR', 'BER'],
    
    // Option 5: Territory level (most common for sales)
    territories: ['TERR-LON-001', 'TERR-LON-002'],
    
    // Option 6: Specific locations
    locations: ['VIC-CAS-001']
  }
}
```

### 2. **In Orders** (Where Order is Delivered)

```typescript
const order = {
  id: 'ORD-001',
  orderNumber: 'ORD-2025-001',
  
  // Full geographic path
  deliveryLocation: {
    fullPath: 'Global/Europe/Western Europe/United Kingdom/London/Westminster/Edgeware Road/Victoria Casino',
    
    // Individual levels
    continent: 'Europe',
    region: 'Western Europe',
    country: 'United Kingdom',
    city: 'London',
    district: 'Westminster',
    area: 'Edgeware Road',
    location: 'Victoria Casino',
    
    // Coordinates
    coordinates: {
      lat: 51.5155,
      lng: -0.1755
    },
    
    // Address
    address: 'Victoria Casino, Edgeware Road, Westminster, London, UK'
  },
  
  // Which territory handles this
  territory: {
    code: 'TERR-LON-WEST-EDG-001',
    name: 'Westminster Edgeware Territory',
    distributor: 'London Central Distributor'
  }
}
```

### 3. **In Distributor Assignment** (What Territory Distributor Covers)

```typescript
const distributor = {
  id: 'dist_lon_001',
  name: 'London Central Distributor',
  
  // Territories assigned
  territories: [
    {
      code: 'TERR-LON-001',
      name: 'London Full Coverage',
      scope: {
        country: 'United Kingdom',
        city: 'London'
      },
      coverageType: 'full'  // Covers entire city
    },
    {
      code: 'TERR-LON-WEST-001',
      name: 'Westminster Exclusive',
      scope: {
        country: 'United Kingdom',
        city: 'London',
        district: 'Westminster'
      },
      coverageType: 'exclusive',  // Exclusive coverage
      locations: [
        'VIC-CAS-001',  // Victoria Casino
        'EDG-RET-002'   // Another location
      ]
    }
  ]
}
```

### 4. **In Reports** (Filter by Geographic Level)

```typescript
// Sales Report - Filter by City
const report = generateReport({
  type: 'sales',
  filters: {
    geographic: {
      level: 'city',
      values: ['LON', 'MAN', 'BIR']  // London, Manchester, Birmingham
    },
    dateRange: {
      start: '2025-01-01',
      end: '2025-01-31'
    }
  }
})

// Output: Sales broken down by:
// - London: $50,000
// - Manchester: $30,000
// - Birmingham: $20,000
```

### 5. **In Inventory** (Warehouse Locations)

```typescript
const warehouse = {
  id: 'wh_lon_001',
  name: 'London Central Warehouse',
  
  location: {
    fullPath: 'Global/Europe/Western Europe/United Kingdom/London/Camden/Kings Cross',
    coordinates: { lat: 51.5308, lng: -0.1238 }
  },
  
  // Serves these territories
  servesTerritories: [
    'TERR-LON-001',
    'TERR-LON-WEST-001',
    'TERR-LON-CAM-001'
  ]
}
```

---

## 🎯 Practical Example: Victoria Casino

### Complete Data Structure

```typescript
const victoriaCasinoLocation = {
  // Location Details
  location: {
    id: 'loc-vic-cas-001',
    code: 'VIC-CAS-001',
    name: 'Victoria Casino',
    type: 'retailer',  // or 'distribution_point', 'warehouse', etc.
    address: 'Edgeware Road, Westminster, London, UK',
    coordinates: {
      lat: 51.5155,
      lng: -0.1755
    }
  },
  
  // Full Geographic Hierarchy
  hierarchy: {
    level1: { code: 'GLOBAL', name: 'Global' },
    level2: { code: 'EU', name: 'Europe' },
    level3: { code: 'WEU', name: 'Western Europe' },
    level4: { code: 'GBR', name: 'United Kingdom', iso: 'GB' },
    level5: { code: 'LON', name: 'London' },
    level6: { code: 'WEST', name: 'Westminster' },
    level7: { code: 'EDG', name: 'Edgeware Road' },
    level8: { code: 'VIC-CAS-001', name: 'Victoria Casino' }
  },
  
  // Full Path String
  fullPath: 'Global/Europe/Western Europe/United Kingdom/London/Westminster/Edgeware Road/Victoria Casino',
  
  // Territory Assignment
  territory: {
    code: 'TERR-LON-WEST-EDG-001',
    name: 'Westminster Edgeware Territory',
    distributor: {
      id: 'dist_lon_001',
      name: 'London Central Distributor'
    },
    coverageType: 'exclusive'
  },
  
  // Can be used in queries
  queryPath: {
    'hierarchy.country': 'GBR',
    'hierarchy.city': 'LON',
    'hierarchy.district': 'WEST',
    'territory.code': 'TERR-LON-WEST-EDG-001'
  }
}
```

---

## 🔍 Query Examples

### Find All Locations in London
```sql
SELECT * FROM locations
WHERE city_id = (SELECT id FROM cities WHERE code = 'LON')
```

### Find All Territories in United Kingdom
```sql
SELECT * FROM territories
WHERE country_id = (SELECT id FROM countries WHERE iso_code = 'GBR')
```

### Find Distributor for Victoria Casino
```sql
SELECT d.* FROM distributors d
JOIN distributor_territories dt ON d.id = dt.distributor_id
JOIN territories t ON dt.territory_id = t.id
JOIN locations l ON l.id = t.location_id
WHERE l.code = 'VIC-CAS-001'
```

### Find All Orders in Westminster District
```sql
SELECT * FROM orders
WHERE delivery_location->>'district' = 'Westminster'
```

---

## 🎨 UI Component: Geographic Selector

```typescript
<GeographicHierarchySelector
  selectedPath={[
    'EU',           // Continent
    'WEU',          // Region
    'GBR',          // Country
    'LON',          // City
    'WEST',         // District
    'EDG',          // Area
    'VIC-CAS-001'   // Location
  ]}
  levels={['continent', 'region', 'country', 'city', 'district', 'area', 'location']}
  onChange={(path) => {
    setSelectedLocation({
      continent: path[0],
      region: path[1],
      country: path[2],
      city: path[3],
      district: path[4],
      area: path[5],
      location: path[6]
    })
  }}
/>
```

---

## 📊 Data Filtering Function

```typescript
function filterByGeographicScope<T>(
  items: T[],
  userScope: UserScope
): T[] {
  // Super admin sees everything
  if (userScope.geographic?.global) {
    return items
  }
  
  return items.filter(item => {
    const itemLocation = item.location || item.deliveryLocation
    
    // Check continent
    if (userScope.geographic?.continents?.length) {
      if (!userScope.geographic.continents.includes(itemLocation.continent)) {
        return false
      }
    }
    
    // Check country
    if (userScope.geographic?.countries?.length) {
      if (!userScope.geographic.countries.includes(itemLocation.country)) {
        return false
      }
    }
    
    // Check city
    if (userScope.geographic?.cities?.length) {
      if (!userScope.geographic.cities.includes(itemLocation.city)) {
        return false
      }
    }
    
    // Check territory
    if (userScope.geographic?.territories?.length) {
      if (!userScope.geographic.territories.includes(item.territory?.code)) {
        return false
      }
    }
    
    // Check specific location
    if (userScope.geographic?.locations?.length) {
      if (!userScope.geographic.locations.includes(itemLocation.code)) {
        return false
      }
    }
    
    return true
  })
}
```

---

## ✅ Where to Apply Geographic Hierarchy

1. ✅ **User Permissions** - Filter what users can see
2. ✅ **Orders** - Track delivery location
3. ✅ **Distributors** - Assign territories
4. ✅ **Territories** - Define coverage areas
5. ✅ **Inventory** - Warehouse locations
6. ✅ **Reports** - Filter by geography
7. ✅ **Analytics** - Geographic insights
8. ✅ **Sales** - Territory management
9. ✅ **Logistics** - Route planning
10. ✅ **CRM** - Customer location tracking

---

**This geographic hierarchy works everywhere in the CRM system!** 🌍

