# 🌍 Geographic Hierarchy System - Global to Local

## 📊 Geographic Hierarchy Structure

```
LEVEL 1: 🌐 GLOBAL
    │
    ├── LEVEL 2: CONTINENT (Europe, Asia, Americas, Africa, Oceania)
    │   │
    │   ├── LEVEL 3: REGION (Western Europe, Eastern Europe, etc.)
    │   │   │
    │   │   ├── LEVEL 4: COUNTRY (United Kingdom, France, Germany, etc.)
    │   │   │   │
    │   │   │   ├── LEVEL 5: CITY (London, Manchester, Birmingham, etc.)
    │   │   │   │   │
    │   │   │   │   ├── LEVEL 6: DISTRICT/AREA (Westminster, Camden, etc.)
    │   │   │   │   │   │
    │   │   │   │   │   └── LEVEL 7: SPECIFIC LOCATION
    │   │   │   │   │       (Victoria Casino, Edgeware Road, etc.)
    │   │   │   │   │
    │   │   │   │   └── TERRITORY (Distributor Coverage Area)
```

---

## 🗺️ Complete Example

```
🌐 GLOBAL
  └── 🌍 EUROPE
      └── 📍 WESTERN EUROPE
          └── 🇬🇧 UNITED KINGDOM
              └── 🏙️ LONDON
                  └── 📍 WESTMINSTER
                      └── 🏢 EDGWARE ROAD
                          └── 🎰 VICTORIA CASINO
                              └── 📦 DISTRIBUTOR: "London Central Distributor"
```

---

## 📋 Geographic Levels

| Level | Code | Example | Description |
|-------|------|---------|-------------|
| 1 | `global` | Global | Entire world |
| 2 | `continent` | Europe, Asia | Major continents |
| 3 | `region` | Western Europe | Sub-regions within continent |
| 4 | `country` | United Kingdom | Countries |
| 5 | `city` | London | Cities |
| 6 | `district` | Westminster | Districts/Areas within city |
| 7 | `location` | Victoria Casino | Specific locations |

---

## 🗄️ Database Schema

```sql
-- Geographic Hierarchy Tables

-- Level 1: Continents
CREATE TABLE continents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,  -- 'EU', 'AS', 'NA', etc.
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Level 2: Regions (within continents)
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  continent_id UUID REFERENCES continents(id),
  code VARCHAR(20) UNIQUE NOT NULL,  -- 'WEU', 'EEU', etc.
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Level 3: Countries
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  continent_id UUID REFERENCES continents(id),
  region_id UUID REFERENCES regions(id),
  iso_code VARCHAR(3) UNIQUE NOT NULL,  -- 'GBR', 'FRA', etc.
  name VARCHAR(100) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Level 4: Cities
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  population INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Level 5: Districts/Areas (within cities)
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  postal_codes TEXT[],  -- Array of postal codes
  boundaries JSONB,  -- GeoJSON for boundaries
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Level 6: Specific Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES districts(id),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  address TEXT,
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  location_type VARCHAR(50),  -- 'retailer', 'warehouse', 'distribution_point', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Territories (Distributor Coverage Areas)
CREATE TABLE territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,  -- 'TERR-LON-001', 'TERR-LON-EDG-001'
  name VARCHAR(200) NOT NULL,
  
  -- Geographic Scope (can be at any level)
  global BOOLEAN DEFAULT FALSE,
  continent_id UUID REFERENCES continents(id),
  region_id UUID REFERENCES regions(id),
  country_id UUID REFERENCES countries(id),
  city_id UUID REFERENCES cities(id),
  district_id UUID REFERENCES districts(id),
  location_id UUID REFERENCES locations(id),
  
  -- Coverage Details
  coverage_type VARCHAR(50),  -- 'full', 'partial', 'exclusive'
  boundaries JSONB,  -- GeoJSON polygon for territory boundaries
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link Distributors to Territories
CREATE TABLE distributor_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID REFERENCES distributors(id),
  territory_id UUID REFERENCES territories(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES portal_users(id),
  status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE
  UNIQUE (distributor_id, territory_id)
);

-- Geographic Hierarchy Path (for quick lookups)
CREATE TABLE geo_hierarchy_paths (
  location_id UUID PRIMARY KEY,
  global_path TEXT NOT NULL,  -- 'Global/Europe/Western Europe/UK/London/Westminster/Edgeware/Victoria Casino'
  level_1 UUID,  -- Global (always same)
  level_2 UUID,  -- Continent ID
  level_3 UUID,  -- Region ID
  level_4 UUID,  -- Country ID
  level_5 UUID,  -- City ID
  level_6 UUID,  -- District ID
  level_7 UUID   -- Location ID
);
```

---

## 🎯 Implementation Examples

### Example: Victoria Casino Location

```typescript
const victoriaCasino = {
  location: {
    id: 'loc-victoria-casino-001',
    name: 'Victoria Casino',
    code: 'VIC-CAS-001',
    address: 'Edgeware Road, Westminster',
    coordinates: { lat: 51.5155, lng: -0.1755 }
  },
  hierarchy: {
    global: 'Global',
    continent: { id: 'EU', name: 'Europe' },
    region: { id: 'WEU', name: 'Western Europe' },
    country: { id: 'GBR', name: 'United Kingdom', code: 'GB' },
    city: { id: 'LON', name: 'London' },
    district: { id: 'WEST', name: 'Westminster' },
    area: { id: 'EDG', name: 'Edgeware Road' },
    location: { id: 'VIC-CAS-001', name: 'Victoria Casino' }
  },
  fullPath: 'Global/Europe/Western Europe/United Kingdom/London/Westminster/Edgeware Road/Victoria Casino',
  territory: {
    code: 'TERR-LON-WEST-EDG-001',
    distributor: 'London Central Distributor',
    coverage: 'exclusive'
  }
}
```

---

## 🔧 Geographic Hierarchy Service

```typescript
// Geographic Hierarchy Service
class GeographicHierarchyService {
  
  // Get full hierarchy path for a location
  getFullPath(locationId: string): string {
    // Returns: "Global/Europe/Western Europe/UK/London/Westminster/Edgeware/Victoria Casino"
  }

  // Get parent locations at any level
  getParents(locationId: string, level: number) {
    // Returns all parent locations up to the specified level
  }

  // Get children at any level
  getChildren(parentId: string, level: number) {
    // Returns all children at the specified level
  }

  // Get all territories within a geographic scope
  getTerritoriesInScope(scope: {
    continent?: string,
    region?: string,
    country?: string,
    city?: string,
    district?: string
  }): Territory[] {
    // Returns all territories matching the scope
  }

  // Check if location is within territory
  isLocationInTerritory(locationId: string, territoryId: string): boolean {
    // Checks geographic containment
  }

  // Get distributor for a location
  getDistributorForLocation(locationId: string): Distributor | null {
    // Finds which distributor covers this location
  }
}
```

---

## 📊 Territory Definition Examples

### Example 1: City-Level Territory
```typescript
{
  code: 'TERR-LON-001',
  name: 'London Full Coverage',
  scope: {
    country: 'GBR',
    city: 'LON'
  },
  distributor: 'London Central Distributor',
  coverage: 'full'
}
```

### Example 2: District-Level Territory
```typescript
{
  code: 'TERR-LON-WEST-001',
  name: 'Westminster Coverage',
  scope: {
    country: 'GBR',
    city: 'LON',
    district: 'WEST'
  },
  distributor: 'London Central Distributor',
  coverage: 'exclusive'
}
```

### Example 3: Specific Location Territory
```typescript
{
  code: 'TERR-LON-EDG-VIC-001',
  name: 'Victoria Casino Territory',
  scope: {
    country: 'GBR',
    city: 'LON',
    district: 'WEST',
    location: 'VIC-CAS-001'
  },
  distributor: 'London Central Distributor',
  coverage: 'exclusive'
}
```

---

## 🌐 How This Applies Everywhere

### 1. **User Access & Data Filtering**

```typescript
// User scope includes geographic hierarchy
interface UserScope {
  userId: string
  role: string
  
  // Geographic Access
  global?: boolean  // Super admin
  continents?: string[]  // ['EU', 'AS']
  regions?: string[]  // ['WEU', 'EEU']
  countries?: string[]  // ['GBR', 'FRA']
  cities?: string[]  // ['LON', 'PAR']
  districts?: string[]  // ['WEST', 'CAM']
  
  // Territory Access
  territories?: string[]  // ['TERR-LON-001']
  locations?: string[]  // ['VIC-CAS-001']
}

// Filter data based on geographic scope
function filterDataByGeographicScope<T>(
  data: T[],
  userScope: UserScope
): T[] {
  if (userScope.global) return data
  
  return data.filter(item => {
    // Check if item's location matches user's scope
    if (userScope.countries && !userScope.countries.includes(item.country)) return false
    if (userScope.cities && !userScope.cities.includes(item.city)) return false
    if (userScope.districts && !userScope.districts.includes(item.district)) return false
    if (userScope.territories && !userScope.territories.includes(item.territory)) return false
    return true
  })
}
```

### 2. **Orders & Inventory**

```typescript
// Order includes full geographic hierarchy
interface Order {
  id: string
  orderNumber: string
  
  // Geographic Information
  deliveryLocation: {
    global: 'Global',
    continent: 'Europe',
    region: 'Western Europe',
    country: 'United Kingdom',
    city: 'London',
    district: 'Westminster',
    location: 'Victoria Casino',
    address: 'Edgeware Road, Westminster, London',
    coordinates: { lat: 51.5155, lng: -0.1755 }
  },
  
  // Territory Assignment
  territory: {
    code: 'TERR-LON-WEST-EDG-001',
    distributor: 'London Central Distributor'
  }
}
```

### 3. **Distributor Management**

```typescript
// Distributor assigned to territories
interface Distributor {
  id: string
  name: string
  
  // Geographic Coverage
  territories: [
    {
      code: 'TERR-LON-001',
      scope: {
        country: 'GBR',
        city: 'LON'
      },
      coverage: 'full'
    },
    {
      code: 'TERR-LON-WEST-001',
      scope: {
        country: 'GBR',
        city: 'LON',
        district: 'WEST'
      },
      coverage: 'exclusive'
    }
  ]
  
  // Specific Locations Covered
  locations: [
    'VIC-CAS-001',  // Victoria Casino
    'EDG-RET-002'   // Another location on Edgeware Road
  ]
}
```

### 4. **Reports & Analytics**

```typescript
// Reports can be filtered by any geographic level
interface ReportFilters {
  geographic: {
    level: 'global' | 'continent' | 'region' | 'country' | 'city' | 'district' | 'location'
    values: string[]  // Selected locations at that level
  }
}

// Example: Sales Report by Geographic Hierarchy
generateSalesReport({
  geographic: {
    level: 'city',
    values: ['LON', 'MAN', 'BIR']  // London, Manchester, Birmingham
  },
  dateRange: { start: '2025-01-01', end: '2025-01-31' }
})
```

### 5. **User Interface - Location Selector**

```typescript
// Hierarchical Location Selector Component
<GeographicSelector
  levels={['continent', 'region', 'country', 'city', 'district', 'location']}
  selectedPath={['EU', 'WEU', 'GBR', 'LON', 'WEST', 'EDG', 'VIC-CAS-001']}
  onChange={(path) => {
    // Update scope based on selected path
    setGeographicScope({
      continent: path[0],
      region: path[1],
      country: path[2],
      city: path[3],
      district: path[4],
      location: path[5]
    })
  }}
/>
```

---

## 🎯 Role-Based Geographic Access

### Super Admin
```typescript
{
  geographic: {
    global: true  // Access to everything
  }
}
```

### Country Manager
```typescript
{
  geographic: {
    countries: ['GBR', 'FRA', 'DEU']  // Only these countries
  }
}
```

### City Manager
```typescript
{
  geographic: {
    cities: ['LON', 'MAN']  // Only these cities
  }
}
```

### Sales Officer (Territory-Based)
```typescript
{
  geographic: {
    territories: ['TERR-LON-WEST-001', 'TERR-LON-CAM-001']
  }
}
```

### Distributor
```typescript
{
  geographic: {
    territories: ['TERR-LON-001'],  // Only their assigned territories
    locations: ['VIC-CAS-001', 'EDG-RET-002']  // Specific locations they serve
  }
}
```

---

## 📍 Territory Management UI

```
Territory Management Dashboard
├── Geographic Hierarchy View
│   ├── 🌐 Global
│   │   └── 🌍 Europe
│   │       └── 📍 Western Europe
│   │           └── 🇬🇧 United Kingdom
│   │               └── 🏙️ London
│   │                   └── 📍 Westminster
│   │                       └── 🎯 Edgeware Road
│   │                           └── 🎰 Victoria Casino
│   │                               └── 📦 London Central Distributor
│   │
│   └── Territory Actions
│       ├── Create Territory
│       ├── Assign Distributor
│       ├── Set Coverage Type
│       └── View Coverage Map
```

---

## 🔄 Data Flow Example

```
1. Order Created at Victoria Casino
   ↓
2. System Identifies Location Hierarchy:
   Global → Europe → Western Europe → UK → London → Westminster → Edgeware → Victoria Casino
   ↓
3. System Finds Territory: TERR-LON-WEST-EDG-001
   ↓
4. System Assigns Distributor: London Central Distributor
   ↓
5. Order Route Determined Based on Geographic Hierarchy
   ↓
6. Inventory Allocated from Nearest Warehouse in Same Geographic Scope
```

---

## ✅ Implementation Checklist

- [ ] Create geographic hierarchy tables
- [ ] Implement geographic hierarchy service
- [ ] Add geographic fields to all relevant entities (orders, distributors, territories)
- [ ] Create geographic selector UI component
- [ ] Implement geographic filtering in data queries
- [ ] Add geographic scope to user permissions
- [ ] Create territory management UI
- [ ] Implement geographic reporting
- [ ] Add map visualization for territories
- [ ] Create geographic analytics dashboard

---

This geographic hierarchy system ensures that every location, territory, and distributor relationship is properly mapped and can be filtered/analyzed at any level from global down to specific locations like Victoria Casino!

